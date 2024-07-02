import React, { useState, useEffect, useContext, memo, useRef } from 'react'
import moment from 'moment';
import { MailFilled } from '@ant-design/icons';
import CommonSpinner from '@/CorporateMembershipReportingV2/common/CommonSpinner';
import DownloadChart from '@/CorporateMembershipReportingV2/common/DownloadChart';
import CommonDatePicker from '@/CorporateMembershipReportingV2/common/CommonDatePicker';
import CustomExportCsv from '@/CorporateMembershipReportingV2/common/CustomExportCsv';
import { currentMemberHeaders, convertLowercaseFormat, get90PriorDate, sortGroupName, sortNumbers } from '@/AnalyticsAll/StatComponents/util';
import { Row, Col, Radio, Table, Modal, Typography, Button, DatePicker, Input } from 'antd'
import { NoDataFound } from '@/CorporateMembershipReportingV2/common/NoDataFound';
import GlobalContext from '@/CorporateMembershipReportingV2/context/MemberContext';
import { useExpiredMemberHook, useExpiredMemDetailsHook } from '@/CorporateMembershipReportingV2/hooks/Members'
import { MembersChart } from '@/CorporateMembershipReportingV2/MemberChartWidget/MembersChart';
import _map from 'lodash/map';
import MultiSelectWidget from '../common/MultiSelectWidget';

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
    activeDatePicker,
    setGroupId
}) => {
    const [searchValue, setSearchValue] = useState("")
    const [memberDetails, setMemberDetails] = useState([])
    const [selectedTableData, setSelectedTableData] = useState([])
    let { expMemberDetails, memLoading } = useExpiredMemDetailsHook(appdir, groupId, dates, activeDatePicker, detailed, offset, limit, type, signal)

    useEffect(() => {
        if (expMemberDetails?.length) {
            setMemberDetails(expMemberDetails)
            setSelectedTableData(expMemberDetails)
        }
    }, [expMemberDetails])

    const ExpiredMemberHeader = [
        { label: "ID", key: "id" },
        { label: "Organization", key: "Company" },
        { label: "City", key: "City" },
        { label: "State", key: "State" },
        { label: "Country", key: "Country" }
    ]

    const MemberDetailsColumn = [
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
                    <div style={{ fontSize: '16px' }} > {data.Companyname ? data.Companyname : '-'}
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
            render: (_, data) => {
                return (
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
            render: (_, data) => {
                return (
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
            render: (_, data) => {
                return (
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
            render: (_, data) => {
                return <Button target="_blank" href={`https://www.xcdsystem.com/${appdir}/admin/company/managecompanies/index.cfm?CFGRIDKEY=${data.CompID}&view=profile`} > Manage </Button>
            },
        }
    ]

    const handleCancel = () => {
        setShowModal(false)
        setMemberModal(false)
        setSelectedTableData([])
        setSearchValue("")
        setGroupId("")
    }

    const onMemberSearch = searchValue => {
        searchValue = convertLowercaseFormat(searchValue.target.value);
        let searchResult = []
        if (searchValue) {
            searchResult = selectedTableData?.filter((mem) => { return convertLowercaseFormat(`${mem?.Companyname}`).includes(searchValue.trim()) })
        } else {
            searchResult = selectedTableData
        }
        setSearchValue(searchValue)
        setMemberDetails(searchResult)
    };

    const handleSendEmail = () => {
        let reviewIds = _map(memberDetails, "CompIDThisConfID").join();
        window.parent.postMessage(
            { reviewIds, type: "Email" },
            "*"
        );
    }

    return (
        <div>
            {<Modal visible={showModal ? showModal : memberModal} title="Member Details" onCancel={handleCancel} footer={null} width='80%'>
                {memberModal && <div>
                    <div className="py-3 d-flex" style={{ fontSize: "15px" }}>
                        <Typography> {"EXPIRED MEMBERS"} :</Typography>
                        <div className='ml-2' style={{ color: "#f5222d", fontWeight: 'bold' }}>{MemberCount}</div>
                    </div>
                </div>}
                {showModal && <div className='d-flex'>
                    <div className="ml-3" style={{ fontSize: "16px" }}>
                        <Typography>Member Type</Typography>
                        <div style={{ fontWeight: 'bold' }}>{memberData.groupName}</div>
                    </div>
                    <div className="ml-4" style={{ fontSize: "16px" }}>
                        <Typography>Total Count</Typography>
                        <div style={{ fontWeight: 'bold' }}>{memberData.count}</div>
                    </div>
                </div>
                }
                <Row gutter={16} className='py-3'>
                    <Col flex={3}> <Input placeholder="Search" className="mr-3" allowClear style={{ height: '34px' }} value={searchValue} onChange={onMemberSearch}></Input> </Col>
                    <Col> <Button icon={<MailFilled height="15px" />} onClick={handleSendEmail}> Send Email </Button> </Col>
                    <Col>
                        <CustomExportCsv
                            dataSource={memberDetails?.map(data => {
                                return {
                                    id: data.CompIDThisConfID,
                                    Company: data.Companyname ? data.Companyname : '-',
                                    City: data.City ? data.City : '-',
                                    State: data.State ? data.State : '-',
                                    Country: data.Country ? data.Country : '-'
                                };
                            })}
                            Headers={ExpiredMemberHeader}
                            exportFileName={"EXPIRED_MEMBERS"}
                        />
                    </Col>
                </Row>
                <Table dataSource={memberDetails} columns={MemberDetailsColumn} pagination={true} className='CurrentMemberTable' scroll={{ y: 300 }} loading={memLoading} size="small" />
            </Modal>}
        </div>
    )
})

const ExpiredMembers = (props) => {
    const { membersGroup, setSelectedMembersGroups } = useContext(GlobalContext);

    const domEl = useRef();

    const { params: { groups_array, appdir }, type, signal } = props
    const groupid = groups_array.map((data) => {
        return data.groupid
    })

    let EXPIRED_MEMBERS = "EXPIRED_MEMBERS";

    const [MemberCount, setMemberCount] = useState();
    const [active, setActive] = useState("horizontal");
    const [dataSource, setDataSource] = useState([]);
    const [groupId, setGroupId] = useState();
    const [showModal, setShowModal] = useState(false);
    const [memberModal, setMemberModal] = useState(false)
    const [memberData, setMemberData] = useState([])
    const [constructedData, setConstructedData] = useState([])
    const [dates, setDates] = useState(moment().format('DD/MM/YYYY'));
    const [activeDatePicker, setActiveDatePicker] = useState("expiryasof");
    const [expMemInfo, setExpMemInfo] = useState({})

    let { expiredMembers, loading: ExpiredMemLoading } = useExpiredMemberHook(appdir, groupid, dates, activeDatePicker, type === EXPIRED_MEMBERS, signal)

    const memberColumn = [
        {
            title: "GROUP NAME",
            dataIndex: "GroupName",
            key: "GroupName",
            render: (_, data) => {
                return <div className="text-left"> {data.GroupName} </div>
            },
            sorter: sortGroupName,
        },
        {
            title: "MEMBERS",
            dataIndex: "CountPerGroup",
            key: "CountPerGroup",
            render: (_, data) => {
                return <a onClick={() => handleTableClick(data)}><div className="text-left"> {data.CountPerGroup} </div></a>
            },
            sorter: (obj1, obj2) => sortNumbers(obj1, obj2, 'CountPerGroup'),
        },
    ];

    useEffect(() => {
        if (expiredMembers?.length) {
            setConstructedData(expiredMembers)
        }
    }, [expiredMembers])

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

    useEffect(() => {
        if (activeDatePicker === "expiryasof") {
            setDates(moment().format('DD/MM/YYYY'))
        } else {
            setDates([get90PriorDate(), moment().format('DD/MM/YYYY')])
        }
    }, [activeDatePicker])

    useEffect(() => {
        handleMemberDataBasedSelectedGroups()
    }, [constructedData, membersGroup])

    const disabledDate = (current) => {
        return current && current > moment().endOf('day')
    }

    const handleViewChange = (e) => {
        setActive(e.target.value)
    }

    const handleDate = (value, dateStrings) => {
        console.log('dateStrings?.[1]', dateStrings)
        setDates([dateStrings?.[0], dateStrings?.[1]]);
    }

    const handleDatePicker = (e) => {
        setActiveDatePicker(e.target.value)
    }

    const handleDateRange = (e) => {
        setDates(e.format('DD/MM/YYYY'))
    }

    const handleChartClick = ({ data }) => {
        setGroupId(data.GroupID)
        setMemberData({ groupName: data?.GroupName, count: data?.CountPerGroup })
        setExpMemInfo({ detailed: 1, offset: 0, limit: data?.CountPerGroup })
        setShowModal(true)
    }

    const handleTableClick = (data) => {
        setGroupId(data.GroupID)
        setMemberData({ groupName: data?.GroupName, count: data?.CountPerGroup })
        setExpMemInfo({ detailed: 1, offset: 0, limit: data?.CountPerGroup })
        setShowModal(true)
    }

    const handleClick = () => {
        let groupIds = [];
        let totalCount = 0;
        console.log('membersGroup', membersGroup)
        membersGroup.map((grp) => {
            groups_array.map((data) => {
                if (data?.groupname === grp) {
                    groupIds.push(data.groupid)
                }
                return data
            })
            return grp
        })

        dataSource.map((data) => {
            totalCount += data.CountPerGroup
        })

        setGroupId(groupIds)
        setExpMemInfo({ detailed: 1, offset: 0, limit: totalCount })
        setMemberModal(true)
    }

    const renderMemberType = () => {
        return (
            <>
            <Col>
                <Radio.Group value={activeDatePicker} onChange={handleDatePicker} optionType="button" buttonStyle="solid">
                    <Radio.Button value='expiryasof'>Expiry As of</Radio.Button>
                    <Radio.Button value='expired between'>Expired Between</Radio.Button>
                </Radio.Group>
            </Col>
            <Col flex={3}>
                {activeDatePicker === "expiryasof" ? <DatePicker className='ml-3' defaultValue={moment()} format={'MM-DD-YYYY'} onChange={handleDateRange} disabledDate={disabledDate} allowClear={false} />
                    : <CommonDatePicker handleDate={handleDate} />
                }
            </Col>
            </>
        )
    }

    const renderActionBar = () => {
        return (
            <div className='pt-2'>
                <div className='mt-3 mb-3 title' style={{ fontWeight: 100 }}> {"EXPIRED MEMBERS"} : <a className='menuValues member-count' onClick={handleClick} style={{ color: "#f5222d" }}> {MemberCount}</a></div>
                <Row gutter={16} className='mb-3 row-gap' >
                    {renderMemberType()}
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
                            exportFileName={"EXPIRED_MEMBERS"}
                        />
                    </Col> :
                        <Col>
                            <DownloadChart domEl={domEl} fileName={activeDatePicker === "expiryasof" ? { name: "Expired Members", startDate: moment(dates, 'DD-MM-YYYY').format('MM/DD/YYYY')} :{ name: "Expired Members", startDate: dates[0], endDate: moment(dates[1], 'DD-MM-YYYY').format('MM/DD/YYYY')}} />
                        </Col>
                    }
                </Row>
            </div>
        )
    }

    const renderChartAndTable = () => {
        if (!dataSource.length > 0) {
            return <NoDataFound />
        }
        if ((active === 'horizontal' || active === 'vertical')) {
            return <MembersChart currentMembers={dataSource} isvertical={active === 'vertical' && true} handleChartClick={handleChartClick} domEl={domEl} />
        }
        if (active === "table") {
            return (<div className="py-2">
                <Table dataSource={dataSource} columns={memberColumn} pagination={false} className='salesTable' scroll={{ y: 300 }} />
            </div>)
        }
    }

    return (
        <CommonSpinner loading={ExpiredMemLoading} className="initialLoader">
            <MultiSelectWidget 
                membersGroup={membersGroup}
                groupsArray={groups_array}
                setSelectedMembersGroups={setSelectedMembersGroups}
            />
            {renderActionBar()}
            {!ExpiredMemLoading && <div>
                {renderChartAndTable()}
            </div>}
            <RenderMembersModal
                showModal={showModal}
                memberModal={memberModal}
                groupId={groupId}
                type={type === EXPIRED_MEMBERS}
                signal={signal}
                appdir={appdir}
                detailed={expMemInfo.detailed}
                offset={expMemInfo.offset}
                limit={expMemInfo.limit}
                MemberCount={MemberCount}
                memberData={memberData}
                setShowModal={setShowModal}
                setMemberModal={setMemberModal}
                dates={dates}
                activeDatePicker={activeDatePicker}
                setGroupId={setGroupId}
            />
        </CommonSpinner>
    )
}
export default ExpiredMembers;