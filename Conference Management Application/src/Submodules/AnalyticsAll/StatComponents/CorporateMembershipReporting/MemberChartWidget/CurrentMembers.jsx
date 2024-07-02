import React, { useState, useEffect, useContext, memo, useRef } from 'react'
import moment from 'moment';
import { MailFilled } from '@ant-design/icons';
import CommonSpinner from '@/CorporateMembershipReportingV2/common/CommonSpinner';
import DownloadChart from '@/CorporateMembershipReportingV2/common/DownloadChart';
import CustomExportCsv from '@/CorporateMembershipReportingV2/common/CustomExportCsv';
import { currentMemberHeaders, convertLowercaseFormat, sortGroupName, sortNumbers } from '@/AnalyticsAll/StatComponents/util';
import { Row, Col, Radio, Table, Modal, Typography, Button, Input, Select } from 'antd'
import { NoDataFound } from '@/CorporateMembershipReportingV2/common/NoDataFound';
import GlobalContext from '@/CorporateMembershipReportingV2/context/MemberContext';
import {useCurrentMemberDetails, useCurrentMemberInfoHook } from '@/CorporateMembershipReportingV2/hooks/Members'
import { MembersChart } from '@/CorporateMembershipReportingV2/MemberChartWidget/MembersChart';
import _map from 'lodash/map';
import MultiSelectWidget from '../common/MultiSelectWidget';

const { Option } = Select

const RenderMembersModal = memo(({
    showModal, 
    memberModal, 
    setShowModal, 
    setMemberModal, 
    MemberCount,
    memberData,
    groupId,
    type,
    signal,
    appdir,
    detailed,
    offset,  
    limit,
    setGroupId
}) => {
    const [memberDetails, setMemberDetails] = useState([])
    const [selectedTableData, setSelectedTableData]= useState([])
    const [searchValue, setSearchValue] = useState("")
    let { currentMembersDetails, memberLoading } = useCurrentMemberDetails(appdir, groupId, detailed, offset, limit, type, signal)

    useEffect(()=>{
        if(currentMembersDetails?.length){
            setMemberDetails(currentMembersDetails)
            setSelectedTableData(currentMembersDetails)
        }
    },[currentMembersDetails])

    const MemberDetailsColumn=[
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            className: "text-left",
            width: "8%",
            render: (_, data) => {
                return <div > {data.CompIDThisConfID} </div>
            },
        },
        {
            title: "Organization",
            dataIndex: "Companyname",
            key: "Companyname",
            className: "text-left",
            render: (_, data) => {
                return (
                    <div style={{ fontSize: '16px' }} >{data.Companyname ? data.Companyname : '-'}
                    </div>
                )
            },
        },
        {
            title: "City",
            dataIndex: "City",
            key: "City",
            className: "text-left",
            width: "10%",
            render: (_,data) => {
                return(
                    <div>{data.City ? data.City : '-'}</div>
                )
            }
        },
        {
            title: "State",
            dataIndex: "State",
            key: "State",
            className: "text-left",
            width: "10%",
            render: (_,data) =>{
                return(
                    <div>{data.State ? data.State : '-'}</div>
                )
            }
        },
        {
            title: "Country",
            dataIndex: "Country",
            key: "Country",
            className:"text-left",
            width: "10%",
            render: (_,data)=>{
                return(
                    <div>{data.Country ? data.Country : '-'}</div>
                )
            }
        },
        {
            title: "Action",
            dataIndex: "action",
            key: "action",
            width: '9%',
            className: "text-left",
            render: (_,data) => {
               return  <Button target="_blank" href={`https://www.xcdsystem.com/${appdir}/admin/company/managecompanies/index.cfm?CFGRIDKEY=${data.CompID}&view=profile`}> Manage </Button>
            },
        }
    ]

    const currentMemberHeader = [
        { label: "ID", key: "id" },
        { label: "Organization", key: "Company" },
        { label: "City", key: "City" },
        { label: "State", key: "State" },
        { label: "Country", key: "Country" }
    ]

    const handleCancel = () =>{
        setShowModal(false)
        setMemberModal(false)
        setSelectedTableData([])
        setGroupId("")
        setSearchValue("")
    }

    const onMemberSearch = searchValue => {
        searchValue = convertLowercaseFormat(searchValue.target.value);
        let searchResult = []
        if (searchValue) {
            searchResult = selectedTableData?.filter((mem)=>{return convertLowercaseFormat(`${mem?.Companyname}`).includes(searchValue.trim())})
        } else {
           searchResult = selectedTableData
        }
        setSearchValue(searchValue)
        setMemberDetails(searchResult)
    };

    const handleSendEmail = () =>{
        let reviewIds = _map(memberDetails, "CompIDThisConfID").join();
        window.parent.postMessage(
            { reviewIds, type: "Email"},
            "*"
        );
    }

    return(
        <div>
            {<Modal visible={showModal ? showModal : memberModal} title="Member Details" onCancel={handleCancel} footer={null} width='80%'>
                {memberModal && <div>
                        <div className="py-3 d-flex" style={{ fontSize: "15px"}}>
                            <Typography> {'CURRENT MEMBERS'} :</Typography>
                            <div className='ml-2' style={{color:'#0673b1', fontWeight:'bold'}}>{MemberCount}</div>
                        </div>
                </div>}
                {showModal&& <div className='d-flex'>
                    <div className="ml-3" style={{ fontSize: "16px"}}>
                        <Typography>Member Type</Typography>
                        <div style={{fontWeight:'bold'}}>{memberData.groupName}</div>
                    </div>
                    <div className="ml-4" style={{ fontSize: "16px"}}>
                        <Typography>Total Count</Typography>
                        <div style={{fontWeight:'bold'}}>{memberData.count}</div>
                    </div>
                </div>
                }
                <Row gutter={16} className='py-3'>
                    <Col flex={3}> <Input placeholder="Search" className="mr-3" allowClear style={{height:'34px'}} value={searchValue} onChange={onMemberSearch}></Input> </Col>
                    <Col> <Button icon={<MailFilled height="15px"/>} onClick={handleSendEmail}> Send Email </Button> </Col>
                    <Col>
                        <CustomExportCsv
                            dataSource={memberDetails?.map(data => {
                                return {
                                    id:data.CompIDThisConfID,
                                    Company:data.Companyname ? data.Companyname : '-',
                                    City:data.City ? data.City : '-',
                                    State:data.State ? data.State : '-',
                                    Country:data.Country ? data.Country : '-'
                                };
                            })}
                            Headers={currentMemberHeader}
                            exportFileName={"CURRENT MEMBERS"}
                        />
                    </Col>
                </Row>
                <Table dataSource={memberDetails} columns={MemberDetailsColumn} pagination={true} className='CurrentMemberTable' scroll={{y: 300}} loading={memberLoading} size="small"/>
            </Modal>}
        </div>
    )
})

