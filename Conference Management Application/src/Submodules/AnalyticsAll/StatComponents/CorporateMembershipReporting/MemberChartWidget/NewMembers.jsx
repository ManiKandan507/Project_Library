import React, { useState, useEffect, useContext, memo } from 'react'
import _map from 'lodash/map';
import CommonSpinner from '@/CorporateMembershipReportingV2/common/CommonSpinner';
import DownloadChart from '@/CorporateMembershipReportingV2/common/DownloadChart';
import CommonDatePicker from '@/CorporateMembershipReportingV2/common/CommonDatePicker';
import CustomExportCsv from '@/CorporateMembershipReportingV2/common/CustomExportCsv';
import { currentMemberHeaders, convertLowercaseFormat, get90PriorDate, getCurrentDate, sortGroupName, sortNumbers } from '@/AnalyticsAll/StatComponents/util';
import { Row, Col, Radio, Table, Modal, Typography, Button, Input } from 'antd'
import { MailFilled } from '@ant-design/icons';
import { NoDataFound } from '@/CorporateMembershipReportingV2/common/NoDataFound';
import GlobalContext from '@/CorporateMembershipReportingV2/context/MemberContext';
import { useNewMembersHook, useNewMemberDetails } from '@/CorporateMembershipReportingV2/hooks/Members'
import { MembersChart } from '@/CorporateMembershipReportingV2/MemberChartWidget/MembersChart';
import MultiSelectWidget from '../common/MultiSelectWidget';
import { useRef } from 'react';
import moment from 'moment';

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
    dates,
    setGroupId
}) => {
    const [memberDetails, setMemberDetails] = useState([])
    const [selectedTableData, setSelectedTableData]= useState([])
    const [searchValue, setSearchValue] = useState("")
    let { newMembersDetails, newMemLoading } = useNewMemberDetails(appdir, groupId, dates[0],dates[1],detailed, offset, limit, type, signal)

    useEffect(()=>{
        if(newMembersDetails?.length){
            setMemberDetails(newMembersDetails)
            setSelectedTableData(newMembersDetails)
        }
    },[newMembersDetails])

    const MemberDetailsColumn=[
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: '8%',
            className: "text-left",
            render: (_, data) => {
                return <div> {data.CompIDThisConfID} </div>
            },
        },
        {
            title: "Organization",
            dataIndex: "Companyname",
            key: "Companyname",
            className: "text-left",
            render: (_, data) => {
                return (
                    <div style={{ fontSize: '16px' }}> {data.Companyname ? data.Companyname : '-'}
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
            render:(_,data)=>{
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
            render: (_,data) => {
                return(
                    <div>{data.State ? data.State : '-'}</div>
                )
            }
        },
        {
            title: "Country",
            dataIndex: "Country",
            key: "Country",
            className: "text-left",
            width: "10%",
            render: (_,data) =>{
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
               return <Button target="_blank" href={`https://www.xcdsystem.com/${appdir}/admin/company/managecompanies/index.cfm?CFGRIDKEY=${data.CompID}&view=profile`}> Manage </Button>
            },
        }
    ]

    const newMemberHeader = [
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
        setSearchValue("")
        setGroupId('')
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
                            <Typography> {"NEW MEMBERS"} :</Typography>
                            <div className='ml-2' style={{color:"#52c41a", fontWeight:'bold'}}>{MemberCount}</div>
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
                                    State: data.State ? data.State : '-',
                                    Country: data.Country ? data.Country : '-'
                                };
                            })}
                            Headers={newMemberHeader}
                            exportFileName={"NEW MEMBERS"}
                        />
                    </Col>
                </Row>
                <Table dataSource={memberDetails} columns={MemberDetailsColumn} pagination={true} className='CurrentMemberTable' scroll={{y: 300}} loading={newMemLoading} size="small"/>
            </Modal>}
        </div>
    )
})

