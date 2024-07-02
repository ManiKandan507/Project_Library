import React, { useState, useEffect, useContext, createRef, useCallback, useRef } from "react";
import { Select, Row, Col, DatePicker, Button, Radio, Table, Modal, Typography, Input, Avatar, Checkbox, Alert } from "antd"
import { ArrowDownOutlined, ArrowUpOutlined, MailFilled, UserOutlined } from "@ant-design/icons";
import moment from "moment";
import _map from 'lodash/map';
import GlobalContext from '@/MembershipReportingV2/context/MemberContext';
import DownloadChart from '@/MembershipReportingV2/common/DownloadChart';
import CustomExportCsv from '@/MembershipReportingV2/common/CustomExportCsv';
import { getSalesTableData, getSalesByVolumeTableData, getTotalCount, constructSalesActivity, mapBarData, simpleSalesChart, getDataToConstruct } from '@/MembershipReportingV2/SalesChartWidget/helper';
import { getSalesActivityInfo, getMembersInfoByUuids } from '@/MembershipReportingV2/SalesChartWidget/service';
import { formatDate, convertLowercaseFormat, currentTotalMemberHeader, currencyFormatter, sortName } from '@/AnalyticsAll/StatComponents/util';
import { NoDataFound } from '@/MembershipReportingV2/common/NoDataFound';
import { CurrentSalesChart } from '@/MembershipReportingV2/SalesChartWidget/CurrentSalesChart';
import { DetailedSalesChart } from '@/MembershipReportingV2/SalesChartWidget/DetailedSalesChart';
import CommonSpinner from '@/MembershipReportingV2/common/CommonSpinner';
import { CompareSalesChart } from "./CompareSalesChart";
import { getCompareSalesInfo, getMultiYearSalesInfo } from "./service";
import { compareSalesChart, compareTableData, getBarChartData, getCompareDetailedTableSales, getCompareTableDetailedSales, getCompareTableSales, getMultiYearSalesChart, getYearSalesChart } from "./helper";
import { isEmpty } from "lodash";
import VisualizationType from "./VisualizationTypes";
import CompareSalesTable from "./CompareSalesTable/CompareSalesTable";
import CompareSalesTableV1 from "./CompareSalesTable/CompareSalesTableV1";
import DateRangePickerWidget from "./DateRangePickerWidget";
import CompareSalesTableGroupV1 from "./CompareSalesTable/CompareSalesTableGroupV1";
import YearViewChart from "./YearViewChart";

