import React, { useState, useEffect, createRef, useContext, memo, useRef } from 'react'
import moment from 'moment';
import { BarChartOutlined, MailFilled, TableOutlined, UserOutlined } from '@ant-design/icons';
import CommonSpinner from '@/MembershipReportingV2/common/CommonSpinner';
import DownloadChart from '@/MembershipReportingV2/common/DownloadChart';
import CustomExportCsv from '@/MembershipReportingV2/common/CustomExportCsv';
import MultiSelectWidget from '../common/MultiSelectWidget';
import { currentTotalMemberHeader, convertLowercaseFormat, sortGroupName, sortNumbers, sortName } from '@/AnalyticsAll/StatComponents/util';
import { Row, Col, Radio, Table, Modal, Typography, Button, Input, Select, Avatar } from 'antd'
import { NoDataFound } from '@/MembershipReportingV2/common/NoDataFound';
import GlobalContext from '@/MembershipReportingV2/context/MemberContext';
import {useCurrentMemberDetails, useCurrentMemberInfoHook } from '@/MembershipReportingV2/hooks/Members'
import { MembersChart } from '@/MembershipReportingV2/MemberChartWidget/MembersChart';
import _map from 'lodash/map';
import { dateFormat } from '../../util';
import clickableColumnHeader from './../common/ClickableColumnIcon';
import ClickableMemberCount from '../common/ClickableMemberCount';

const {Option} = Select