const CurrentMembers = (props) => {
    const {membersGroup, setSelectedMembersGroups} = useContext(GlobalContext);

    const domEl = useRef();

    const { params: { groups_array, appdir }, type, signal } = props

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
    const [membersInfo, setMembersInfo]=useState({})

    let { currentMembersInfo, loading: currentMemberLoading } = useCurrentMemberInfoHook(appdir, groupid, type === CURRENT_MEMBERS, signal )

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
            title: "MEMBERS",
            dataIndex: "CountPerGroup",
            key: "CountPerGroup",
            render: (_, data) => {
                return <a onClick={() => handleTableClick(data)}><div className= "text-left">{data.CountPerGroup} </div></a>
            },
            sorter: (obj1, obj2) => sortNumbers(obj1, obj2, 'CountPerGroup'),
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
            totalCount += data.CountPerGroup
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
      setMemberData({ groupName:data?.GroupName,count:data?.CountPerGroup})
      setMembersInfo({ detailed:1, offset:0, limit:data?.CountPerGroup})
      setShowModal(true)
    }

    const handleTableClick = (data) =>{
        setGroupId(data.GroupID)
        setMemberData({ groupName:data?.GroupName,count:data?.CountPerGroup})
        setMembersInfo({detailed:1, offset:0, limit:data?.CountPerGroup})
        setShowModal(true)
    }

    const handleClick = () =>{
        let groupIds=[];
        let totalCount=0;
        membersGroup.map((grp)=>{
           groups_array.map((data)=>{
                if(data?.groupname === grp){
                    groupIds.push(data.groupid)
                }
                return data
            })
            return grp
        })
        dataSource.map((data)=>{
            totalCount+=data.CountPerGroup
        })
        setGroupId(groupIds)
        setMembersInfo({detailed:1, offset:0, limit:totalCount})
        setMemberModal(true)
    }
    
    const renderActionBar = () => {
        return (
            <div className='pt-2'>
                <div className='mt-3 mb-3 title' style={{ fontWeight: 100 }}>{"CURRENT MEMBERS"}: <a className='menuValues member-count' onClick={handleClick} style={{color:'#0673b1'}}> {MemberCount}</a></div>
                <Row gutter={16} className='mb-3 row-gap'>
                    <Col flex={3} className="title"> AS OF: <span style={{ fontWeight: "bold" }}>{moment().format('MM/DD/YYYY')}</span></Col>
                    <Col className='pl-20' >
                        <Radio.Group value={active} onChange={handleViewChange}>
                            <Radio.Button value='horizontal'>Horizontal</Radio.Button>
                            <Radio.Button value='vertical'>Vertical</Radio.Button>
                            <Radio.Button value='table'>Table</Radio.Button>
                        </Radio.Group>
                    </Col>
                    {active === "table" ? <Col>
                        <CustomExportCsv
                            dataSource={dataSource}
                            Headers={currentMemberHeaders}
                            exportFileName={"CURRENT MEMBERS"}
                        />
                    </Col> :
                        <Col>
                            <DownloadChart domEl={domEl} fileName={{ name: "Current Members", startDate: new Date() }} />
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
            return <MembersChart currentMembers={dataSource} isvertical={active === 'vertical' && true} handleChartClick={handleChartClick} domEl={domEl} />
        } 
        if(active === "table"){
            return ( <div className="py-2">
                <Table dataSource={dataSource} columns={memberColumn} pagination={false} className='salesTable' scroll={{ y: 300 }} rowKey={({GroupID}) => GroupID}/>
            </div> )
        } 
    }

    return (
        <CommonSpinner loading={currentMemberLoading} className='initialLoader'>
            <MultiSelectWidget 
                membersGroup={membersGroup}
                groupsArray={groups_array}
                setSelectedMembersGroups={setSelectedMembersGroups}
            />
            {renderActionBar()}
            {!currentMemberLoading && <div>
            {renderChartAndTable()}
            </div>}
            <RenderMembersModal 
                showModal={showModal} 
                memberModal={memberModal}
                groupId ={groupId }
                type ={type === CURRENT_MEMBERS}
                signal={signal}
                appdir={appdir}
                detailed={membersInfo.detailed}
                offset={membersInfo.offset}
                limit={membersInfo.limit}
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