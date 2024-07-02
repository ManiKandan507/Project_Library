import React, { useState, useEffect, createRef, useContext, memo } from 'react'
import moment from 'moment';
import { BarChartOutlined, MailFilled, TableOutlined } from '@ant-design/icons';
import CommonSpinner from '@/MembershipReportingV2/common/CommonSpinner';
import DownloadChart from '@/MembershipReportingV2/common/DownloadChart';
import CommonDatePicker from '@/MembershipReportingV2/common/CommonDatePicker';
import CustomExportCsv from '@/MembershipReportingV2/common/CustomExportCsv';
import { currentTotalMemberHeader, convertLowercaseFormat, get90PriorDate, sortGroupName, sortNumbers, sortName } from '@/AnalyticsAll/StatComponents/util';
import { Row, Col, Radio, Table, Modal, Typography, Button, DatePicker, Input, Avatar, Select } from 'antd'
import { NoDataFound } from '@/MembershipReportingV2/common/NoDataFound';
import GlobalContext from '@/MembershipReportingV2/context/MemberContext';
import { useExpiredMemberHook, useExpiredMemDetailsHook } from '@/MembershipReportingV2/hooks/Members'
import { MembersChart } from '@/MembershipReportingV2/MemberChartWidget/MembersChart';
import { UserOutlined } from '@ant-design/icons';
import _map from 'lodash/map';
import MultiSelectWidget from '../common/MultiSelectWidget';
import { useRef } from 'react';
import { dateFormat } from '../../util';
import clickableColumnHeader from './../common/ClickableColumnIcon';
import ClickableMemberCount from './../common/ClickableMemberCount';

const { Option } = Select

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
    dates,
    activeDatePicker,
    setGroupId
}) => {
    const [searchValue, setSearchValue] = useState("")
    const [memberDetails, setMemberDetails] = useState([])
    const [selectedTableData, setSelectedTableData] = useState([])
    const [primaryValue, setPrimaryValue] = useState("")
    const [groupIds, setGroupIds] = useState(groupId)
    let { expMemberDetails, memLoading } = useExpiredMemDetailsHook(source_hex, groupIds, dates, activeDatePicker, type, signal)

    useEffect(() => {
        if (expMemberDetails?.length) {
            setMemberDetails(expMemberDetails)
            setSelectedTableData(expMemberDetails)
        }
    }, [expMemberDetails, groupIds])

    useEffect(() => {
        setPrimaryValue(memberData.GroupName)
        setGroupIds(groupId)
    }, [memberData, groupId])

    const MemberDetailsColumn = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 4,
            className: "text-left",
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
                        <Row style={{ flexWrap: "nowrap", alignItems: 'center' }}>
                            <Col>
                                <Avatar size={40} alt="profile" icon={<UserOutlined />} src={data?.Picture} />
                            </Col>
                            <Col className="ml-3">
                                <div>{data?.Firstname} {data?.Lastname}</div>
                            </Col>
                        </Row>
                    </div>
                )
            },
            sorter: sortName
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

                return <div> {moment(data.MemberJoinDate).isValid() ? dateFormat(data.MemberJoinDate) : "-"} </div>
            },
        },
        {
            title: "Expiration Date",
            dataIndex: "ExpirationDate",
            key: "ExpirationDate",
            width: 8,
            className: "text-left",
            render: (_, data) => {
                return <div> {moment(data.ExpirationDate).isValid() ? dateFormat(data.ExpirationDate) : "-"} </div>
            },
        },
        {
            title: "Action",
            dataIndex: "action",
            key: "action",
            width: 8,
            className: "text-left",
            render: (_, data) => {
                return <Button target="_blank" href={`https://www.xcdsystem.com/${appdir}/admin/contacts/managecontacts/index.cfm?CFGRIDKEY=${data.ReviewIDThisCustID}`}> Manage </Button>
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
        searchValue = searchValue.target.value;
        let searchResult = []
        if (searchValue) {
            searchResult = selectedTableData?.filter((mem) => { return convertLowercaseFormat(`${mem?.Firstname} ${mem?.Lastname}`).includes(convertLowercaseFormat(searchValue)) })
        } else {
            searchResult = selectedTableData
        }
        setSearchValue(searchValue)
        setMemberDetails(searchResult)
    };

    const handleSendEmail = () => {
        let reviewIds = _map(memberDetails, "ReviewIDThisCustID").join();
        window.parent.postMessage(
            { reviewIds, type: "Email" },
            "*"
        );
    }

    const handleSelect = (e) => {
        setPrimaryValue(e)
        memberData.dataSource.map((data) => {
            if (e === data.GroupName) {
                setGroupIds(data.GroupID)
            }
            return data
        })

    }

    const renderSelect = () => {
        return <div style={{ fontSize: "16px" }}>
            <Typography className='pb-2'>Member Type</Typography>
            <Select style={{ width: '130px' }} onChange={handleSelect} value={primaryValue} showSearch dropdownMatchSelectWidth={false} dropdownStyle={{ width: '250px' }}>
                {memberData?.dataSource?.map((data) => {
                    return <Option key={data.key} value={data?.GroupName} className="select-option" >{data?.GroupName}</Option>
                })}
            </Select>
        </div>
    }

    return (
        <div>
            {<Modal open={showModal ? showModal : memberModal} title="Member Details" onCancel={handleCancel} footer={null} width='80%'>
                {memberModal && <div>
                    <div className="py-3 d-flex" style={{ fontSize: "15px" }}>
                        <Typography> {"EXPIRED_MEMBERS"} :</Typography>
                        <div className='ml-2' style={{ color: "#f5222d", fontWeight: 'bold' }}>{MemberCount}</div>
                    </div>
                </div>}
                {showModal && <div className='d-flex'>
                    {renderSelect()}
                    <div className="ml-4" style={{ fontSize: "16px" }}>
                        <Typography className='pb-2'>Total Count</Typography>
                        <div style={{ fontWeight: 'bold' }}>{memberDetails?.length}</div>
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
                                    user: `${data.Firstname} ${data.Lastname}`,
                                    id: data.ReviewIDThisCustID,
                                    Company: data.Company ? data.Company : '-',
                                    GroupName: data.GroupName,
                                    MemberJoinDate: moment(data.MemberJoinDate).isValid() ? dateFormat(data.MemberJoinDate) : '',
                                    ExpirationDate: moment(data.ExpirationDate).isValid() ? dateFormat(data.ExpirationDate) : '',
                                };
                            })}
                            Headers={currentTotalMemberHeader}
                            exportFileName={"EXPIRED_MEMBERS"}
                        />
                    </Col>
                </Row>
                <Table dataSource={memberDetails} columns={MemberDetailsColumn} pagination={true} className='CurrentMemberTable' scroll={{ y: 450 }} loading={memLoading} />
            </Modal>}
        </div>
    )
})