const RenderMembersModal = memo(({
    showModal, 
    memberModal, 
    setShowModal, 
    setMemberModal, 
    MemberCount,
    memberData,
    source_hex,
    groupId,
    type,
    signal,
    appdir,
    setGroupId
}) => {
    const [memberDetails, setMemberDetails] = useState([])
    const [selectedTableData, setSelectedTableData]= useState([])
    const [searchValue, setSearchValue] = useState("")
    const [primaryValue, setPrimaryValue] = useState("")
    const [groupIds, setGroupIds] = useState(groupId)
    let { currentMembersDetails, memberLoading } = useCurrentMemberDetails(source_hex, groupIds , type, signal)

    useEffect(()=>{
        if(currentMembersDetails?.length){
            setMemberDetails(currentMembersDetails)
            setSelectedTableData(currentMembersDetails)
        }
    },[currentMembersDetails, groupIds])

    useEffect(()=>{
        setPrimaryValue(memberData.GroupName)
        setGroupIds(groupId)
    },[memberData, groupId])


    const MemberDetailsColumn=[
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            className: "text-left",
            width:4,
            render: (_, data) => {
                return <div> {data.ReviewIDThisCustID} </div>
            },
        },
        {
            title: "Name",
            dataIndex: "user",
            key: "user",
            width: 13,
            className: "text-left",
            render: (_, data) => {
                return (
                    <div style={{ fontSize: '16px' }}>
                        <Row style={{ flexWrap: "nowrap", alignItems:'center' }}>
                            <Col>
                                <Avatar size={40} alt="profile" icon={<UserOutlined />} src={data?.Picture}/>
                            </Col>
                            <Col className="ml-3">
                                <div>{data?.Firstname} {data?.Lastname}</div>
                            </Col>
                        </Row>
                    </div>
                )
            },
            sorter:sortName
        },
        {
            title: "Organization",
            dataIndex: "Company",
            key: "Company",
            width: 12,
            render: (_, data) => {
                return <div> {data.Company ? data.Company : '-'} </div>
            },
        },
        {
            title: "Member Type",
            dataIndex: "GroupName",
            key: "GroupName",
            width: 11,
            className: "text-left",
            render: (_, data) => {
                return <div> {data.GroupName ? data.GroupName : '-'} </div>
            },
        },
        {
            title: "Joining Date",
            dataIndex: "MemberJoinDate",
            key: "MemberJoinDate",
            width: 8,
            className: "text-left",
            render: (_, data) => {
                return <div> {moment(data.MemberJoinDate).isValid() ? dateFormat(data.MemberJoinDate) : "-"}</div>
            },
        },
        {
            title: "Expiration Date",
            dataIndex: "ExpirationDate",
            key: "ExpirationDate",
            width: 8,
            className: "text-left",
            render: (_, data) => {
                return <div> {moment(data.ExpirationDate).isValid() ? dateFormat(data.ExpirationDate) : "-"}</div>
            },
        },
        {
            title: "Action",
            dataIndex: "action",
            key: "action",
            width: 8,
            className: "text-left",
            render: (_,data) => {
               return  <Button target="_blank" href={`https://www.xcdsystem.com/${appdir}/admin/contacts/managecontacts/index.cfm?CFGRIDKEY=${data.ReviewIDThisCustID}`}> Manage </Button>
            },
        }
    ]

    const handleCancel = () =>{
        setShowModal(false)
        setMemberModal(false)
        setSelectedTableData([])
        setSearchValue("")
        setGroupId("")
    }

    const onMemberSearch = searchValue => {
        searchValue = searchValue.target.value;
        let searchResult = []
        if (searchValue) {
            searchResult = selectedTableData?.filter((mem)=>{return convertLowercaseFormat(`${mem?.Firstname} ${mem?.Lastname}`).includes(convertLowercaseFormat(searchValue))})
        } else {
           searchResult = selectedTableData
        }
        setSearchValue(searchValue)
        setMemberDetails(searchResult)
    };

    const handleSendEmail = () =>{
        let reviewIds = _map(memberDetails, "ReviewIDThisCustID").join();
        window.parent.postMessage(
            { reviewIds, type: "Email"},
            "*"
        );
    }

    const handleSelect = (e) =>{
        setPrimaryValue(e)
        memberData.dataSource.map((data)=>{
            if(e === data.GroupName){
                setGroupIds(data.GroupID)
            }
            return data
        })

    }

    const renderSelect = () =>{
        return <div style={{ fontSize: "16px" }}>
        <Typography className='pb-2' >Member Type</Typography>
        <Select style={{ width: '130px' }} onChange={handleSelect} value={primaryValue} showSearch dropdownMatchSelectWidth={false} dropdownStyle={{width: '250px'}}>
            {memberData?.dataSource?.map((data) => {
                return <Option key={data.key} value={data?.GroupName} className="select-option" >{data?.GroupName}</Option>
            })}
        </Select>
    </div>
    }

    return(
        <div>
            {<Modal open={showModal ? showModal : memberModal} title="Member Details" onCancel={handleCancel} footer={null} width='80%'>
                {memberModal && <div>
                        <div className="py-3 d-flex" style={{ fontSize: "15px"}}>
                            <Typography> {'CURRENT MEMBERS'} :</Typography>
                            <div className='ml-2' style={{color:'#0673b1', fontWeight:'bold'}}>{MemberCount}</div>
                        </div>
                </div>}
                {showModal&& <div className='d-flex'>
                    {renderSelect()}
                    <div className="ml-4" style={{ fontSize: "16px"}}>
                        <Typography className='pb-2'>Total Count</Typography>
                        <div style={{fontWeight:'bold'}}>{memberDetails?.length}</div>
                    </div>
                </div>
                }
                <Row gutter={16} className='py-3'>
                    <Col flex={3}> <Input placeholder="Search" className="mr-3" allowClear style={{height:'34px'}} value={searchValue} onChange={onMemberSearch}></Input> </Col>
                    <Col> <Button icon={<MailFilled height="1px"/>} onClick={handleSendEmail}> Send Email </Button> </Col>
                    <Col>
                        <CustomExportCsv
                            dataSource={memberDetails?.map(data => {
                                return {
                                    user: `${data.Firstname} ${data.Lastname}`,
                                    id:data.ReviewIDThisCustID,
                                    Company:data.Company ? data.Company : '-',
                                    GroupName:data.GroupName,
                                    MemberJoinDate:moment(data.MemberJoinDate).isValid()? dateFormat(data.MemberJoinDate) : '',
                                    ExpirationDate:moment(data.ExpirationDate).isValid()? dateFormat(data.ExpirationDate) : '',
                                };
                            })}
                            Headers={currentTotalMemberHeader}
                            exportFileName={"CURRENT MEMBERS"}
                        />
                    </Col>
                </Row>
                <Table dataSource={memberDetails} columns={MemberDetailsColumn} pagination={true} className='CurrentMemberTable' scroll={{y: 450}} loading={memberLoading}/>
            </Modal>}
        </div>
    )
})