const NewMembers = (props) => {
    const {membersGroup, setSelectedMembersGroups} = useContext(GlobalContext);

    const domEl = useRef();

    const { params: { groups_array, appdir }, type, signal } = props

    const groupid = groups_array.map((data) => {
        return data.groupid
    })

    let NEW_MEMBERS = "NEW_MEMBERS";

    const [MemberCount, setMemberCount] = useState();
    const [active, setActive] = useState("horizontal");
    const [dataSource, setDataSource] = useState([]);
    const [groupId, setGroupId] = useState();
    const [showModal, setShowModal] = useState(false);
    const [memberModal, setMemberModal] = useState(false)
    const [memberData, setMemberData]= useState([])
    const [newMemInfo, setNewMemInfo]= useState({})

    const [constructedData, setConstructedData] = useState([])
    const [dates, setDates] = useState([get90PriorDate(),getCurrentDate()]);

    let { newMembers, loading:newMemberLoading} = useNewMembersHook(appdir, groupid, dates[0],dates[1], type === NEW_MEMBERS, signal)

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
                return <a onClick={() => handleTableClick(data)}><div className= "text-left"> {data.CountPerGroup}</div></a>
            },
            sorter: (obj1, obj2) => sortNumbers(obj1, obj2, 'CountPerGroup'),
        },
    ];

 

    useEffect(()=>{
        if(newMembers?.length){
            setConstructedData(newMembers)
        }
    },[newMembers])

    const handleMemberDataBasedSelectedGroups = () => {
        let totalCount = 0;

        let membershipGroupData = membersGroup.map((data) => {
            return constructedData.filter(item => item?.GroupName.trim() == data.trim())
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

    const handleDate = (value, dateStrings) => {
        setDates([ dateStrings?.[0], dateStrings?.[1] ]);
    }
    

    const handleChartClick = ({data}) =>{
      setGroupId(data.GroupID)
      setMemberData({ groupName:data?.GroupName,count:data?.CountPerGroup})
      setNewMemInfo({detailed:1, offset:0, limit:data?.CountPerGroup})
      setShowModal(true)
    }

    const handleTableClick = (data) =>{
        setGroupId(data.GroupID)
        setMemberData({ groupName:data?.GroupName,count:data?.CountPerGroup})
        setNewMemInfo({detailed:1, offset:0, limit:data?.CountPerGroup})
        setShowModal(true)
    }

    const handleClick = () =>{
        let groupIds=[];
        let totalCount = 0;
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
            totalCount += data.CountPerGroup
        })
        setNewMemInfo({detailed:1, offset:0, limit:totalCount})
        setGroupId(groupIds)
        setMemberModal(true)
    }

    const renderActionBar = () => {
        return (
            <div className='pt-2'>
                <div className='mt-3 mb-3 title' style={{ fontWeight: 100 }}> {"NEW MEMBERS"} : <a className='menuValues member-count' onClick={handleClick} style={{color:"#52c41a"}}> {MemberCount}</a></div>
                <Row gutter={16} className='mb-3 row-gap'>
                    <Col flex={3} className="title"> WITHIN: <span><CommonDatePicker handleDate={handleDate}/></span> </Col>
                    <Col className='pl-20'>
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
                            exportFileName={"NEW MEMBERS"}
                        />
                    </Col> :
                        <Col>
                            <DownloadChart domEl={domEl} fileName={{ name: "New Members", startDate: moment(dates[0], 'DD-MM-YYYY').format('MM/DD/YYYY'), endDate: moment(dates[1], 'DD-MM-YYYY').format('MM/DD/YYYY')}} />
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
            return <MembersChart currentMembers={dataSource} isvertical={active === 'vertical' && true} handleChartClick={handleChartClick} domEl={domEl}/>
        } 
        if(active === "table"){
            return ( <div className="py-2">
                <Table dataSource={dataSource} columns={memberColumn} pagination={false} className='salesTable' scroll={{ y: 300 }} />
            </div> )
        } 
    }


    return (
        <CommonSpinner loading={newMemberLoading} className="initialLoader">
            <MultiSelectWidget 
                membersGroup={membersGroup}
                groupsArray={groups_array}
                setSelectedMembersGroups={setSelectedMembersGroups}
            />
                {renderActionBar()}
            { !newMemberLoading && <div>
                {renderChartAndTable()}
            </div>}
            <RenderMembersModal 
                showModal={showModal} 
                memberModal={memberModal}
                groupId ={groupId }
                type ={type === NEW_MEMBERS}
                signal={signal}
                appdir={appdir}
                detailed={newMemInfo.detailed}
                offset={newMemInfo.offset}
                limit={newMemInfo.limit}
                MemberCount={MemberCount}
                memberData={memberData}
                setShowModal={setShowModal} 
                setMemberModal={setMemberModal} 
                dates={dates}
                setGroupId={setGroupId}
            />
        </CommonSpinner>
    )
}
export default NewMembers;