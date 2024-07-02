import React, { useState, useEffect, createRef,memo,useRef } from "react"
import { Button, Col, Modal, Radio, Row, Table, Typography, Input, Avatar, Select } from "antd"
import { BarChartOutlined, MailFilled, TableOutlined, UserOutlined } from "@ant-design/icons";
import moment from "moment";
import _map from 'lodash/map';
import CommonSpinner from '@/CorporateMembershipReportingV2/common/CommonSpinner';
import CustomExportCsv from '@/CorporateMembershipReportingV2/common/CustomExportCsv';
import DownloadChart from "@/CorporateMembershipReportingV2/common/DownloadChart";
import { sortGroupName, sortNumbers, sortName, currentMemberHeaders, currentTotalMemberHeader, convertLowercaseFormat } from "@/AnalyticsAll/StatComponents/util"
import { MembersChart } from "@/CorporateMembershipReportingV2/MemberChartWidget/MembersChart";
import {ErrorBoundary, ErrorFallback} from '@/CorporateMembershipReportingV2/common/errorBoundary'
import { useCurrentMemberHook } from '@/CorporateMembershipReportingV2/hooks/Home';
import { useCurrentMemberDetails } from '@/CorporateMembershipReportingV2/hooks/Members';
import { dateFormat } from "../util";
import clickableColumnHeader from '@/CorporateMembershipReportingV2/common/ClickableColumnIcon';

const {Option} = Select
const RenderMembersModal = memo(({
    showModal,
    setShowModal, 
    appdir,
    source_hex,
    groupId,
    signal,
    memberData
}) => {
    const [searchValue, setSearchValue] = useState("")
    const [memberDetails, setMemberDetails] =useState([])
    const [selectedTableData, setSelectedTableData]= useState([])
    const [primaryValue, setPrimaryValue] = useState("")
    const [groupIds, setGroupIds] = useState(groupId)

    let { currentMembersDetails, memberLoading } = useCurrentMemberDetails(source_hex, groupIds ,"CURRENT_MEMBERS", signal)

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

    const MemberDetailsColumn = [
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
            className: "text-left",
            width:13,
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
            width:12,
            render: (_, data) => {
                return <div> {data.Company ? data.Company : '-'} </div>
            },
        },
        {
            title: "Member Type",
            dataIndex: "GroupName",
            key: "GroupName",
            className: "text-left",
            width:11,
            render: (_, data) => {
                return <div> {data.GroupName ? data.GroupName : '-'} </div>
            },
        },
        {
            title: "Joining Date",
            dataIndex: "MemberJoinDate",
            key: "MemberJoinDate",
            className: "text-left",
            width:8,
            render: (_, data) => {
                return <div> {moment(data.MemberJoinDate).isValid() ? dateFormat(data.MemberJoinDate) : "-"} </div>
            },
        },
        {
            title: "Expiration Date",
            dataIndex: "ExpirationDate",
            key: "ExpirationDate",
            className: "text-left",
            width:8,
            render: (_, data) => {
                return <div> {moment(data.ExpirationDate).isValid() ? dateFormat(data.ExpirationDate) : "-"} </div>
            },
        },
        {
            title: "Action",
            dataIndex: "action",
            key: "action",
            className: "text-left",
            width:8,
            render: (_,data) => {
               return <Button target="_blank" href={`https://www.xcdsystem.com/${appdir}/admin/contacts/managecontacts/index.cfm?CFGRIDKEY=${data.ReviewIDThisCustID}`}> Manage </Button>
            },
        }
    ]

    const handleCancel =() =>{
        setShowModal(false)
        setSearchValue("")
        setSelectedTableData([])
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
            <Typography>Member Type</Typography>
            <Select style={{ width: '130px' }} onChange={handleSelect} value={primaryValue} showSearch dropdownMatchSelectWidth={false} dropdownStyle={{width: '250px'}}>
                {memberData?.dataSource?.map((data) => {
                    return <Option key={data.key} value={data?.GroupName} className="select-option" >{data?.GroupName}</Option>
                })}
            </Select>
        </div>
    }

    return(
        <div>
            {<Modal open={showModal} title="Member Details" onCancel={handleCancel} footer={null} width='80%'>
              <div className='d-flex'>
                   {renderSelect()}
                   <div className="ml-4" style={{ fontSize: "16px"}}>
                       <Typography>Total Count</Typography>
                       <div style={{fontWeight:'bold'}}>{memberDetails?.length}</div>
                   </div>
               </div>
               <Row gutter={16} className='py-3'>
                   <Col flex={3}> <Input placeholder="Search" className="mr-3" allowClear style={{height:'34px'}} value={searchValue} onChange={onMemberSearch} ></Input> </Col>
                   <Col> <Button icon={<MailFilled height="15px"/>} onClick={handleSendEmail}> Send Email </Button> </Col>
                   <Col>
                       <CustomExportCsv
                           dataSource={memberDetails?.map(data => {
                               return {
                                   user: `${data.Firstname} ${data.Lastname}`,
                                   id:data.ReviewIDThisCustID,
                                   Company:data.Company ? data.Company : '-',
                                   GroupName:data.GroupName,
                                   MemberJoinDate:moment(data.MemberJoinDate).isValid() ? dateFormat(data.MemberJoinDate) : '',
                                   ExpirationDate:moment(data.ExpirationDate).isValid() ? dateFormat(data.ExpirationDate) : '',
                               };
                           })}
                           Headers={currentTotalMemberHeader}
                           exportFileName={"CurrentMember"}
                       />
                   </Col>
               </Row>
               <Table dataSource={memberDetails} columns={MemberDetailsColumn} pagination={true} className='CurrentMemberTable' scroll={{y: 450}} loading={memberLoading}/>
           </Modal>}
       </div>
   )
})

