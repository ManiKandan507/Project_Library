import React, { useState, useEffect, useContext, useRef } from 'react';
import GlobalContext from '@/CorporateMembershipReportingV2/context/MemberContext';
import { Row, Col, Radio, Table, Modal, Typography, Button, Input, Avatar, Tooltip } from 'antd';
import CommonSpinner from '@/CorporateMembershipReportingV2/common/CommonSpinner';
import CommonDatePicker from '@/CorporateMembershipReportingV2/common/CommonDatePicker';
import { get90PriorDate, getCurrentDate, convertLowercaseFormat, currencyFormatter } from '@/AnalyticsAll/StatComponents/util';
import CustomExportCsv from '@/CorporateMembershipReportingV2/common/CustomExportCsv';
import DownloadChart from '@/CorporateMembershipReportingV2/common/DownloadChart';
import { CurrentTrendChart } from "@/CorporateMembershipReportingV2/TrendChartWidget/CurrentTrendChart";
import { getMembersInfoByUuids } from '@/CorporateMembershipReportingV2/TrendChartWidget/service';
import moment from 'moment';
import _map from 'lodash/map';
import _isEmpty from 'lodash/isEmpty';
import { ArrowRightOutlined, InfoCircleOutlined, MailFilled, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { HASH_DATA } from '@/CorporateMembershipReportingV2/TrendChartWidget/Constants';
import MultiSelectWidget from '../common/MultiSelectWidget';

let controller = new AbortController();
let signal = controller.signal;
export const TrendChartWidget = (props) => {
    const { membersGroup, setSelectedMembersGroups } = useContext(GlobalContext);
    const domEl = useRef()

    const { params: { source_hex, groups_array, appdir } } = props;

    const [dates, setDates] = useState([get90PriorDate(), getCurrentDate()]);
    const [dataSource, setDataSource] = useState([]);
    const [tableDataSource, setTableDataSource] = useState([])
    const [loading, setLoading] = useState(false)
    const [active, setActive] = useState("chart");
    const [memberDetails, setMemberDetails] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState({})
    const [selectedTableData, setSelectedTableData] = useState([])
    const [searchValue, setSearchValue] = useState('')
    const [totalValues, setTotalValues] = useState({ start: 0, end: 0 })
    const [groupId, setGroupId] = useState([])
    const [memberModal, setMemberModal] = useState(false)

    const getExtendedHistoryInfo = async (source_hex, groupId, start_date, end_date) => {
        const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";

        try {
            setLoading(true)
            const response = await fetch(
                `${baseApi}?module=dues&component=corp_reports&function=corp_extended_history&source=${source_hex}&groupid=${groupId}&start_date=${start_date}&end_date=${end_date}`, { signal }
            );
            const data = await response?.json();
            // const data = staticData
            setDataSource(data?.data)
            setLoading(false)
            const tableKeys = Object.keys(data?.data?.tableData)
            const tableData = []
            tableKeys.forEach((val) => {
                tableData.push(data?.data?.tableData[val])
            })
            setTableDataSource([
                {
                    "groupname": "Total",
                    ...data.data.totalRow
                }, ...tableData])
            return data
        } catch (error) {
            console.log("error", error)
        }
    };
    console.log('dataSource :>> ', dataSource);

    useEffect(() => {
        if (groupId?.length) {
            getExtendedHistoryInfo(source_hex, groupId, dates[0], dates[1])
        }
    }, [groupId])

    const handleMemberClick = (data, key) => {
        const isTotal = data.groupname === "Total";
        const totalRowUUIDs = dataSource.totalRowUUIDs;
        let groupInfo = isTotal ? { groupname: "Total", ...totalRowUUIDs } : dataSource?.tableDataUUIDs[data.groupname] || [];
        if (groupInfo[key]?.length > 0) {
            setSelectedItem({
                ...data,
                UUIDs: groupInfo[key],
                groupTitle: data.groupname,
                value: groupInfo[key].length,
                isTable: true,
                selectedValue: HASH_DATA[key],
                groupUuids: groupInfo
            });
        }
        setShowModal(true)
        fetchMemberDetails(groupInfo[key], appdir, dates[0], dates[1])
    }

    const DownloadMemberInfo = ({ data, keyVal }) => {
        return Number(data[keyVal]) ? (<a onClick={() => handleMemberClick(data, keyVal)}>{currencyFormatter(data[keyVal], false)}</a>) : 0;
    };

    const trendColumn = [
        {
            title: <div className='trend-table-header'>
                <Tooltip title="Group Name">
                    Group Name
                </Tooltip >
            </div>,
            dataIndex: "groupname",
            key: "groupname",
            className: "text-left",
            fixed: 'left',
            width: 300,
            render: (_, data) => {
                const obj = {
                    props: {},
                    children: <div> {data.groupname} </div>
                }
                if (data.groupname === "Total")
                    obj.props.className = "total-row-bg"
                return obj
            },
        },
        {
            title: <div className='d-flex align-center'>
                <div className="trend-table-header">
                    <Tooltip title="Count at Beginning ">
                        Count at Beginning
                    </Tooltip >
                </div>
                <Tooltip title={`Number of members as of ${dates[0]} with an expiration greater than the ${dates[1]}`}>
                    <InfoCircleOutlined className='pl-2  table-info-icon' />
                </Tooltip >
            </div>,
            dataIndex: 'countatbeginning',
            key: 'countatbeginning',
            className: "text-left",
            render: (_, data) => {
                const obj = {
                    props: {},
                    children: <DownloadMemberInfo data={data} keyVal={'countatbeginning'} />
                }
                if (data.groupname === "Total")
                    obj.props.className = "total-row-bg"
                return obj
            },

        },
        {
            title: <div className='d-flex align-center'>
                <div className="trend-table-header">
                    <Tooltip title="Member as of End Date">
                        Member as of End Date
                    </Tooltip >
                </div>
                <Tooltip title={`Number of members as of ${dates[1]} with an expiration greater than the ${dates[1]}`}>
                    <InfoCircleOutlined className='pl-2 table-info-icon' />
                </Tooltip >
            </div>,
            dataIndex: "membersonenddate",
            key: "membersonenddate",
            className: "text-left",
            render: (_, data) => {
                const obj = {
                    props: {},
                    children: <DownloadMemberInfo data={data} keyVal={'membersonenddate'} />
                }
                if (data.groupname === "Total")
                    obj.props.className = "total-row-bg"
                return obj
            },

        },
        {
            title: <div className='d-flex align-center'>
                <div className="trend-table-header">
                    <Tooltip title="New Members">
                        New Members
                    </Tooltip >
                </div>
                <Tooltip
                    title={` Members that did not exist before ${dates[0]} but have a society join date after the [Start Date] and an expiration greater than the ${dates[1]}`}>
                    <InfoCircleOutlined className='pl-2 table-info-icon' />
                </Tooltip >
            </div>,
            dataIndex: "newmembers",
            key: "newmembers",
            className: "text-left",
            render: (_, data) => {
                const obj = {
                    props: {},
                    children: <DownloadMemberInfo data={data} keyVal={'newmembers'} />
                }
                if (data.groupname === "Total")
                    obj.props.className = "total-row-bg"
                return obj
            },
        },
        {
            title: <div className='d-flex align-center'>
                <div className="trend-table-header">
                    <Tooltip title=" Transitioned Into">
                        Transitioned Into
                    </Tooltip >
                </div>
                <Tooltip title={`Members who started in another group before the ${dates[0]} and moved into this group before the ${dates[1]}`}>
                    <InfoCircleOutlined className='pl-2 table-info-icon' />
                </Tooltip >
            </div>,
            dataIndex: "transitionedinto",
            key: "transitionedinto",
            className: "text-left",
            render: (_, data) => {
                const obj = {
                    props: {},
                    children: <DownloadMemberInfo data={data} keyVal={'transitionedinto'} />
                }
                if (data.groupname === "Total")
                    obj.props.className = "total-row-bg"
                return obj
            },
        },
        {
            title: <div className='d-flex align-center'>
                <div className="trend-table-header">
                    <Tooltip title="No Changes">
                        No Changes
                    </Tooltip >
                </div>
                <Tooltip title="Members who stayed in the same membership group during the period">
                    <InfoCircleOutlined className='pl-2 table-info-icon' />
                </Tooltip ></div>,
            dataIndex: "nochange",
            key: "nochange",
            className: "text-left",
            render: (_, data) => {
                const obj = {
                    props: {},
                    children: <DownloadMemberInfo data={data} keyVal={'nochange'} />
                }
                if (data.groupname === "Total")
                    obj.props.className = "total-row-bg"
                return obj
            },
        },
        {
            title: <div className='d-flex align-center'>
                <div className="trend-table-header">
                    <Tooltip title="Membership Expired">
                        Membership Expired
                    </Tooltip >
                </div>
                <Tooltip title={`Members who started with a valid expiration at the ${dates[0]}, are still in the membership group today, but have an expiry date in the past`}>
                    <InfoCircleOutlined className='pl-2 table-info-icon' />
                </Tooltip >
            </div>,
            dataIndex: "expired",
            key: "expired",
            className: "text-left",
            render: (_, data) => {
                const obj = {
                    props: {},
                    children: <DownloadMemberInfo data={data} keyVal={'expired'} />
                }
                if (data.groupname === "Total")
                    obj.props.className = "total-row-bg"
                return obj
            },
        },
        {
            title: <div className='d-flex align-center'>
                <div className="trend-table-header">
                    <Tooltip title="Transitioned Out">
                        Transitioned Out
                    </Tooltip >
                </div>
                <Tooltip title={`Members who started in this group before the ${dates[0]} and moved into another group before the ${dates[1]}`}>
                    <InfoCircleOutlined className='pl-2 table-info-icon' />
                </Tooltip >
            </div>,
            dataIndex: "transitionedout",
            key: "transitionedout",
            className: "text-left",
            render: (_, data) => {
                const obj = {
                    props: {},
                    children: <DownloadMemberInfo data={data} keyVal={'transitionedout'} />
                }
                if (data.groupname === "Total")
                    obj.props.className = "total-row-bg"
                return obj
            },
        },
        {
            title: <div className='d-flex align-center'>
                <div className="trend-table-header">
                    <Tooltip title="Exit Society">
                        Exit Society
                    </Tooltip >
                </div>
                <Tooltip title={`Members who started with a valid expiration at the ${dates[0]} and are no longer in any membership group`}>
                    <InfoCircleOutlined className='pl-2 table-info-icon' />
                </Tooltip >
            </div>,
            dataIndex: "exitsociety",
            key: "exitsociety",
            className: "text-left",
            render: (_, data) => {
                const obj = {
                    props: {},
                    children: <DownloadMemberInfo data={data} keyVal={'exitsociety'} />
                }
                if (data.groupname === "Total")
                    obj.props.className = "total-row-bg"
                return obj
            },
        },
    ]

    const MemberDetailsColumn = [
        {
            title: "ID",
            dataIndex: "CompIDThisConfID",
            key: "CompIDThisConfID",
            className: "text-left",
            width: '8%',
            render: (val) => {
                return (
                    <div>{val ? val : '-'}</div>
                )
            },
        },
        {
            title: "Organization",
            dataIndex: "Companyname",
            key: "Companyname",
            className: "text-left",
            render: val => <div>{val ? val : '-'} </div>,
        },
        {
            title: "Primary Contact",
            dataIndex: "PrimaryContactFirstname",
            key: "PrimaryContactFirstname",
            className: "text-left",
            render: (_, data) => {
                return (
                    <div style={{ fontSize: '16px' }}>
                        <Row style={{ flexWrap: "nowrap", alignItems: 'center' }}>
                            <Col>
                                <Avatar size={40} alt="profile" icon={<UserOutlined />} src={data?.Picture} />
                            </Col>
                            <Col className="ml-3">
                                <a target="_blank" href={`https://www.xcdsystem.com/${appdir}/admin/contacts/managecontacts/index.cfm?CFGRIDKEY=${data.PrimaryContactReviewIDThisCustID}`}>
                                    <div>{data?.PrimaryContactFirstname} {data?.PrimaryContactLastname}</div> </a>
                            </Col>
                        </Row>
                    </div>
                )
            }
        },
        {
            title: "Current Group",
            dataIndex: "currentGroupName",
            key: "currentGroupName",
            className: "text-left",
            render: (val, data) => {
                return <div>{val ? `${val} (Date Changed: ${moment(data.currentGroupJoinDate).format('MM/DD/YYYY')})` : '-'} </div>
            },

        },
        {
            title: "City",
            dataIndex: "City",
            key: "City",
            className: "text-left",
            width: '12%',
            render: val => <div>{val ? val : '-'} </div>,
        },
        {
            title: "State",
            dataIndex: "State",
            key: "State",
            className: "text-left",
            width: '10%',
            render: val => <div>{val ? val : '-'} </div>,
        },
        {
            title: "Country",
            dataIndex: "Country",
            key: "Country",
            className: "text-left",
            width: '10%',
            render: val => <div>{val ? val : '-'} </div>,
        },
        {
            title: "Action",
            dataIndex: "action",
            key: "action",
            className: "text-left",
            width: '9%',
            render: (_, data) => {
                return <Button target="_blank" href={`https://www.xcdsystem.com/${appdir}/admin/company/managecompanies/index.cfm?CFGRIDKEY=${data.CompID}&view=profile`}> Manage </Button>
            },
        }
    ];

    const currentTrendHeaders = [
        { label: "Group Name", key: "groupname" },
        { label: "Count at Beginning", key: "countatbeginning" },
        { label: "Member as of End Date", key: "membersonenddate" },
        { label: "New Members", key: "newmembers" },
        { label: "Transitioned Into", key: "transitionedinto" },
        { label: "No Changes", key: "nochange" },
        { label: "Membership Expired", key: "expired" },
        { label: "Transitioned Out", key: "transitionedout" },
        { label: "Exit Society", key: "exitsociety" },
    ]

    const totalMemberHeader = [
        { label: "Company ID", key: "id" },
        { label: "Organization", key: "Company" },
        { label: "Website", key: "website" },
        { label: "Primary Contact", key: "PrimaryContact" },
        { label: "Primary Contact Email", key: "PrimaryContactEmail" },
        { label: "Society Join Date", key: "SocietyJoinDate" },
        { label: "City", key: "City" },
        { label: "State", key: "State" },
        { label: "Country", key: "Country" },
        { label: "Transitioned Out of", key: "ExitGroup" },
        { label: "Transitioned Out Date", key: "ExitGroupDate" },
        { label: `Transitioned Into (as of ${moment(dates[1], 'DD-MM-YYYY').format('MM/DD/YYYY')})`, key: "CurrentGroup" },
        { label: "Transitioned Into Date", key: "CurrentGroupJoinDate" }
    ]

    const transitionTotalMemberHeader = [
        { label: "Company ID", key: "id" },
        { label: "Organization", key: "Company" },
        { label: "Society Join Date", key: "SocietyJoinDate" },
        { label: "Previous Group Name", key: "PreviousGroupName" },
        { label: "Current Group", key: "CurrentGroup" },
        { label: "Current Group Join Date", key: "CurrentGroupJoinDate" },
        // { label: "Date Of Change", key: "DateOfChange" },
        { label: "Website", key: "website" },
        { label: "Primary Contact", key: "PrimaryContact" },
        { label: "Primary Contact Email", key: "PrimaryContactEmail" },
        { label: "City", key: "City" },
        { label: "State", key: "State" },
        { label: "Country", key: "Country" },
    ]

    useEffect(() => {
        let data = membersGroup?.map((data) => {
            return groups_array?.find(item => item?.groupname.trim() === data.trim())?.groupid
        })
        setGroupId(data)
        controller.abort();
        controller = new AbortController();
        signal = controller.signal;
    }, [groups_array, membersGroup])

    const fetchMemberDetails = async (uuids, appdir, start_date, end_date) => {
        try {
            setLoading(true)
            let result = await getMembersInfoByUuids(uuids, appdir, start_date, end_date)
            if (result?.success) {
                setMemberDetails(result?.data)
                setSelectedTableData(result?.data)
            }
            setLoading(false)
        } catch (error) {
            console.log("error", error)
        }
    }

    const handleDate = (value, dateStrings) => {
        setDates([dateStrings?.[0], dateStrings?.[1]]);
    }

    useEffect(() => {
        let totalBeginning = 0;
        let totalEnd = 0;
        if (dataSource?.tableData) {
            _map(dataSource.tableData, (val) => {
                totalBeginning += val['countatbeginning'];
                totalEnd += val["membersonenddate"];
            })
        }
        setTotalValues({ start: totalBeginning, end: totalEnd });
    }, [dataSource])

    const handleSendEmail = () => {
        let reviewIds = _map(memberDetails, "CompIDThisConfID").join();
        window.parent.postMessage(
            { reviewIds, type: "Email" },
            "*"
        );
    }

    const handleViewChange = (e) => {
        setActive(e.target.value)
    }

    const handleChartClick = (chartData) => {
        let icon = "targetLinks" in chartData || "sourceLinks" in chartData;
        const { UUIDs, targetLinks, sourceLinks } = chartData;
        let uuid = [];
        if (!_isEmpty(targetLinks)) {
            uuid = targetLinks.map(data => data.UUIDs);
        } else if (!_isEmpty(sourceLinks)) {
            uuid = sourceLinks.map(data => data.UUIDs);
        } else {
            uuid = UUIDs;
        }
        uuid = [].concat.apply([], uuid);
        setSelectedItem({
            ...chartData,
            UUIDs: uuid,
            groupTitle: chartData.source ? chartData.source.name : chartData.name,
            isTable: false,
            icon: !icon,
        });
        fetchMemberDetails(uuid, appdir, dates[0], dates[1])
        setShowModal(true)
    }

    const handleCountClick = (membersData) => {
        let UUIDs = [];
        let totalCount = 0;
        _map(dataSource.tableDataUUIDs, (data) => {
            if (membersData === "TotalEndCount") {
                UUIDs.push(...data.membersonenddate)
                totalCount += data.membersonenddate.length
            } else {
                UUIDs.push(...data.countatbeginning)
                totalCount += data.countatbeginning.length
            }
        })
        setSelectedItem({
            UUIDs: UUIDs,
            value: totalCount,
            isTable: false,
        });
        fetchMemberDetails(UUIDs, appdir, dates[0], dates[1])
        setMemberModal(true)
    }

    const getGroupName = () => {
        let leftSide = "";
        let rightSide = "";
        let middleIcon = "";
        const { isTable, groupTitle, source, target, selectedValue, icon } = selectedItem;

        if (isTable) {
            leftSide = groupTitle;
            rightSide = selectedValue;
        } else {
            if (!_isEmpty(source) || !_isEmpty(target)) {
                leftSide = source.name;
                rightSide = target.name;
            } else {
                leftSide = groupTitle;
            }
        }

        if (isTable) {
            middleIcon = `: `;
        } else if (icon) {
            middleIcon = (<ArrowRightOutlined style={{ fontSize: "15px", marginLeft: "10px", marginRight: "10px" }} />);
        }

        return (
            !selectedItem.isTable ?
                <span>
                    {leftSide}
                    {middleIcon} {rightSide}
                </span> : <span>{`${rightSide}: ( ${leftSide} )`}</span>
        );
    };

    const handleCancel = () => {
        setShowModal(false)
        setMemberModal(false)
        setSelectedTableData([])
        setSearchValue("")
    }

    const handleDateClick = () => {
        getExtendedHistoryInfo(source_hex, groupId, dates[0], dates[1])
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

    const renderActionBar = () => {
        return (
            <div className='pt-2'>
                <Row gutter={16} className='mb-3 mt-3 row-gap'>
                    <Col>
                        <span className="title">BETWEEN</span> : <CommonDatePicker handleDate={handleDate} />
                    </Col>
                    <Col flex={3} className='pl-20'>
                        <div className='d-flex'>
                            <Button icon={<SearchOutlined />} onClick={handleDateClick}>Search</Button>
                        </div>
                    </Col>
                    <Col>
                        <Radio.Group
                            value={active}
                            onChange={handleViewChange}
                        >
                            <Radio.Button value='chart'>Chart</Radio.Button>
                            <Radio.Button value='table'>Table</Radio.Button>
                        </Radio.Group>
                    </Col>
                    {active === "table" ? <Col>
                        <CustomExportCsv
                            dataSource={tableDataSource}
                            Headers={currentTrendHeaders}
                            exportFileName={"trend"}
                        />
                    </Col> :
                        <Col>
                            <DownloadChart domEl={domEl} fileName={{ name: "Current Trend", startDate: moment(dates[0], 'DD-MM-YYYY').format('MM/DD/YYYY'), endDate: moment(dates[1], 'DD-MM-YYYY').format('MM/DD/YYYY') }} />
                        </Col>
                    }
                </Row>
                <Row gutter={16} className='mb-3 mt-5'>
                    <Col flex={3} className="title"> Total Members <span>{`(As of ${moment(dates[0], 'DD-MM-YYYY').format('MM-DD-YYYY')})`} : </span><a style={{ fontWeight: "bold" }} onClick={handleCountClick}>{totalValues.start}</a>
                    </Col>
                    <Col className="title"> Total Members <span>{`(As of ${moment(dates[1], 'DD-MM-YYYY').format('MM-DD-YYYY')})`} : </span><a style={{ fontWeight: "bold" }} onClick={() => handleCountClick("TotalEndCount")}>{totalValues.end}</a>
                    </Col>
                </Row>
            </div>
        )
    }

    const renderChartAndTable = () => {
        if (active === "chart") {
            return <CurrentTrendChart Trend={dataSource} {...props} domEl={domEl} handleChartClick={handleChartClick} />
        }
        if (active === "table") {
            return (<div className="py-2" style={{ width: "100%" }}>
                <Table
                    dataSource={tableDataSource}
                    columns={trendColumn}
                    pagination={false}
                    scroll={{ x: 1500, y: 400 }}
                />
            </div>)
        }
    }

    const renderMemberModal = () => {
        return (
            <div>
                <Modal open={showModal ? showModal : memberModal} title="Member Details" onCancel={handleCancel} footer={null} width='80%'>
                    <Row gutter={16} className='py-3'>
                        {showModal && <Col className="mr-5" style={{ fontSize: "16px" }}>
                            <Typography>Group Name</Typography>
                            <div style={{ fontWeight: 'bold' }}>{getGroupName()}</div>
                        </Col>}
                        <Col flex={'130px'} style={{ fontSize: "16px" }}>
                            <Typography>Total Count</Typography>
                            <div style={{ fontWeight: 'bold' }}>{selectedItem?.value}</div>
                        </Col>
                        <Col style={{ fontSize: "16px" }}>
                            <Typography>Report Type</Typography>
                            <div style={{ fontWeight: 'bold' }}>{"Trends"}</div>
                        </Col>
                    </Row>
                    <Row gutter={16} className='py-3'>
                        <Col flex={3}> <Input placeholder="Search" className="mr-3" allowClear style={{ height: '34px' }} value={searchValue} onChange={onMemberSearch}></Input> </Col>
                        <Col> <Button icon={<MailFilled height="15px" />} onClick={handleSendEmail}> Send Email </Button> </Col>
                        <Col>
                            <CustomExportCsv
                                dataSource={memberDetails?.map((data,index) => {
                                    // let fromGroupName = '';
                                    // let fromGroupExitDate = '';
                                    // let currentGroupName = '';
                                    // let currentGroupJoinDate = '';
                                    // let group_name = selectedItem.selectedValue === 'Transitioned Out' ? 'transitioned_out_details' : 'transitioned_in_details'
                                    // if (selectedItem.selectedValue === 'Transitioned Out') {
                                    //     fromGroupName = selectedItem.groupname !== 'Total' ? selectedItem.groupname : '-';
                                    //     Object.entries(selectedItem.groupUuids?.transitioned_out_details).find(groupArray => {
                                    //         if (groupArray[1].includes(data.UUID)) {
                                    //             currentGroupName = groupArray[0]
                                    //             return true
                                    //         }
                                    //     })
                                        // const check = Object.fromEntries(Object.entries(selectedItem[group_name]).filter((datas) => datas[1]))
                                        // Object.keys(check).map((name) => {
                                        //     if(selectedItem.groupUuids[group_name][name].includes(data.UUID)){
                                        //         currentGroupName = name
                                        //     }
                                        // })
                                    // }
                                    // if (selectedItem.selectedValue === 'Transitioned Into') {
                                    //     currentGroupName = selectedItem.groupname ?? '-';
                                    //     Object.entries(selectedItem.groupUuids?.transitioned_in_details).find(groupArray => {
                                    //         if (groupArray[1].includes(data.UUID)) {
                                    //             fromGroupName = groupArray[0]
                                    //             return true
                                    //         }
                                    //     })

                                        // currentGroupName = selectedItem.groupname ?? '-';
                                        // const check = Object.fromEntries(Object.entries(selectedItem[group_name]).filter((datas) => datas[1]))
                                        // Object.keys(check).map((name) => {
                                        //     if (selectedItem.groupUuids[group_name][name].includes(data.UUID)) {
                                        //         fromGroupName = name
                                        //     }
                                        // })
                                    // }

                                    // if (selectedItem.selectedValue === 'Exit Society') {
                                    //     fromGroupName = selectedItem.groupname ?? '-';
                                    // }
                                    // }
                                    return {
                                        id: data.CompIDThisConfID,
                                        // GroupName: selectedItem.groupname,
                                        // CurrentGroupName: selectedItem.source?.name,
                                        SocietyJoinDate: moment(data.MemberJoinDate).format('DD-MM-YYYY'),
                                        // PreviousGroupName: selectedItem.target?.name,
                                        // DateOfChange: selectedItem.ChangedDate ?? "-",
                                        Company: data.Companyname ? data.Companyname : '-',
                                        City: data.City ? data.City : '-',
                                        State: data.State ? data.State : '-',
                                        Country: data.Country ? data.Country : '-',
                                        ExitGroup: data.exitGroupName,
                                        ExitGroupDate: data.exitGroupExitDate !== "" ? moment(data.exitGroupExitDate).format('MM/DD/YYYY') : "-",
                                        // fromGroupExitDate !== "" ? moment(fromGroupExitDate).format('MM/DD/YYYY') : "-",
                                        CurrentGroup: data.currentGroupName,  //data.GroupName ?? '-',
                                        CurrentGroupJoinDate: data.currentGroupJoinDate !== "" ? moment(data.currentGroupJoinDate).format('MM/DD/YYYY') : "-", 
                                        // currentGroupJoinDate !== "" ? moment(currentGroupJoinDate).format('MM/DD/YYYY') : "-", //data.GroupJoinDate ? moment(data.GroupJoinDate).format('MM/DD/YYYY') : '-', 
                                        PrimaryContact: `${data.PrimaryContactFirstname ?? "-"} ${data.PrimaryContactLastname ?? "-"}`.replace("- -", "-"),
                                        PrimaryContactEmail: data.PrimaryContactEmail ?? '-',
                                        // MemberJoinDate: data.MemberJoinDate ? moment(data.MemberJoinDate).format('MM/DD/YYYY') : '-',
                                        website: data.website ?? '-',
                                    };
                                })}
                                Headers={
                                    selectedItem.isTable ?
                                        totalMemberHeader
                                        : transitionTotalMemberHeader
                                }
                                exportFileName={"Trend"}
                            />
                        </Col>
                    </Row>
                    <Table dataSource={memberDetails} columns={MemberDetailsColumn} pagination={true} className='CurrentMemberTable' scroll={{ y: 300 }} loading={loading} size="small" />
                </Modal>
            </div>
        )
    }

    return (
        <CommonSpinner loading={loading} className='initialLoader'>
            <MultiSelectWidget
                membersGroup={membersGroup}
                groupsArray={groups_array}
                setSelectedMembersGroups={setSelectedMembersGroups}
            />
            {renderActionBar()}
            {!loading && <div>
                {renderChartAndTable()}
            </div>}
            {renderMemberModal()}
        </CommonSpinner>
    )
}