const ExpiredMembers = (props) => {
    const { membersGroup, setSelectedMembersGroups } = useContext(GlobalContext);

    const chartReference = createRef()

    const chartRef = useRef()

    const { params: { source_hex, groups_array, appdir }, type, signal } = props
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

    let { expiredMembers, loading: ExpiredMemLoading } = useExpiredMemberHook(source_hex, groupid, dates, activeDatePicker, type === EXPIRED_MEMBERS, signal)

    const memberColumn = [
        {
            title: <div className='primary-color'>GROUP NAME</div>,
            dataIndex: "GroupName",
            key: "GroupName",
            className: "text-left",
            width: '50%',
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
            width: '50%',
            render: (_, data) => {
                return <a onClick={() => handleTableClick(data)}> {data.TotalCount} </a>
            },
            sorter: (obj1, obj2) => sortNumbers(obj1, obj2, 'TotalCount'),
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
            totalCount += data.TotalCount ? data.TotalCount : 0;
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

    const handleViewChange = (e) => {
        setActive(e.target.value)
    }

    const handleDate = (value, dateStrings) => {
        setDates([moment(dateStrings?.[0]).format('DD/MM/YYYY'), moment(dateStrings?.[1]).format('DD/MM/YYYY')]);
    }

    const handleDatePicker = (e) => {
        setActiveDatePicker(e.target.value)
    }

    const handleDateRange = (e) => {
        setDates(e.format('DD/MM/YYYY'))
    }

    const handleChartClick = ({ data }) => {
        setGroupId(data.GroupID)
        setMemberData({ GroupName: data?.GroupName, TotalCount: data?.TotalCount, dataSource: expiredMembers })
        setShowModal(true)
    }

    const handleTableClick = (data) => {
        setGroupId(data.GroupID)
        setMemberData({ GroupName: data?.GroupName, TotalCount: data?.TotalCount, dataSource: expiredMembers })
        setShowModal(true)
    }

    const handleClick = () => {
        let groupIds = [];
        membersGroup.map((grp) => {
            groups_array.map((data) => {
                if (data?.groupname === grp) {
                    groupIds.push(data.groupid)
                }
                return data
            })
            return grp
        })
        setGroupId(groupIds)
        setMemberModal(true)
    }

    const expiredMembersHeader = [
        { label: `GROUP NAME (${moment(dates, 'DD-MM-YYYY').format('MM/DD/YYYY')}})`, key: "GroupName" },
        { label: "MEMBERS", key: "TotalCount" },
    ]

    const expiredBetweenHeader = [
        { label: `GROUP NAME (${moment(dates[0], 'DD-MM-YYYY').format('MM/DD/YYYY')} - ${moment(dates[1], 'DD-MM-YYYY').format('MM/DD/YYYY')})`, key: "GroupName" },
        { label: "MEMBERS", key: "TotalCount" }
    ]

    const renderMemberType = () => {
        return (<Col flex={3}>
            <Radio.Group value={activeDatePicker} onChange={handleDatePicker} optionType="button" buttonStyle="solid">
                <Radio.Button value='expiryasof'>Expiry As of</Radio.Button>
                <Radio.Button value='expired between'>Expired Between</Radio.Button>
            </Radio.Group>
            {activeDatePicker === "expiryasof" ? <DatePicker className='ml-4' defaultValue={moment()} format={"MM/DD/YYYY"} onChange={handleDateRange} />
                : <CommonDatePicker handleDate={handleDate} />
            }
        </Col>)
    }

    const renderActionBar = () => {
        return (
            <div className='pt-2'>
                <ClickableMemberCount
                    memberType="EXPIRED MEMBERS"
                    handleClick={handleClick}
                    memberCount={MemberCount}
                    color='#f5222d'
                />
                <Row gutter={16} className='mb-3 row-gap'>
                    {renderMemberType()}
                    <Col className='pl-20'>
                        <Radio.Group value={active} onChange={handleViewChange}>
                            <Radio.Button value='horizontal'> <BarChartOutlined className="horizontal pr-1" /> Horizontal</Radio.Button>
                            <Radio.Button value='vertical'> <BarChartOutlined className="pr-1" /> Vertical</Radio.Button>
                            <Radio.Button value='table'> <TableOutlined className="pr-1" /> Table</Radio.Button>
                        </Radio.Group>
                    </Col>
                    {active === "table" && dataSource.length ? <Col>
                        <CustomExportCsv
                            dataSource={dataSource}
                            Headers={activeDatePicker === "expiryasof" ? expiredMembersHeader : expiredBetweenHeader}
                            exportFileName={"EXPIRED_MEMBERS"}
                        />
                    </Col> : ' '}
                    {active !== 'table' && dataSource.length ?
                        <Col>
                            <DownloadChart chartRef={chartRef} fileName={activeDatePicker === "expiryasof" ? { name: "Expired Members", startDate: moment(dates, 'DD-MM-YYYY').format('MM/DD/YYYY') } : { name: "Expired Members", startDate: dates[0], endDate: moment(dates[1], 'DD-MM-YYYY').format('MM/DD/YYYY') }} />
                        </Col> : ''
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
            return <MembersChart currentMembers={dataSource} isvertical={active === 'vertical' && true} handleChartClick={handleChartClick} chartRef={chartRef} height={'460px'} />
        }
        if (active === "table") {
            return (<div className="py-2" style={{ width: "100%" }}>
                <Table dataSource={dataSource} columns={memberColumn} pagination={false} className='salesTable' scroll={{ y: 450 }} />
            </div>)
        }
    }

    return (
        <CommonSpinner loading={ExpiredMemLoading} className='initialLoader'>
            <MultiSelectWidget
                groupsArray={groups_array}
                membersGroup={membersGroup}
                setSelectedMembersGroups={setSelectedMembersGroups}
            />
            {renderActionBar()}
            {!ExpiredMemLoading && <div>
                {renderChartAndTable()}
            </div>}
            <RenderMembersModal
                showModal={showModal}
                memberModal={memberModal}
                source_hex={source_hex}
                groupId={groupId}
                type={type === EXPIRED_MEMBERS}
                signal={signal}
                appdir={appdir}
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