export const CurrentMembers = (props) => {
    const { params: { source_hex, groups_array, appdir, primary_color }, signal } = props
    const chartReference = createRef()

    const domEl = useRef()

    const groupid = groups_array.map((data) => {
        return data.groupid
    })

    const [activeTab, setActiveTab] = useState('horizontal')
    const [dataSource, setDataSource] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [groupId, setGroupId] =useState()
    const [memberData, setMemberData]= useState([])
    
    let { currentMembers, loading } = useCurrentMemberHook(source_hex, "CURRENT_MEMBERS", signal)

    const memberColumn = [
        {
            title: "GROUP NAME",
            dataIndex: "GroupName",
            key: "GroupName",
            render: (_, data) => {
                return <div className= "text-left"> {data.GroupName} </div>
            },
            sorter: sortGroupName,
        },
        {
            title: clickableColumnHeader("MEMBERS", "common-header-icon"),
            dataIndex: "TotalCount",
            key: "TotalCount",
            className: "text-left",
            render: (_, data) => {
                return <a onClick={()=>handleTableClick(data)}><div className= "text-left">{data.CountPerGroup}</div></a>
            },
            sorter: (obj1, obj2) => sortNumbers(obj1, obj2, 'CountPerGroup'),
        },
    ];

    const handleClick = (e) => {
        setActiveTab(e.target.value)
    }

    const handleTableClick = (data) =>{
        setGroupId(data.GroupID)
        setMemberData({ GroupName:data?.GroupName,TotalCount:data?.TotalCount, dataSource: currentMembers})
        setShowModal(true)
    }

    useEffect(() => {
        if (currentMembers?.length) {
            setDataSource(currentMembers)
        }
    }, [currentMembers])

    const handleChartClick = ({data}) =>{
        setGroupId(data.GroupID)
        setMemberData({ GroupName:data?.GroupName,TotalCount:data?.TotalCount, dataSource: currentMembers})
        setShowModal(true)
    }

    const Test =()=>{
        throw new Error("error")
    } 
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}> 
            {/* <Test /> */}
            <CommonSpinner loading={loading}>
                <div style={{padding:'10px'}}>
                    <Row gutter={16}>
                        <Col flex={3} className='title ml-2'>{'ACTIVE MEMBERSHIP'}</Col>
                        <Col>
                            <Radio.Group value={activeTab} onChange={handleClick}>
                            <Radio.Button value='horizontal'> <BarChartOutlined className="horizontal pr-1" /> Horizontal</Radio.Button>
                            <Radio.Button value='vertical'> <BarChartOutlined className="pr-1" /> Vertical</Radio.Button>
                            <Radio.Button value='table'> <TableOutlined className="pr-1" /> Table</Radio.Button>
                            </Radio.Group>
                        </Col>
                        { dataSource?.length && activeTab === "table" ? <Col>
                            <CustomExportCsv
                                dataSource={dataSource.map(({CountPerGroup,...rest }) => ({...rest, TotalCount: CountPerGroup }))}
                                Headers={currentMemberHeaders}
                                exportFileName="Current Total Members"
                            />
                        </Col> : ''}
                        { currentMembers?.length && activeTab !== 'table' ?
                            <Col>
                                <DownloadChart chartRef={chartReference} fileName={{ name: "Current Total Members", startDate: new Date() }} domEl={domEl} />
                            </Col> : ''
                        }
                    </Row>
                    {(activeTab === "horizontal" || activeTab === "vertical") && <div>
                        <MembersChart currentMembers={currentMembers} isvertical={activeTab === "vertical" && true} chartRef={chartReference} handleChartClick={handleChartClick} domEl={domEl}  primary_color={ primary_color} height={'400px'}/>
                    </div>}
                    {activeTab === "table" && <div className="pa-6">
                        <Table dataSource={dataSource} columns={memberColumn} pagination={false} className='salesTable' 
                            scroll={{ y: 300 }} 
                            rowKey={({GroupID}) => GroupID}
                        />
                    </div>}
                    <div className="py-2 ml-6">
                        <Button className="exploreMore" onClick={() => props.handleExplore('members')}> <span style={{ textDecoration: 'underline' }}> Explore More </span></Button>
                    </div>
                    <RenderMembersModal 
                        showModal={showModal} 
                        setShowModal={setShowModal} 
                        appdir={appdir}  
                        source_hex={source_hex}
                        groupId ={groupId }
                        signal={signal}
                        memberData={memberData}
                    />
                </div>
            </CommonSpinner>
        </ErrorBoundary>
    )
}