const CurrentMembers = (props) => {
    const {membersGroup, setSelectedMembersGroups,isGroups} = useContext(GlobalContext);

    const chartReference = createRef()

    const chartRef = useRef();

    const { params: { source_hex, groups_array, appdir, primary_color }, type, signal } = props

    const groupid = groups_array.map((data) => {
        return data.groupid
    })

    let CURRENT_MEMBERS = "CURRENT_MEMBERS";

    const [MemberCount, setMemberCount] = useState();
    const [active, setActive] = useState("horizontal");
    const [dataSource, setDataSource] = useState([]);
    const [groupId, setGroupId] = useState();
    const [showModal, setShowModal] = useState(false);
    const [memberModal, setMemberModal] = useState(false)
    const [memberData, setMemberData]= useState([])
    const [constructedData, setConstructedData] = useState([])

    let { currentMembersInfo, loading: currentMemberLoading } = useCurrentMemberInfoHook(source_hex, groupid, type === CURRENT_MEMBERS, signal )
     
    const memberColumn = [
        {
            title: <div className='primary-color'>GROUP NAME</div>,
            dataIndex: "GroupName",
            key: "GroupName",
            className: "text-left",
            width:'50%',
            render: (_, data) => {
                return <div> {data.GroupName} </div>
            },
            sorter: sortGroupName,
        },
        {
            title: <div className='primary-color'>{clickableColumnHeader("MEMBERS", "common-header-icon")}</div>,
            dataIndex: "TotalCount",
            key: "TotalCount",
            className: "text-left",
            width:'50%',
            render: (_, data) => {
                return <a onClick={() => handleTableClick(data)}> {data.TotalCount} </a>
            },
            sorter: (obj1, obj2) => sortNumbers(obj1, obj2, 'TotalCount'),
        },
    ];

    useEffect(()=>{
      if(currentMembersInfo?.length){
           setConstructedData(currentMembersInfo)
      }
    },[currentMembersInfo])

    const handleMemberDataBasedSelectedGroups = () => {
        let totalCount = 0;

        let membershipGroupData = membersGroup.map((data) => {
            return constructedData.filter(item => item?.GroupName.trim() === data.trim())
        }).flat();

        membershipGroupData?.forEach((data) => {
            totalCount += data.TotalCount
        })

        setMemberCount(totalCount)
        setDataSource(membershipGroupData);
        
    }

    useEffect(()=>{
        handleMemberDataBasedSelectedGroups()
    },[constructedData, membersGroup])

    const handleViewChange = (e) => {
        setActive(e.target.value)
    }

    const handleChartClick = ({data}) =>{
      setGroupId(data.GroupID)
      setMemberData({ GroupName:data?.GroupName,TotalCount:data?.TotalCount, dataSource: currentMembersInfo})
      setShowModal(true)
    }

    const handleTableClick = (data) =>{
        setGroupId(data.GroupID)
        setMemberData({ GroupName:data?.GroupName,TotalCount:data?.TotalCount, dataSource: currentMembersInfo})
        setShowModal(true)
    }

    const handleClick = () =>{
        let groupIds=[];
        membersGroup.map((grp)=>{
           groups_array.map((data)=>{
                if(data?.groupname === grp){
                    groupIds.push(data.groupid)
                }
                return data
            })
            return grp
        })
        setGroupId(groupIds)
        setMemberModal(true)
    }

    const currentMembersHeader = [
        { label: `GROUP NAME (${moment().format('MM/DD/YYYY')})`, key: "GroupName" },
        { label: "MEMBERS", key: "TotalCount" },
    ]

    const renderActionBar = () => {
        return (
            <div className='pt-2'>
                <ClickableMemberCount 
                    memberType="CURRENT MEMBERS"
                    handleClick={handleClick}
                    memberCount={MemberCount}
                    color='#0673b1'
                    className='member-count' 
                />
                <Row gutter={16} className='mb-3 row-gap'>
                    <Col flex={3} className="title"> AS OF: <span style={{ fontWeight: "bold" }}>{moment().format('MM/DD/YYYY')}</span></Col>
                    <Col className='pl-20'>
                        <Radio.Group value={active} onChange={handleViewChange}>
                            <Radio.Button value='horizontal'> <BarChartOutlined className="horizontal pr-1" /> Horizontal</Radio.Button>
                            <Radio.Button value='vertical'> <BarChartOutlined className="pr-1" /> Vertical</Radio.Button>
                            <Radio.Button value='table'> <TableOutlined className="pr-1" /> Table</Radio.Button>
                        </Radio.Group>
                    </Col>
                    {active === "table" ? <Col>
                        <CustomExportCsv
                            dataSource={dataSource}
                            Headers={currentMembersHeader}
                            exportFileName={"CURRENT MEMBERS"}
                        />
                    </Col> :
                        <Col>
                            <DownloadChart chartRef={chartRef} fileName={{ name: "Current Members", startDate: new Date() }} />
                        </Col>
                    }
                </Row>
            </div>
        )
    }

    const renderChartAndTable = () => {
        if(!dataSource.length > 0){
            return <NoDataFound/>
        }
        if((active === 'horizontal' || active === 'vertical')){
<<<<<<< HEAD
            return <MembersChart currentMembers={dataSource} chartRef={chartRef} isvertical={active === 'vertical' && true} handleChartClick={handleChartClick} primary_color={primary_color} height={'460px'} />
=======
            return <MembersChart currentMembers={dataSource} chartRef={chartRef} isvertical={active === 'vertical' && true} handleChartClick={handleChartClick} height={'460px'} />
>>>>>>> 869aae639d685259d1760f9199b6e8e54991839b
        } 
        if(active === "table"){
            return ( <div className="py-2" style={{ width: "100%" }}>
                <Table dataSource={dataSource} columns={memberColumn} pagination={false} className='salesTable' scroll={{ y: 450 }} rowKey={({GroupID}) => GroupID}/>
            </div> )
        } 
    }

    return (
        <CommonSpinner loading={currentMemberLoading} className='initialLoader'>
<<<<<<< HEAD
            <MultiSelectWidget
                groupsArray = {groups_array}
                membersGroup = {membersGroup}
                setSelectedMembersGroups = {setSelectedMembersGroups}
            />
=======
            {/* {renderGroupSelect()} */}
>>>>>>> 869aae639d685259d1760f9199b6e8e54991839b
            {renderActionBar()}
            {!currentMemberLoading && <div>
            {renderChartAndTable()}
            </div>}
            <RenderMembersModal 
                showModal={showModal} 
                memberModal={memberModal} 
                source_hex={source_hex}
                groupId ={groupId }
                type ={type === CURRENT_MEMBERS}
                signal={signal}
                appdir={appdir}
                MemberCount={MemberCount}
                memberData={memberData}
                setShowModal={setShowModal} 
                setMemberModal={setMemberModal}
                setGroupId={setGroupId} 
            />
        </CommonSpinner>
    )
}
export default CurrentMembers;