const SalesbyRevenue = (props) => {

    const chartRef = useRef()
    const [showByConfig] = useState(props?.config?.showByConfig ? true : false);
    const [allowDateChange] = useState(props?.config?.dateTime?.allowDateChange ? true : false);
    const [dateFormat] = useState(props.config?.dateTime?.dateTimeSelectionFormat)
    const [showVisualizationType] = useState(props.config?.showVisualizationType ? true : false)
    const [visualizationType] = useState(props.config?.visualizationType)
    const {
        params: { source_hex, groups_array, client_minimum_year_value, primary_color, appdir },
        type,
        config
    } = props;
    const [configDates] = useState([
        props.config?.dateTime.startDate,
        props.config.dateTime.endDate,
    ]);
    const {
        membersGroup,
        multiYearDates,
        multiYear,
        isDatePickerOpen,
        isTouched,
        setIsTouched,
        selectedDates: contextSelectedDates,
        setSelectedDates: contextSetSelectedDates,
        salesSelectedDates,
        setSalesSelectedDates,
        defaultDates,
        selectedOptions: contextSelectedOptions,
        setDateRangeError,
        viewBy: contextViewBy,
    } = useContext(GlobalContext);

    const [viewBy, setViewBy] = useState(isEmpty(contextViewBy) ? props.config.dateTime.defaultGroupBy.toLowerCase() : contextViewBy)
    const groupid = groups_array.map((data) => {
        return data.groupid
    })

    const [memberCount, setMemberCount] = useState()
    const [active, setActive] = useState(() => {
        return showByConfig
            ? props.config.defaultVisualizationType.toLowerCase()
            : "simple";
    });

    const [selectedDates, setSelectedDates] = useState(() => {
        if (showByConfig) {
            return isTouched ? [multiYearDates[0], multiYearDates[1]] : [props.config.dateTime.startDate, props.config.dateTime.endDate];
        } else {
            return contextSelectedDates;
        }
    })

    const [selectedOptions, setSelectedOptions] = useState(() => {
        if (showByConfig && !allowDateChange) {
            return props.config.dateTime.defaultGroupBy.toLowerCase()
        } else {
            return viewBy
        }
    })

    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [tableDataSource, setTableDataSource] = useState([]);
    const [uuid, setUuid] = useState([]);
    const [memberDetails, setMemberDetails] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [salesModal, setSalesModal] = useState(false);
    const [chartCount, setChartCount] = useState();
    const [searchValue, setSearchValue] = useState("");
    const [selectedTableData, setSelectedTableData] = useState([]);
    const [revenueCount, setRevenueCount] = useState();
    const [tableSource, setTableSource] = useState([]);
    const [sourceData, setSourceData] = useState([]);
    const [filteredBarChartData, setFilteredBarChartData] = useState([])
    const [simpleChartData, setSimpleChartData] = useState([])
    const [compareSalesDataSource, setCompareSalesDataSource] = useState([])
    const [compareTableDataSource, setCompareTableDataSource] = useState([])
    const [compareDetailedTableDataSource, setCompareDetailedTableDataSource] = useState([])

    const [constructedSalesData, setConstructedSalesData] = useState([])
    const [hasCompare, setHasCompare] = useState(
        showByConfig ? props.config.compareMode : false
    );
    const [invoiceKey, setInvoiceKey] = useState("")
    const [groupedBarChartData, setGroupedBarChartData] = useState([])
    const [multiYearDataSource, setMultiYearDataSource] = useState([])
    const [multiYearSalesData, setMultiYearSalesData] = useState([])
    const [multiYearData, setMultiYearData] = useState([])
    const [groupIds, seGroupIds] = useState([])
    const [dateRangeData, setDateRangeData] = useState([])
    const [compareSalesTable, setCompareSalesTable] = useState([])
    const [compareMembershipTypeTable, setCompareMembershipTypeTable] = useState({})
    const [compareTableData, setCompareTableData] = useState([])

    const endDateFormat = moment(selectedDates[1], 'DD/MM/YYYY').format('YYYY-MM-DD')

    const startDateFormat = moment(selectedDates[0], 'DD/MM/YYYY').format('YYYY-MM-DD')

    const startDateQuarter = Math.ceil((new Date(startDateFormat).getMonth() + 1) / 3);

    const endDateQuarter = Math.ceil((new Date(endDateFormat).getMonth() + 1) / 3);

    const leastQuarterDate = moment(selectedDates[0], 'DD/MM/YYYY').add(1, 'quarter').startOf('quarter').format('DD/MM/YYYY')

    const fetchSalesInfo = async (appdir, groupid, start_date, end_date) => {
        try {
            setLoading(true)
            let result = await getSalesActivityInfo(appdir, groupid, start_date, end_date)
            if (result?.success) {
                if (result?.data) {
                    let sales = result.data;
                    if (sales?.length) {
                        setDataSource(sales)
                        setSourceData(sales)
                    }
                }
            }
            setLoading(false)
        } catch (error) {
            console.log("error", error)
        }
    };

    const fetchCompareSalesInfo = async (appdir, groupid, start_date, end_date) => {
        try {
            setLoading(true)
            let result = await getCompareSalesInfo(appdir, groupid, start_date, end_date)
            if (result?.success) {
                if (result?.data) {
                    let compareSales = result.data
                    if (compareSales?.length) {
                        setCompareSalesDataSource(compareSales)
                    }
                }
            }
            setLoading(false)
        } catch (error) {
            console.log("error", error)
        }
    };

    const fetchMultiYearSalesInfo = async (appdir, groupid, start_date, end_date) => {
        try {
            setLoading(true)
            let result = await getMultiYearSalesInfo(appdir, groupid, start_date, end_date)
            if (result?.success) {
                if (result?.data) {
                    let multiYearSales = result.data
                    if (multiYearSales?.length) {
                        setMultiYearDataSource(multiYearSales)
                    }
                }
            }
            setLoading(false)
        }
        catch (error) {
            console.log('error', error)
        }
    }

    useEffect(() => {
        if (hasCompare === true && groupIds.length && (dateFormat !== 'single_month_multi_year' && dateFormat !== 'multi_year')) {
            fetchMultiYearSalesInfo(appdir, groupIds, selectedDates[0], selectedDates[1])
        }
    }, [hasCompare, dateFormat, groupIds])

    useEffect(() => {
        if (hasCompare === false && selectedDates.length) {
            // fetchMultiYearSalesInfo(appdir, groupIds, selectedDates[0], selectedDates[1])
            fetchSalesInfo(appdir, groupid, selectedDates[0], selectedDates[1])
        }
    }, [hasCompare, selectedDates, active]);

    const fetchSalesDetails = async (uuids, sourceHex) => {
        try {
            setLoading(true)
            let result = await getMembersInfoByUuids(uuids, sourceHex)
            if (result?.success) {
                setMemberDetails(result?.data)
                setSelectedTableData(result?.data)
            }
            setLoading(false)
        } catch (error) {
            console.log("error", error)
        }
    }

    useEffect(() => {
        if (viewBy) {
            setSelectedOptions(viewBy)
        }
    }, [viewBy])

    useEffect(() => {
        if (dataSource.length || compareSalesDataSource.length || multiYearDataSource.length) {
            let barView = "date";
            let isIncreasingBarValue = true;
            let invoiceKey = 'DayOfInvoiceKey';
            switch (selectedOptions) {
                case "date": {
                    barView = "date";
                    isIncreasingBarValue = false;
                    invoiceKey = 'DayOfInvoiceKey';
                    break;
                }
                case "week": {
                    barView = "week";
                    isIncreasingBarValue = true;
                    invoiceKey = 'WeekOfInvoiceKey';
                    break;
                }
                case "month": {
                    barView = "month";
                    isIncreasingBarValue = true;
                    invoiceKey = 'MonthOfInvoiceKey';
                    break;
                }
                case "quarter": {
                    barView = "quarter";
                    isIncreasingBarValue = true;
                    invoiceKey = 'QuarterOfInvoiceKey';
                    break;
                }
                case "year": {
                    barView = "year";
                    isIncreasingBarValue = true;
                    invoiceKey = 'YearOfInvoice';
                    break;
                }
                default: {
                    break;
                }
            }

            if (hasCompare) {
                if (active === 'simple') {
                    setDateRangeData(getMultiYearSalesChart({
                        data: multiYearDataSource,
                        invoiceKey,
                        barView,
                        type: type,
                        start_date: selectedDates[0],
                        end_date: selectedDates[1]
                    }))
                }
                if (dateFormat === 'single_month_multi_year') {
                    if (selectedOptions === 'year') {
                        setFilteredBarChartData(getYearSalesChart({
                            data: multiYearDataSource,
                            type: type
                        }))
                    } else {
                        setMultiYearSalesData(getMultiYearSalesChart({
                            data: multiYearDataSource,
                            viewBy: viewBy,
                            type: type,
                            start_date: multiYearDates.length ? multiYearDates[0] : selectedDates[0],
                            end_date: multiYearDates.length ? multiYearDates[1] : selectedDates[1],
                        }))
                    }
                }
                if (dateFormat === 'multi_year') {
                    setMultiYearData(getMultiYearSalesChart({
                        data: multiYearDataSource,
                        viewBy: viewBy,
                        type: type,
                        start_date: multiYear.length ? multiYear[0] : selectedDates[0],
                        end_date: multiYear.length ? multiYear[1] : selectedDates[1],
                    }))
                }
                if (active === 'table') {
                    if (dateFormat === 'single_month_multi_year') {
                        setCompareSalesTable(getCompareTableSales({
                            data: multiYearDataSource,
                            start_date: multiYearDates[0],
                            end_date: multiYearDates[1],
                            viewBy: viewBy,
                            type: type
                        }))
                    }
                    if (dateFormat === 'multi_year') {
                        setCompareSalesTable(getCompareTableSales({
                            data: multiYearDataSource,
                            start_date: multiYear[0],
                            end_date: multiYear[1],
                            viewBy: viewBy,
                            type: type
                        }))
                    }
                }
                if (active === 'table' && dateFormat !== 'single_month_multi_year' && dateFormat !== 'multi_year') {
                    setInvoiceKey(invoiceKey)
                    setCompareTableDataSource(compareTableData(
                        compareSalesDataSource,
                        invoiceKey,
                    ))
                }
            } else {
                if (active === 'detailed') {
                    setFilteredBarChartData(mapBarData({
                        data: constructSalesActivity(dataSource),
                        invoiceKey,
                        barView,
                        isIncreasingBarValue,
                        barValueKey: props.activeTab === "salesByVolume" ? "TotalInvoices" : "TotalRevenue",
                    }));
                }
                if (active === 'simple') {
                    setSimpleChartData(simpleSalesChart({
                        data: getDataToConstruct(dataSource),
                        invoiceKey,
                        barView
                    }))
                }
                if (active === 'table') {
                    if (dateFormat === 'single_month_multi_year') {
                        setCompareSalesTable(getCompareDetailedTableSales({
                            data: dataSource,
                            start_date: multiYearDates[0],
                            end_date: multiYearDates[1],
                            viewBy: viewBy,
                            type: type
                        }))
                    } else {
                        setTableDataSource(getSalesTableData(
                            getDataToConstruct(dataSource),
                            groups_array,
                            invoiceKey
                        ))
                    }
                    setTableSource(getSalesTableData(
                        getDataToConstruct(dataSource),
                        groups_array,
                        invoiceKey
                    ))
                }
            }
        }
    }, [dataSource, props.activeTab, selectedOptions, active, compareSalesDataSource, multiYearDataSource, selectedDates, multiYearDates, type,]);

    const MemberDetailsColumn = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 3.5,
            className: "text-left",
            render: (_, data) => {
                return <div> {data.ReviewIDThisCustID} </div>
            },
        },
        {
            title: "Name",
            dataIndex: "user",
            key: "user",
            width: 7,
            className: "text-left",
            render: (_, data) => {
                return (
                    <div style={{ fontSize: '16px' }}>
                        <Row className="flex-nowrap">
                            <Col flex={1}>
                                <Avatar size={40} alt="profile" icon={<UserOutlined />} src={data?.Picture} />
                            </Col>
                            <Col flex={4} className="ml-3">
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
            width: 6,
            render: (_, data) => {
                return <div> {data.Company ? data.Company : '-'} </div>
            },
        },
        {
            title: "Member Type",
            dataIndex: "GroupName",
            key: "GroupName",
            width: 3.5,
            className: "text-left",
            render: (_, data) => {
                return <div> {data.GroupName ? data.GroupName : '-'} </div>
            },
        },
        {
            title: "Joining Date",
            dataIndex: "MemberJoinDate",
            key: "MemberJoinDate",
            width: 3,
            className: "text-left",
            render: (_, data) => {
                return <div> {moment(data.MemberJoinDate).isValid() ? moment(data.MemberJoinDate).format('DD/MM/YYYY') : "-"} </div>
            },
        },
        {
            title: "Expiration Date",
            dataIndex: "ExpirationDate",
            key: "ExpirationDate",
            width: 3.5,
            className: "text-left",
            render: (_, data) => {
                return <div> {moment(data.ExpirationDate).isValid() ? moment(data.ExpirationDate).format('DD/MM/YYYY') : "-"} </div>
            },
        },
        {
            title: "Action",
            dataIndex: "action",
            key: "action",
            width: 4,
            className: "text-left",
            render: (_, data) => {
                return <Button target="_blank" href={`https://www.xcdsystem.com/${appdir}/admin/contacts/managecontacts/index.cfm?CFGRIDKEY=${data.ReviewIDThisCustID}`}> Manage </Button>
            },
        }
    ]

<<<<<<< HEAD
=======
    useEffect(() => {
        if (dataSource.length) {
          let barView = "date";
          let isIncreasingBarValue = true;
          let invoiceKey = 'DayOfInvoiceKey';
          switch (selectedOptions) {
            case "date": {
              barView = "date";
              isIncreasingBarValue = false;
              invoiceKey = 'DayOfInvoiceKey';
              break;
            }
            case "week": {
              barView = "week";
              isIncreasingBarValue = true;
              invoiceKey = 'WeekOfInvoiceKey';
              break;
            }
            case "month": {
              barView = "month";
              isIncreasingBarValue = true;
              invoiceKey = 'MonthOfInvoiceKey';
              break;
            }
            case "quarter": {
              barView = "quarter";
              isIncreasingBarValue = true;
              invoiceKey = 'QuarterOfInvoiceKey';
              break;
            }
            case "year": {
              barView = "year";
              isIncreasingBarValue = true;
              invoiceKey = 'YearOfInvoice';
              break;
            }
          }
          if(active === 'detailed'){
              setFilteredBarChartData(mapBarData({
                data: constructSalesActivity(dataSource),
                invoiceKey,
                barView,
                isIncreasingBarValue,
                barValueKey: props.activeTab === "salesByVolume" ? "TotalInvoices": "TotalRevenue",
              }));
          }
          if(active === 'simple'){
            setSimpleChartData(simpleSalesChart({
                data: getDataToConstruct(dataSource),
                invoiceKey,
                barView
            }))
          }
          if(active === 'table'){
            setTableDataSource(getSalesTableData(
                getDataToConstruct(dataSource), 
                groups_array,
                invoiceKey
            ))
            setTableSource(getSalesTableData(
                getDataToConstruct(dataSource), 
                groups_array,
                invoiceKey
            ))
          }
        }
    }, [dataSource, props.activeTab, selectedOptions, active]);
>>>>>>> 869aae639d685259d1760f9199b6e8e54991839b

    const handleMemberDataBasedSelectedGroups = () => {
        let totalCount = 0;
        let membershipGroupData;

        if (active === "table") {
            membershipGroupData = membersGroup.map((data) => {
                return tableSource?.filter(item => item?.groupName.trim() === data.trim())
            }).flat();

            membershipGroupData.map((data) => {
                membershipGroupData[0].yearmonth.map((month) => {
                    if (data[month]?.TotalRevenue) {
                        totalCount += data[month]?.TotalRevenue
                    }
                    return month;
                })
                return data;
            })
            setTableDataSource(membershipGroupData)
        } else {
            membershipGroupData = membersGroup.map((data) => {
                return sourceData?.filter(item => item?.GroupName.trim() === data.trim())
            }).flat();

            membershipGroupData?.forEach((data) => {
                totalCount += data.TotalRevenue
            })
            setDataSource(membershipGroupData);
        }
        setMemberCount(totalCount)
    }

    useEffect(() => {
        let updatedGroupId = membersGroup.map((data) => {
            return groups_array?.filter(item => item?.groupname.trim() === data.trim())
        }).flat()
        let groupIds = updatedGroupId.map((group) => group.groupid);
        seGroupIds(groupIds)
    }, [membersGroup])

    useEffect(() => {
        handleMemberDataBasedSelectedGroups()
    }, [sourceData, tableSource, active, membersGroup])

    useEffect(() => {
        let memberUuids = [];
        if (active === 'table') {
            tableDataSource.map((data) => {
                tableDataSource[0].yearmonth?.map((month) => {
                    if (data[month]?.memberUUIDs) {
                        memberUuids.push(...data[month]?.memberUUIDs)
                    }
                })
            })
        } else {
            dataSource?.map((data) => {
                memberUuids.push(...data?.NewMemberUUIDs, ...data?.RenewMemberUUIDs)
            })
        }
        setUuid(memberUuids)
    }, [dataSource])

    const handleSendEmail = () => {
        let reviewIds = _map(memberDetails, "ReviewIDThisCustID").join();
        window.parent.postMessage(
            { reviewIds, type: "Email" },
            "*"
        );
    }

    const handleTableClick = (data) => {
        fetchSalesDetails(data.memberUUIDs, source_hex)
        setChartCount(data.TotalInvoices)
        setRevenueCount(data.TotalRevenue)
        setShowModal(true)
    }

    const getColumn = () => {
        if (!tableDataSource.length) {
            return []
        }
        let monthYear = tableDataSource[0]?.yearmonth;
        let columns = monthYear?.map((month) => {
            return {
                title: `${month}`,
                className: "text-left",
                render: (_, data) => {
                    let text = data[month]?.TotalRevenue;
                    return <>
                        {(text !== 0 && text !== undefined) ? <a onClick={() => handleTableClick(data[month])}> {currencyFormatter(text)}</a> : '-'}
                    </>
                }
            }
        })
        return columns;
    }

    const MemberSalesColumn = [
        {
            title: <div className='primary-color'>PERIOD</div>,
            dataIndex: `${invoiceKey}`,
            key: `${invoiceKey}`,
            colSpan: 2,
            render: (data, row, index) => {
                const obj = {
                    children: data,
                    props: {}
                }
                for (let i = 0; i <= compareTableDataSource.length; i++) {
                    if (index % 2 === 0) {
                        obj.props.rowSpan = 2;
                    }
                    if (index % 2 !== 0) {
                        obj.props.rowSpan = 0;
                    }
                }
                return obj
            },
        },
        {
            title: <div className='primary-color'>YearOfInvoice</div>,
            colSpan: 0,
            dataIndex: 'YearOfInvoice',
            render: (data, row, index) => {
                const obj = {
                    children: data,
                    props: {}
                }
                return obj
            }
        },
        {
            title: <div className='primary-color'>TotalRevenue</div>,
            colSpan: 0,
            dataIndex: selectedOptions === "quarter" ? "TotalSales" : "TotalInvoices",
            key: selectedOptions === "quarter" ? "TotalSales" : "TotalInvoices",
            render: (data, row, index) => {
                const obj = {
                    children: <div style={{ color: '#0070af' }}>$ {data}</div>,
                    props: {}
                }
                return obj
            }
        },
        {
            title: <div className='primary-color'>REVENUE</div>,
            dataIndex: "Percent",
            colSpan: 2,
            render: (data, row, index) => {
                const obj = {
                    children: <div>{data === 'NA' ? data : `${Math.abs(data)} %`} {Math.sign(data) !== 1 || data === "NA" ? <ArrowUpOutlined style={{ color: 'green' }} /> : <ArrowDownOutlined style={{ color: 'red' }} />}</div>,
                    props: {}
                }
                for (let i = 0; i <= compareTableDataSource.length; i++) {
                    if (index % 2 === 0) {
                        obj.props.rowSpan = 2;
                    }
                    if (index % 2 !== 0) {
                        obj.props.rowSpan = 0;
                    }
                }
                return obj
            }
        }
    ];

    const salesColumn = [
        {
            title: "MEMBERSHIP",
            dataIndex: "membership",
            key: "membership",
            className: "text-left",
            children: [
                {
                    title: '',
                    dataIndex: 'groupName',
                    width: 300,
                    fixed: 'left',
                },
            ],
        },
        {
            title: "PERIOD",
            dataIndex: "period",
            key: "period",
            children: getColumn()
        },
    ];

    const handleCountClick = () => {
        let totalCount = 0;
        let totalRevenue = 0;
        fetchSalesDetails(uuid, source_hex)
        dataSource.forEach((data) => {
            totalCount += data.TotalInvoices
            totalRevenue += data.TotalRevenue
        })
        setChartCount(totalCount)
        setRevenueCount(totalRevenue)
        setSalesModal(true)
    }

    const handleChartClick = (chartData) => {
        const { id, data } = chartData
        let uuids = data[`${id}UUIDS`]
        fetchSalesDetails(uuids, source_hex)
        setChartCount(chartData.value)
        setRevenueCount(data.overAllRevenue)
        setShowModal(true)
    }

    const handleCancel = () => {
        setShowModal(false)
        setSearchValue("")
        setSelectedTableData([])
        setSalesModal(false)
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

    useEffect(() => {
        if (isDatePickerOpen === false && groupIds.length && isTouched === true) {
            if (hasCompare === true && (dateFormat !== 'single_month_multi_year' && dateFormat !== 'multi_year')) {
                fetchMultiYearSalesInfo(appdir, groupIds, selectedDates[0], selectedDates[1])
                setIsTouched(false)
            }
        }
    }, [isDatePickerOpen, hasCompare, selectedDates, dateFormat, groupIds])

    useEffect(() => {
        if (isTouched === true && multiYearDates.length) {
            fetchSalesInfo(appdir, groupIds, multiYearDates[0], multiYearDates[1])
        }
    }, [isTouched, multiYearDates, groupIds])

    useEffect(() => {
        if (isDatePickerOpen === false && isTouched === true && hasCompare === false) {
            fetchSalesInfo(appdir, groupid, selectedDates[0], selectedDates[1])
            setIsTouched(false)
        }
    }, [isDatePickerOpen, isTouched, hasCompare, selectedDates])


    useEffect(() => {
        if (isDatePickerOpen === false && isTouched === true && hasCompare === false && groupIds.length) {
            fetchMultiYearSalesInfo(appdir, groupIds, selectedDates[0], selectedDates[1])
        }
    }, [isDatePickerOpen, isTouched, hasCompare, selectedDates, groupIds])

    useEffect(() => {
        if (hasCompare === true && groupIds.length) {
            if (dateFormat === 'multi_year' && multiYear.length) {
                fetchMultiYearSalesInfo(appdir, groupIds, multiYear[0], multiYear[1])
            }
            if (dateFormat === 'single_month_multi_year' && multiYearDates.length) {
                fetchMultiYearSalesInfo(appdir, groupIds, multiYearDates[0], multiYearDates[1])
            }
        }
    }, [hasCompare, multiYear, dateFormat, groupIds, multiYearDates])

    useEffect(() => {
        if (hasCompare === true && groupIds.length) {
            if ((dateFormat === 'single_month_multi_year' && !multiYearDates.length) || (dateFormat === 'multi_year' && !multiYear.length)) {
                fetchMultiYearSalesInfo(appdir, groupIds, selectedDates[0], selectedDates[1])
            }
        }
    }, [hasCompare, groupIds, dateFormat, multiYear, multiYearDates, selectedDates])

    useEffect(() => {
        if (!isEmpty(contextViewBy)) {
            setViewBy(contextViewBy)
        }
    }, [contextViewBy])

    useEffect(() => {
        if (showByConfig && isTouched === true && multiYearDates.length) {
            setSelectedDates(multiYearDates)
        }
    }, [multiYearDates])

    const checkToDisplyDownlodChart = () => {
        return (active !== "table" && (constructedSalesData.length || simpleChartData.length || multiYearSalesData.length || multiYearData.length || dateRangeData.length || filteredBarChartData.length))
    }

    const checkToDisplayExportCSV = () => {
        return (active === 'table' && (tableDataSource.length || compareSalesTable.length || compareTableDataSource.length))
    }

    const compareSalesTableHeader = [
        { label: `MONTH`, key: "NameOfMonth" },
        { label: "YEARS", key: "YearOfInvoice" },
        { label: 'SALES ($)', key: 'TotalRevenue' },
        { label: 'SALES CHANGES (%)', key: "percent" },
    ]

    const compareQuarterTableHeader = [
        { label: `QUARTER`, key: "Quarter" },
        { label: "YEARS", key: "YearOfInvoice" },
        { label: 'SALES ($)', key: 'TotalSales' },
        { label: 'SALES CHANGES (%)', key: "percent" },
    ]

    const year = dataSource.length ? dataSource : multiYearDataSource
    const totalYears = [...new Set(year.map(val => val.YearOfInvoice))].sort((a, b) => b - a);

    const compareMonthTypeHeader = [
        { label: `MONTH`, key: "month" },
        { label: `TYPE`, key: "group" },
    ]

    const compareQuarterTypeHeader = [
        { label: `QUARTER`, key: "quarter" },
        { label: `TYPE`, key: "group" },
    ]

    const compareSalesHeader = [
        { label: "MONTH", key: 'NameOfMonth' },
    ]

    const compareQuarterSalesHeader = [
        { label: "QUARTER", key: 'Quarter' },
    ]

    totalYears.forEach((year) => {
        compareMonthTypeHeader.push({ label: `${year}`, key: `type.${year}` })
        compareQuarterTypeHeader.push({ label: `${year}`, key: `type.${year}` })
        compareSalesHeader.push({ label: `${year}`, key: `data.${year}.TotalRevenue` })
        compareQuarterSalesHeader.push({ label: `${year}`, key: `data.${year}.TotalRevenue` })
    })

    const renderActionBar = () => {
        return (
            <>
                <div className={`d-flex ${!hasCompare ? "totalRevenueVisualizationtypeWrapper" : "visualizationtype-wrapper"}`}>
                    <div className={`${!hasCompare ? "totalRevenueVisualizationtype" : "visualizationtype"}`} >
                        <VisualizationType
                            active={active}
                            setActive={setActive}
                            hasCompare={hasCompare}
                            showByConfig={showByConfig}
                            showVisualizationType={showVisualizationType}
                            visualizationType={visualizationType}
                        />
                    </div>
                    {checkToDisplayExportCSV() ? (
                        <div className="ml-auto">
                            {!allowDateChange ?
                                <CustomExportCsv
                                    dataSource={getSalesByVolumeTableData(tableDataSource, type).data}
                                    Headers={getSalesByVolumeTableData(tableDataSource, type).columns}
                                    exportFileName={"TOTAL REVENUE"}
                                /> : ""
                            }
                            {(allowDateChange && hasCompare === false && (dateFormat === 'single_month_multi_year')) && Object.keys(compareMembershipTypeTable).length ?
                                <CustomExportCsv
                                    dataSource={compareMembershipTypeTable?.tableDataSource}
                                    Headers={viewBy === "month" ? compareMonthTypeHeader : compareQuarterTypeHeader}
                                    exportFileName={"COMPARE TOTAL REVENUE"}
                                /> : ""
                            }
                            {(allowDateChange && (dateFormat === 'multi_year')) ?
                                <CustomExportCsv
                                    dataSource={compareSalesTable}
                                    Headers={compareQuarterTableHeader}
                                    exportFileName={"COMPARE TOTAL REVENUE"}
                                /> : ""
                            }
                        </div>
                    ) : ' '}
                    {checkToDisplyDownlodChart() ? (
                        <div className="ml-auto">
                            <DownloadChart
                                chartRef={chartRef}
                                fileName={{
                                    name: "TOTAL REVENUE",
                                    startDate: defaultDates[0].format("MM/DD/YYYY"),
                                    endDate: defaultDates[1].format("MM/DD/YYYY"),
                                }}
                            />
                        </div>) : ""
                    }
                </div>
                <>
                    {/* <Row gutter={16} className="mt-4 row-gap pl-2">
                    <Col>
                        <VisualizationType
                            active={active}
                            setActive={setActive}
                            hasCompare={hasCompare}
                            showByConfig={showByConfig}
                            showVisualizationType={showVisualizationType}
                            visualizationType={visualizationType}
                        />
                    </Col>
                    {checkToDisplayExportCSV() ? (
                        <Col>
                            {!allowDateChange &&
                                <CustomExportCsv
                                    dataSource={getSalesByVolumeTableData(tableDataSource, type).data}
                                    Headers={getSalesByVolumeTableData(tableDataSource, type).columns}
                                    exportFileName={"TOTAL REVENUE"}
                                />
                            }
                            {(allowDateChange && (dateFormat === 'single_month_multi_year')) &&
                                <CustomExportCsv
                                    dataSource={compareSalesTable}
                                    Headers={compareSalesTableHeader}
                                    exportFileName={"COMPARE TOTAL REVENUE"}
                                />
                            }
                            {(allowDateChange && (dateFormat === 'multi_year')) &&
                                <CustomExportCsv
                                    dataSource={compareSalesTable}
                                    Headers={compareQuarterTableHeader}
                                    exportFileName={"COMPARE TOTAL REVENUE"}
                                />
                            }
                        </Col>
                    ) : ' '}
                    {checkToDisplyDownlodChart() ? (
                        <Col>
                            <DownloadChart
                                chartRef={chartRef}
                                fileName={{
                                    name: "TOTAL REVENUE",
                                    startDate: defaultDates[0].format("MM/DD/YYYY"),
                                    endDate: defaultDates[1].format("MM/DD/YYYY"),
                                }}
                            />
                        </Col>) : ""
                    }
                </Row> */}
                </>
            </>
        );
    }

    const renderChart = () => {
        if (active === 'simple') {
            if (hasCompare === true) {
                if (dateFormat !== 'single_month_multi_year' && dateFormat !== 'multi_year') {
                    return (
                        <div>
                            <CompareSalesChart
                                dataSource={dateRangeData}
                                chartRef={chartRef}
                                type={type}
                                primary_color={primary_color}
                            />
                        </div>
                    )
                }
                if (dateFormat === 'single_month_multi_year') {
                    if (selectedOptions === 'year') {
                        return (
                            <YearViewChart currentMembers={filteredBarChartData} chartRef={chartRef} isvertical={true} primary_color={primary_color} height={'460px'} type={type} />
                        )
                    } else {
                        return (
                            <div>
                                <CompareSalesChart
                                    dataSource={multiYearSalesData}
                                    chartRef={chartRef}
                                    type={type}
                                    primary_color={primary_color}
                                />
                            </div>
                        )
                    }
                }
                if (dateFormat === 'multi_year') {
                    return (
                        <div>
                            <CompareSalesChart
                                dataSource={multiYearData}
                                chartRef={chartRef}
                                type={type}
                                primary_color={primary_color}
                            />
                        </div>
                    )
                }
            } else {
                if (!simpleChartData?.length) {
                    return <NoDataFound />
                }
                return <CurrentSalesChart salesActivity={simpleChartData} chartRef={chartRef} type={type} />
            }
        }
        if (active === 'detailed' && hasCompare === false) {
            if (!filteredBarChartData?.length) {
                return <NoDataFound />
            }
            return (
                <DetailedSalesChart
                    salesActivity={filteredBarChartData}
                    chartRef={chartRef}
                    handleChartClick={handleChartClick}
                    groups_array={groups_array}
                    membersGroup={membersGroup}
                    dataSource={dataSource}
                    type={type}
                />
            )
        }
    }

    const renderTable = () => {
        if (active === "table") {
            if (hasCompare) {
                if (!compareTableDataSource?.length && !compareSalesTable.length) {
                    return <NoDataFound />
                }
                if (dateFormat !== 'single_month_multi_year' && dateFormat !== 'multi_year') {
                    return <div className="py-2">
                        <Table
                            dataSource={compareTableDataSource}
                            columns={MemberSalesColumn} pagination={false}
                            className='salesReportTable compareSalesTable'
                            scroll={{ x: 1200, y: 450 }}
                            bordered
                        />
                    </div>
                }
                if (dateFormat === 'single_month_multi_year') {
                    return (
                        <>
                            <div className="py-2">
                                <CompareSalesTableV1
                                    dataSource={compareSalesTable}
                                    type={type}
                                    pagination={false}
                                    className="salesReportTable compareSalesTable"
                                    scroll={{ x: 1200, y: 450 }}
                                    bordered={true}
                                    startDate={multiYearDates[0]}
                                    viewBy={viewBy}
                                    handleTableClick={handleTableClick}
                                    setCompareTableData={setCompareTableData}
                                />
                            </div>
                        </>
                    )
                }
                if (dateFormat === 'multi_year') {
                    return (
                        <div>
                            <CompareSalesTableV1
                                dataSource={compareSalesTable}
                                type={type}
                                pagination={false}
                                className="salesReportTable compareSalesTable"
                                scroll={{ x: 1200, y: 450 }}
                                bordered={true}
                                startDate={multiYear[0]}
                                viewBy={viewBy}
                                handleTableClick={handleTableClick}
                            />
                        </div>
                    )
                }
            } else {
                if (dateFormat === 'single_month_multi_year') {
                    return (
                        <>
                            <div className="py-2">
                                <CompareSalesTableGroupV1
                                    dataSource={compareSalesTable}
                                    type="revenue"
                                    pagination={false}
                                    className="salesReportTable compareSalesTabl"
                                    scroll={{ x: 1200, y: 450 }}
                                    bordered={true}
                                    startDate={multiYearDates[0]}
                                    viewBy={viewBy}
                                    handleTableClick={handleTableClick}
                                    setCompareMembershipTypeTable={setCompareMembershipTypeTable}
                                />
                            </div>
                        </>
                    )
                }
                if (!tableDataSource?.length) {
                    return <NoDataFound />
                }
                return <div className="py-2" >
                    <Table
                        dataSource={tableDataSource}
                        columns={salesColumn}
                        pagination={false}
                        summary={(tableData) => {
                            let totalCount = [];
                            tableData[0]?.yearmonth.forEach((month) => {
                                totalCount.push(getTotalCount(tableData, month, "revenue"))
                            })
                            return (
                                <Table.Summary fixed>
                                    <Table.Summary.Row style={{ backgroundColor: "#F9F9F9" }}>
                                        <Table.Summary.Cell index={0} className='text-left'><div style={{ color: "#0673b1", fontWeight: 'bold' }}>TOTAL</div></Table.Summary.Cell>
                                        {totalCount.map((data) => {
                                            return (<Table.Summary.Cell className='text-left'>
                                                <Typography> {currencyFormatter(data)}</Typography>
                                            </Table.Summary.Cell>)
                                        })}
                                    </Table.Summary.Row>
                                </Table.Summary>
                            );
                        }}
                        className='salesReportTable'
                        scroll={{ x: 1200, y: 450 }}
                    />
                </div>
            }
        }
    }

    const renderMemberModal = () => {
        return (
            <div>
                <Modal open={showModal ? showModal : salesModal} title="Member Details" onCancel={handleCancel} footer={null} className='popup-modal-width'>
                    <div className='d-flex'>
                        <div className="ml-3" style={{ fontSize: "16px" }}>
                            <Typography>Total Count </Typography>
                            <div style={{ fontWeight: 'bold' }}>{Math.round(chartCount)}</div>
                        </div>
                        <div className="ml-5" style={{ fontSize: "16px" }}>
                            <Typography>Total Revenue</Typography>
                            <div style={{ fontWeight: 'bold' }}>{currencyFormatter(Math.round(revenueCount))}</div>
                        </div>
                        <div className="ml-5" style={{ fontSize: "16px" }}>
                            <Typography>Report Type</Typography>
                            <div style={{ fontWeight: 'bold' }}>{'Sales Activity'}</div>
                        </div>
                    </div>
                    <Row gutter={16} className='py-3'>
                        <Col flex={3}> <Input placeholder="Search" className="mr-3" allowClear style={{ height: '34px' }} value={searchValue} onChange={onMemberSearch}></Input> </Col>
                        <Col><Button icon={<MailFilled height="15px" />} onClick={handleSendEmail}> Send Email </Button> </Col>
                        <Col>
                            <CustomExportCsv
                                dataSource={memberDetails?.map(data => {
                                    return {
                                        user: `${data.Firstname} ${data.Lastname}`,
                                        id: data.ReviewIDThisCustID,
                                        Company: data.Company ? data.Company : '-',
                                        GroupName: data.GroupName ? data.GroupName : '-',
                                        MemberJoinDate: moment(data.MemberJoinDate).format("DD/MM/YYYY"),
                                        ExpirationDate: moment(data.ExpirationDate).format("DD/MM/YYYY"),
                                    };
                                })}
                                Headers={currentTotalMemberHeader}
                                exportFileName={"TOTAL REVENUE"}
                            />
                        </Col>
                    </Row>
                    <Table dataSource={memberDetails} columns={MemberDetailsColumn} pagination={true} className='CurrentMemberTable' scroll={{ y: 300 }} loading={loading} />
                </Modal>
            </div>
        )
    }

    return (
        <CommonSpinner loading={loading}>
            <>
                {config.showByConfig && !config.showChartType ?
                    <>
                        <div className="d-flex mt-5 mb-3">
                            <div className={`d-flex 
                            ${!hasCompare ? "totalRevenueContainer" : ""}`}>
                                <div className="d-flex">
                                    <DateRangePickerWidget
                                        showByConfig={config.showByConfig}
                                        dateFormat={dateFormat}
                                        configDates={configDates}
                                        compareMode={config.compareMode}
                                        minimumYear={client_minimum_year_value}
                                        timeGroupBy={config.dateTime?.timeGroupBy}
                                        props={props}
                                    />
                                </div>
                                {hasCompare !== true &&
                                    <div className="totalRevenueCount minWidth-max">
                                        {"TOTAL REVENUE"} :{" "}
                                        <a
                                            className="menuValues primary-color"
                                            onClick={handleCountClick}
                                        >
                                            {currencyFormatter(Math.round(memberCount))}
                                        </a>
                                    </div>
                                }
                            </div>
                            <div className="d-flex mr-0 ml-auto">
                                {renderActionBar()}
                            </div>
                        </div>
                    </> : renderActionBar()}
                {!loading && <div>
                    {active !== "table" && renderChart()}
                    {active === "table" && renderTable()}
                </div>}
                {renderMemberModal()}
            </>
        </CommonSpinner>
    )
}
export default SalesbyRevenue