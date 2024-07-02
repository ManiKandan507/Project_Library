import React, { useState, useEffect, createRef, useContext, memo, useRef } from 'react'
import moment from 'moment';
import _map from 'lodash/map';
import CommonSpinner from '@/MembershipReportingV2/common/CommonSpinner';
import DownloadChart from '@/MembershipReportingV2/common/DownloadChart';
import CommonDatePicker from '@/MembershipReportingV2/common/CommonDatePicker';
import CustomExportCsv from '@/MembershipReportingV2/common/CustomExportCsv';
import { currentTotalMemberHeader, convertLowercaseFormat, get90PriorDate, getCurrentDate, sortGroupName, sortNumbers, sortName } from '@/AnalyticsAll/StatComponents/util';
import { Row, Col, Radio, Table, Modal, Typography, Button, Input, Avatar, Select } from 'antd'
import { BarChartOutlined, MailFilled, TableOutlined, UserOutlined } from '@ant-design/icons';
import { NoDataFound } from '@/MembershipReportingV2/common/NoDataFound';
import GlobalContext from '@/MembershipReportingV2/context/MemberContext';
import { useRenewMemberHook, useRenewMemberDetailsHook } from '@/MembershipReportingV2/hooks/Members';
import { MembersChart } from '@/MembershipReportingV2/MemberChartWidget/MembersChart';
import MultiSelectWidget from '../common/MultiSelectWidget';
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
    setGroupId
}) => {
    const [memberDetails, setMemberDetails] = useState([])
    const [selectedTableData, setSelectedTableData] = useState([])
    const [searchValue, setSearchValue] = useState("")
    const [primaryValue, setPrimaryValue] = useState("")
    const [groupIds, setGroupIds] = useState(groupId)
    let { renewMemDetails, renewMemLoading } = useRenewMemberDetailsHook(source_hex, groupIds, dates[0], dates[1], type, signal)

    useEffect(() => {
        if (renewMemDetails?.length) {
            setMemberDetails(renewMemDetails)
            setSelectedTableData(renewMemDetails)
        }
    }, [renewMemDetails, groupIds])

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
                        <Row style={{ flexWrap: "nowrap", alignItems: "center" }}>
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
                        <Typography> {"RENEW MEMBERS"} :</Typography>
                        <div className='ml-2' style={{ color: "#faad14", fontWeight: 'bold' }}>{MemberCount}</div>
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
                            exportFileName={"RENEW MEMBERS"}
                        />
                    </Col>
                </Row>
                <Table dataSource={memberDetails} columns={MemberDetailsColumn} pagination={true} className='CurrentMemberTable' scroll={{ y: 450 }} loading={renewMemLoading} />
            </Modal>}
        </div>
    )
})

const RenewMembers = (props) => {
    const { membersGroup, setSelectedMembersGroups } = useContext(GlobalContext);

    const chartReference = createRef()

    const domEl = useRef()

    const { params: { source_hex, groups_array, appdir }, type, signal } = props
    const groupid = groups_array.map((data) => {
        return data.groupid
    })

    let RENEW_MEMBERS = "RENEW_MEMBERS";

    const [MemberCount, setMemberCount] = useState();
    const [active, setActive] = useState("horizontal");
    const [dataSource, setDataSource] = useState([]);
    const [groupId, setGroupId] = useState();
    const [showModal, setShowModal] = useState(false);
    const [memberModal, setMemberModal] = useState(false)
    const [memberData, setMemberData] = useState([])
    const [constructedData, setConstructedData] = useState([])
    const [dates, setDates] = useState([get90PriorDate(), getCurrentDate()]);

    let { renewMembers, loading: renewMemberLoading } = useRenewMemberHook(source_hex, groupid, dates[0], dates[1], type === RENEW_MEMBERS, signal)

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
        if (renewMembers?.length) {
            setConstructedData(renewMembers)
        }
    }, [renewMembers])

    const handleMemberDataBasedSelectedGroups = () => {
        let totalCount = 0;

        let membershipGroupData = membersGroup.map((data) => {
            return constructedData.filter(item => item?.GroupName.trim() == data.trim())
        }).flat();

        membershipGroupData?.forEach((data) => {
            totalCount += data.TotalCount
        })

        setMemberCount(totalCount)
        setDataSource(membershipGroupData);
    }

    useEffect(() => {
        handleMemberDataBasedSelectedGroups()
    }, [constructedData, membersGroup])

    const handleViewChange = (e) => {
        setActive(e.target.value)
    }

    const handleDate = (value, dateStrings) => {
        setDates([moment(dateStrings?.[0]).format('DD/MM/YYYY'), moment(dateStrings?.[1]).format('DD/MM/YYYY')]);
    }

    const handleChartClick = ({ data }) => {
        setGroupId(data.GroupID)
        setMemberData({ GroupName: data?.GroupName, TotalCount: data?.TotalCount, dataSource: renewMembers })
        setShowModal(true)
    }

    const handleTableClick = (data) => {
        setGroupId(data.GroupID)
        setMemberData({ GroupName: data?.GroupName, TotalCount: data?.TotalCount, dataSource: renewMembers })
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

    const renewMemberHeader = [
        { label: `GROUP NAME (${moment(dates[0], 'DD-MM-YYYY').format('MM/DD/YYYY')} - ${moment(dates[1], 'DD-MM-YYYY').format('MM/DD/YYYY')})`, key: "GroupName" },
        { label: "MEMBERS", key: "TotalCount" }
    ]

    const renderActionBar = () => {
        return (
            <div className='pt-2'>
                <ClickableMemberCount
                    memberType="RENEW MEMBERS"
                    handleClick={handleClick}
                    memberCount={MemberCount}
                    color='#faad14'
                />
                <Row gutter={16} className='mb-3 row-gap'>
                    <Col flex={3} className="title"> WITHIN:<span><CommonDatePicker handleDate={handleDate} /></span> </Col>
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
                            Headers={renewMemberHeader}
                            exportFileName={"RENEW MEMBERS"}
                        />
                    </Col> : ''}
                    {active !== 'table' && dataSource.length ?
                        <Col>
                            <DownloadChart chartRef={chartReference} fileName={{ name: "Current Members", startDate: moment(dates[0], 'DD-MM-YYYY').format('MM/DD/YYYY'), endDate: moment(dates[1], 'DD-MM-YYYY').format('MM/DD/YYYY') }} domEl={domEl} />
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
            return <MembersChart currentMembers={dataSource} chartRef={chartReference} isvertical={active === 'vertical' && true} handleChartClick={handleChartClick} domEl={domEl} height={'460px'} />
        }
        if (active === "table") {
            return (<div className="py-2" style={{ width: "100%" }}>
                <Table dataSource={dataSource} columns={memberColumn} pagination={false} className='salesTable' scroll={{ y: 450 }} />
            </div>)
        }
    }

    return (
        <CommonSpinner loading={renewMemberLoading}>
            <MultiSelectWidget
                groupsArray={groups_array}
                membersGroup={membersGroup}
                setSelectedMembersGroups={setSelectedMembersGroups}
            />
            {renderActionBar()}
            {!renewMemberLoading && <div>
                {renderChartAndTable()}
            </div>}
            <RenderMembersModal
                showModal={showModal}
                memberModal={memberModal}
                source_hex={source_hex}
                groupId={groupId}
                type={type === RENEW_MEMBERS}
                signal={signal}
                appdir={appdir}
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
export default RenewMembers