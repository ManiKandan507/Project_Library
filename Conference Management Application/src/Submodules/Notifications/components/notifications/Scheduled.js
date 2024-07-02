import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import "./Notification.css";
import moment from "moment-timezone";
import { Pagination } from 'antd';
import {  Table, Tag, Space, Select, Tooltip  } from 'antd';
import "antd/dist/antd.css";
import {
  MobileOutlined,
  LaptopOutlined,
  PushpinOutlined
} from '@ant-design/icons';

const { Option } = Select;

const Scheduled = ({
  config,
  posts,
  deletePost,
  type,
  onEdit
}) => {
  const [postList, setpostList] = useState(false);
  const [filteredPostList, setFilteredPostList] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(false);
  const [dayFilter, setDayFilter] = useState([]);
  const [selectedDay, setSelectedDay] = useState(false);
  const dateformat = "YYYY-MM-DD HH:mm A";
  const sortFunction = (a, b) => moment(a.actualFireTS) - moment(b.actualFireTS);
  const sortDescendingFunction = (a, b) => moment(b.actualFireTS) - moment(a.actualFireTS);
  useEffect(() => {
    if(posts && posts.length>0){
     
      let fileredPosts;
      if(type=="scheduled"){
        
        fileredPosts = posts.filter(post => post.post_object.type != 'instant' && post.post_object.startTime > moment().valueOf());
        fileredPosts = fileredPosts.sort(sortFunction);
        setpostList(fileredPosts);
        setFilteredPostList(fileredPosts);
      }
      else{
        fileredPosts = posts.filter(post => (post.post_object.type != 'instant' && post.post_object.startTime <= moment().valueOf()) || post.post_object.type == 'instant' || !post.post_object.type);
        fileredPosts = fileredPosts.sort(sortDescendingFunction);
        setpostList(fileredPosts);
        setFilteredPostList(fileredPosts);
      }
      generateDateFilter(fileredPosts);
    }
    else{
      setpostList([]);
    }
  }, [posts, type]);

  const onDelete = (post) => {
    let payload = {
      source_hex: config.source_hex,
      conferenceid: config.conferenceid,
      id: post._id
    }
    deletePost(payload);
  };

  useEffect(() => {
    if(postList?.length>0){
      let posts = JSON.parse(JSON.stringify(postList))
      if(selectedPlatform && selectedPlatform!=='all'){
        posts = posts.filter(post => post.post_object?.platform==selectedPlatform)
      }
      if(selectedDay && selectedDay!=='all'){
        let start = selectedDay.split('-')[0];
        let end = selectedDay.split('-')[1];
        posts = posts.filter(post => post.actualFireTS >= start && post.actualFireTS < end)
      }
      setFilteredPostList(posts)
    }
    

  },[selectedPlatform, selectedDay])

  const generateDateFilter = (posts) => {
    let datesArray = [];
    posts.map((obj) => {
      if(obj.actualFireTS) {
          let key = moment.unix(obj.actualFireTS / 1000).format("ddd, MMM DD");
          let start_of_day = moment.unix(obj.actualFireTS / 1000).startOf('day').format('x');
          let end_of_day = (start_of_day / 1000 + 24 * 60 * 60) * 1000;
          if(!datesArray.some(day => day.key==key)){
            datesArray.push({'key': key, 'start': start_of_day, 'end': end_of_day});
          }
      }
    })
    setDayFilter(datesArray)
  }

  const renderMobile = () => {
    return(
      <Tooltip title="Mobile" color={"#fff"} key={"mobile"} overlayInnerStyle={{color:'#000'}}>
        <div className="col-sm-2">
          <MobileOutlined style={{ fontSize: '20px', color: '#08c' }}/>
        </div>
      </Tooltip>
    )
  }
  const renderWeb = () => {
    return(
      <Tooltip title="Web" color={"#fff"} key={"web"} overlayInnerStyle={{color:'#000'}}>
        <div className="col-sm-2">
          <LaptopOutlined style={{ fontSize: '20px', color: '#08c' }}/>
        </div>
      </Tooltip>
    )
  }

  const columns = [
    {
      title: 'Title',
      dataIndex: ['post_object', 'title'],
      key: 'title',
      render: text => <div>{text}</div>
    },
    {
      title: 'Platform',
      dataIndex: ['post_object', 'platform'],
      key: 'platform',
      render: platform =>(
        platform=='mobile_and_web' ? 
        <div>
          {renderMobile()}
          {renderWeb()}
        </div>
       : platform=='mobile' ? <div>{renderMobile()}</div> :
       <div>{renderWeb()}</div>
      )
    },
    {
      title: 'Tags',
      dataIndex: ['post_object', 'tags'],
      key: 'tags',
      render: tags => {
        return(
        <>
          {tags && tags.map((tag, index) => {
            let color = index % 2 ? 'geekblue' : 'green';
            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
        </>
      )},
    },
    {
      title: 'Pinned',
      dataIndex: ['post_object', 'isSticky'],
      key: 'pinned',
      render: isSticky => (
        isSticky ? <div><PushpinOutlined style={{ fontSize: '20px', color: '#08c' }}/></div> : null
      )
    },
    {
      title: 'Date',
      dataIndex: ['actualFireTS'],
      key: 'pinned',
      sorter: (a, b) => a.actualFireTS - b.actualFireTS,
      render: startTime => (
        <div>
          <div>
            {
              startTime && 
              moment(startTime).isValid() && 
              moment(startTime).tz(config.timezone).format('MMMM Do YYYY')
            }
          </div>
          <div>
            {
               startTime && 
               moment(startTime).isValid() && 
               moment(startTime).tz(config.timezone).format('h:mm A')
            }
          </div>
          <p>{config.timezone}</p>
        </div>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <div 
            className="col-sm-5 cursor" 
            onClick={() => onEdit(record)}>
            <i class="fa fa-pencil-square-o fa-lg" aria-hidden="true"></i>
          </div>
          <div 
            className="col-sm-5 cursor" 
            onClick={() => onDelete(record)}>
            <i class="fa fa-trash fa-lg" aria-hidden="true"></i>
          </div>
        </Space>
      ),
    },
  ];

  const renderPlatformFilter = () => {
    return(
      <Select
        placeholder="Select Platform"
        optionFilterProp="children"
        onChange={(item) => {setSelectedPlatform(item)}}
        dropdownMatchSelectWidth={false}
        style={{minWidth:150}}
      >
        <Option value="all">All</Option>
        <Option value="mobile_and_web">Mobile & Web</Option>
        <Option value="mobile">Mobile Only</Option>
        <Option value="web">Web Only</Option>
      </Select>
    )
  }

  const renderDayFilter = () => {
    return(
      <Select
        placeholder="Select Day"
        optionFilterProp="children"
        onChange={(item) => {setSelectedDay(item)}}
        dropdownMatchSelectWidth={false}
        style={{minWidth:150}}
      >
        <Option value="all">All</Option>
        {dayFilter.map(day => (
           <Option value={`${day.start}-${day.end}`}>{day.key}</Option>
        ))
        }
      </Select>
    )
  }
  
  return (
    <div className="app-container">
      {postList?.length>0 && 
        <div>
          <div className="col-sm-3 col-md-3 mb-10">{renderPlatformFilter()}</div>
          <div className="col-sm-2 col-md-3 mb-10">{renderDayFilter()}</div>
          <Table size={"small"} columns={columns} dataSource={filteredPostList} pagination={{pageSize:10, position:['bottomCenter']}}/>
        </div>
      }
      {postList.length==0 &&
        <div className="nopost">No posts to display</div>
      }
      </div>
      
  );
}

const mapStateToProps = (state) => {
  return {
    posts: state.post.posts,
    savePostError: state.post.saveError,
  };
};

const mapDispatchToProps = (dispatch) => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Scheduled);
