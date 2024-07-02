import React, { useState, useEffect, useContext, useCallback } from 'react'
import { Row, Col, Table, Button, Select, Modal, Typography, Input, Avatar, DatePicker } from 'antd'
import { ArrowDownOutlined, ArrowUpOutlined, MailFilled, SearchOutlined, UserOutlined } from '@ant-design/icons';
import _flattenDeep from "lodash/flattenDeep";
import _groupBy from "lodash/groupBy";
import _map from 'lodash/map';
import _sumBy from 'lodash/sumBy';
import moment from 'moment';
import CommonSpinner from '@/MembershipReportingV2/common/CommonSpinner';
import { NoDataFound } from '@/MembershipReportingV2/common/NoDataFound';
import { convertLowercaseFormat, currencyFormatter, currentTotalMemberHeader, sortGroupName, sortName, formatDate } from '@/AnalyticsAll/StatComponents/util';
import CustomExportCsv from '@/MembershipReportingV2/common/CustomExportCsv';
import GlobalContext from '@/MembershipReportingV2/context/MemberContext';
import { getMembersInfoByUuids, getSalesActivityInfo, getCompareSalesInfo } from '@/MembershipReportingV2/SalesChartWidget/service';
import { addValuesInObj, combineAllArrays, getDataToConstruct } from '@/MembershipReportingV2/SalesChartWidget/helper';
import MultiSelectWidget from '../common/MultiSelectWidget';
import { isEmpty } from 'lodash';
import { getCompareSalesChartInfo, getMultiYearTableData } from './helper';
import { getMultiYearSalesInfo } from './service';
import DateRangePickerWidget from './DateRangePickerWidget';

const ReportTable = (props) => {
    const [showByConfig] = useState(props?.config?.showByConfig ? true : false);
    const [compareMode] = useState(props?.config?.compareMode ? true : false)
    const [allowDateChange] = useState(props?.config?.dateTime?.allowDateChange ? true : false);
    const visualizationType = props?.config?.visualizationType;
    const [dateFormat] = useState(props.config?.dateTime?.dateTimeSelectionFormat)
    const [salesYears, setSalesYears] = useState([])
    const [configDates] = useState([
        props.config?.dateTime.startDate,
        props.config.dateTime.endDate,
    ]);
    const {
        membersGroup,
        setSelectedMembersGroups,
        multiYearDates,
        multiYear,
        isDatePickerOpen,
        isTouched,
        setIsTouched,
        setMultiYearDates,
        selectedOptions,
        setSelectedOptions,
        selectedDates,
        setSelectedDate,
        defaultDates,
    } = useContext(GlobalContext);

    const { params: { source_hex, groups_array, appdir, client_minimum_year_value }, config } = props

    const groupid = groups_array.map((data) => {
        return data.groupid
    })

    const [tableSource, setTableSource] = useState([])
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [chartCount, setChartCount] = useState();
    const [searchValue, setSearchValue] = useState("");
    const [selectedTableData, setSelectedTableData] = useState([]);
    const [memberDetails, setMemberDetails] = useState([])
    const [tableDataSource, setTableDataSource] = useState([])
    const [salesActivity, setSalesActivity] = useState([])
    const [revenueCount, setRevenueCount] = useState()
    const [compareTableDataSource, setCompareTableDataSource] = useState([])
    const [compareTableData, setCompareTableData] = useState([])
    const [multiYearData, setMultiYearData] = useState([])
    const [multiYearTableData, setMultiYearTableData] = useState([])
    const [groupIds, seGroupIds] = useState([])
    const [sourceData, setSourceData] = useState([])

    const fetchSalesInfo = async (appdir, groupid, start_date, end_date) => {
        try {
            setLoading(true)
            let result = await getSalesActivityInfo(appdir, groupid, start_date, end_date)
            if (result?.success) {
                setSalesActivity(result.data)
                setSourceData(result.data)
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
                        setCompareTableDataSource(compareSales)
                    }
                }
            }
            setLoading(false)
        } catch (error) {
            console.log("error", error)
        }
    };

    useEffect(() => {
        if (compareMode && dateFormat === 'date_range') {
            fetchCompareSalesDetails(appdir, groupIds, selectedDates[0], selectedDates[1])
        }
    }, [compareMode, groupIds, selectedDates])

    useEffect(() => {
        if (compareMode === false) {
            fetchSalesInfo(appdir, groupid, selectedDates[0], selectedDates[1])
        }
    }, [compareMode, selectedDates])

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

    const fetchCompareSalesDetails = async (appdir, groupid, start_date, end_date) => {
        try {
            setLoading(true)
            let result = await getMultiYearSalesInfo(appdir, groupid, start_date, end_date)
            if (result?.success) {
                if (result?.data) {
                    let multiYearData = result?.data
                    if (multiYearData?.length) {
                        setMultiYearData(multiYearData)
                    }
                }
            }
            setLoading(false)
        } catch (error) {
            console.log('error', error)
        }
    }

    const getReportTableData = (data) => {
        let totalMembers = 0;
        let totalRevenue = 0;
        let totalNewMembers = 0;
        let totalNewMemRevenue = 0;
        let totalRenewMem = 0;
        let totalRenewMemRevenue = 0;
        let constructedDataSource = _map(_groupBy(data, "GroupID"), (groupArr) => {
            let UUIDObj = combineAllArrays(groupArr, ["NewMemberUUIDs", "RenewMemberUUIDs"]);
            return {
                GroupID: groupArr[0]["GroupID"],
                GroupName: groupArr[0]["GroupName"],
                ...addValuesInObj(groupArr, ["TotalInvoices", "TotalRevenue", "NewMembers", "RenewingMembers", "RenewingMembersRevenue", "NewMembersRevenue"]),
                ...UUIDObj,
                MembersUUIDs: _flattenDeep(Object.values(UUIDObj)),
            }
        }).flat(1)

        constructedDataSource.forEach((data) => {
            totalMembers += data.TotalInvoices;
            totalRevenue += data.TotalRevenue;
            totalNewMembers += data.NewMembers;
            totalNewMemRevenue += data.NewMembersRevenue;
            totalRenewMem += data.RenewingMembers;
            totalRenewMemRevenue += data.RenewingMembersRevenue;
        })

        const constructedData = constructedDataSource.map((val) => {
            return {
                ...val,
                TotalMembersPercentage: `${((val.TotalInvoices / totalMembers) * 100).toFixed(2)}`,
                TotalRevenuePercentage: `${((val.TotalRevenue / totalRevenue) * 100).toFixed(2)}`,
                TotalNewMembersPercentage: `${((val.NewMembers / totalNewMembers) * 100).toFixed(2)}`,
                TotalNewMembersRevenuePercentage: `${((val.NewMembersRevenue / totalNewMemRevenue) * 100).toFixed(2)}`,
                TotalRenewMemPercentage: `${((val.RenewingMembers / totalRenewMem) * 100).toFixed(2)}`,
                TotalRenewMemRevenuePercentage: `${((val.RenewingMembersRevenue / totalRenewMemRevenue) * 100).toFixed(2)}`
            }
        })

        return constructedData
    }

    // const getCompareTableData = (data) => {
    //     const addValues = (arr, keys) => {
    //         let returnObj = {};
    //         keys.map(key => {
    //             if(key === 'NewMembers' || key === 'RenewingMembers'){
    //                 returnObj['Members'] = _sumBy(arr, key) 
    //             }
    //             if(key === 'NewMembersRevenue' || key === 'RenewingMembersRevenue'){
    //                 returnObj['Revenue'] = _sumBy(arr, key) 
    //             }
    //         })
    //         return returnObj
    //     }

    //     const getPercentage = (members) =>{
    //         let constructedSalesData = _map(_groupBy(data, 'YearOfInvoice'), (groupArr, key) => {
    //             return {
    //                 ...groupArr, totalMembersCount: _sumBy(groupArr, members), years: key
    //             }
    //         })
    //         let prevYearSales = ((constructedSalesData[1]?.totalMembersCount - constructedSalesData[0]?.totalMembersCount)/constructedSalesData[1]?.totalMembersCount * 100).toFixed(2);
    //         let currentYearSales = ((constructedSalesData[2]?.totalMembersCount - constructedSalesData[1]?.totalMembersCount)/constructedSalesData[2]?.totalMembersCount * 100).toFixed(2);

    //         let yearsData = {
    //             [constructedSalesData[0]?.years] : '-',
    //             [constructedSalesData[1]?.years] : prevYearSales,
    //             [constructedSalesData[2]?.years] : currentYearSales
    //         }
    //         return yearsData
    //     }

    //     let newMemberData = _map(_groupBy(data, 'YearOfInvoice'), (groupArr, key) => {
    //         let UUIDObj = combineAllArrays(groupArr, ["NewMemberUUIDs"])
    //         return {
    //             YearOfInvoice: groupArr[0]["YearOfInvoice"],
    //             Type: 'NEW',
    //             ...addValues(groupArr, [ "NewMembers",  "NewMembersRevenue"]),
    //             ...UUIDObj,
    //             salesPercentage: getPercentage('NewMembers')[key],
    //             revenuePercentage :getPercentage('NewMembersRevenue')[key]
    //         }
    //     }).sort((rec1, rec2)=>rec2.YearOfInvoice - rec1.YearOfInvoice)

    //     let renewedMemberData = _map(_groupBy(data, 'YearOfInvoice'), (groupArr, key) => {
    //         let UUIDObj = combineAllArrays(groupArr, ["RenewMemberUUIDs"])
    //         return {
    //             YearOfInvoice: groupArr[0]['YearOfInvoice'],
    //             Type: 'RENEWING',
    //             ...addValues(groupArr, [ "RenewingMembers",  "RenewingMembersRevenue"]),
    //             ...UUIDObj,
    //             salesPercentage: getPercentage('RenewingMembers')[key],
    //             revenuePercentage : getPercentage('RenewingMembersRevenue')[key]
    //         }
    //     }).sort((rec1, rec2)=>rec2.YearOfInvoice - rec1.YearOfInvoice)

    //     let totalMembersData = newMemberData.map((val, key)=>{
    //         let totalMember;
    //         let totalRevenue;
    //         let salesPercentage; 
    //         let revenuePercentage;
    //         let totalMembersUUIDS;

    //         renewedMemberData.map((data)=>{
    //             if(val.YearOfInvoice === data.YearOfInvoice){
    //                 totalMember = val.Members + data.Members
    //                 totalRevenue = val.Revenue + data.Revenue
    //                 totalMembersUUIDS = [...val.NewMemberUUIDs,...data.RenewMemberUUIDs]
    //                 salesPercentage = ((Number(val.salesPercentage) + Number(data.salesPercentage))/2).toFixed(2)
    //                 revenuePercentage = ((Number(val.revenuePercentage) + Number(data.revenuePercentage))/2).toFixed(2)
    //             }
    //         })

    //         return { 
    //             YearOfInvoice : val.YearOfInvoice,
    //             Type : 'TOTAL',
    //             Members: totalMember,
    //             Revenue: totalRevenue,
    //             TotalMemberUUIDs: totalMembersUUIDS,
    //             salesPercentage: !isNaN(salesPercentage) ? Number(salesPercentage) : '-',
    //             revenuePercentage: !isNaN(revenuePercentage) ? Number(revenuePercentage) : '-'
    //         }
    //     }).sort((rec1, rec2)=>rec2.YearOfInvoice - rec1.YearOfInvoice)

    //     let salesYears = newMemberData.map((val) => {
    //         return val.YearOfInvoice
    //     })
    //     setSalesYears(salesYears)


    //     let compareTableData = [...newMemberData, ...renewedMemberData, ...totalMembersData]

    //     return compareTableData
    // } 

    const getMultiYearTableData = ({ data, start_date, end_date }) => {
        let startDate = moment(start_date, 'DD/MM/YYYY');
        let endDate = moment(end_date, 'DD/MM/YYYY');

        let dates = [];
        endDate.subtract(1, "month");
        let month = moment(startDate, 'DD/MM/YYYY').subtract(1, 'month');
        while (month <= endDate) {
            month.add(1, "month");
            dates.push({
                MonthOfInvoice: `${month.format("MM")}`,
                YearOfInvoice: `${month.format('YYYY')}`,
                TotalInvoices: 0,
                TotalRevenue: 0,
                MonthOfInvoiceKey: `${month.format('MM-YYYY')}`,
                RenewMemberUUIDs: [],
                NewMemberUUIDs: [],
                NewMembers: 0,
                NewMembersRevenue: 0,
                RenewingMembers: 0,
                RenewingMembersRevenue: 0
            });
        }

        const constructedDatas = dates.map(emptyObj => {
            let available = data.find(res => res.MonthOfInvoiceKey === emptyObj.MonthOfInvoiceKey);
            if (available) {
                return available
            } else {
                return emptyObj
            }
        })

        const addValues = (arr, keys) => {
            let returnObj = {};
            keys.map(key => {
                if (key === 'NewMembers' || key === 'RenewingMembers') {
                    returnObj['Members'] = _sumBy(arr, key)
                }
                if (key === 'NewMembersRevenue' || key === 'RenewingMembersRevenue') {
                    returnObj['Revenue'] = parseFloat(_sumBy(arr, key).toFixed(2))
                }
            })
            return returnObj
        }

        const currentMonth = `${moment().format('MM')}`
        const currentYear = `${moment().format('YYYY')}`

        const filteredData = constructedDatas.filter((value) =>
            ((value.MonthOfInvoice <= currentMonth && value.YearOfInvoice <= currentYear) || (value.MonthOfInvoice > currentMonth && value.YearOfInvoice < currentYear)))

        const getPercentage = (members) => {
            let salesData = _map(_groupBy(filteredData, 'YearOfInvoice'), (groupArr, key) => {
                return {
                    ...groupArr, totalMembersCount: _sumBy(groupArr, members), years: key
                }
            }).sort((rec1, rec2) => rec2.years - rec1.years)

            let salesPercent = {}
            let totalPercent = {}
            for (let i = 0; i < salesData.length; i++) {
                if (salesData[i]?.totalMembersCount) {
                    salesPercent = ((salesData[i + 1]?.totalMembersCount - salesData[i]?.totalMembersCount) / salesData[i]?.totalMembersCount * 100).toFixed(2);
                    let year = salesData[i]?.years;
                    totalPercent = {
                        ...totalPercent, [year]: salesPercent
                    }
                }
            }
            return totalPercent
        }

        let newMemberData = _map(_groupBy(filteredData, 'YearOfInvoice'), (groupArr, key) => {
            let UUIDObj = combineAllArrays(groupArr, ["NewMemberUUIDs"])
            return {
                YearOfInvoice: groupArr[0]["YearOfInvoice"],
                Type: 'NEW',
                ...addValues(groupArr, ["NewMembers", "NewMembersRevenue"]),
                ...UUIDObj,
                salesPercentage: getPercentage('NewMembers')[key],
                revenuePercentage: getPercentage('NewMembersRevenue')[key]
            }
        }).sort((rec1, rec2) => rec2.YearOfInvoice - rec1.YearOfInvoice)

        let renewedMemberData = _map(_groupBy(filteredData, 'YearOfInvoice'), (groupArr, key) => {
            let UUIDObj = combineAllArrays(groupArr, ["RenewMemberUUIDs"])
            return {
                YearOfInvoice: groupArr[0]['YearOfInvoice'],
                Type: 'RENEWING',
                ...addValues(groupArr, ["RenewingMembers", "RenewingMembersRevenue"]),
                ...UUIDObj,
                salesPercentage: getPercentage('RenewingMembers')[key],
                revenuePercentage: getPercentage('RenewingMembersRevenue')[key]
            }
        }).sort((rec1, rec2) => rec2.YearOfInvoice - rec1.YearOfInvoice)

        let totalMembersData = newMemberData.map((val, key) => {
            let totalMember;
            let totalRevenue;
            let salesPercentage;
            let revenuePercentage;
            let totalMembersUUIDS;



            renewedMemberData.map((data) => {
                if (val.YearOfInvoice === data.YearOfInvoice) {
                    totalMember = val.Members + data.Members
                    totalRevenue = val.Revenue + data.Revenue
                    totalMembersUUIDS = [...val.NewMemberUUIDs, ...data.RenewMemberUUIDs]
                    salesPercentage = ((Number(val.salesPercentage) + Number(data.salesPercentage)) / 2).toFixed(2)
                    revenuePercentage = ((Number(val.revenuePercentage) + Number(data.revenuePercentage)) / 2).toFixed(2)
                }
            })

            return {
                YearOfInvoice: val.YearOfInvoice,
                Type: 'TOTAL',
                Members: totalMember,
                Revenue: totalRevenue,
                TotalMemberUUIDs: totalMembersUUIDS,
                salesPercentage: salesPercentage,
                revenuePercentage: revenuePercentage
            }
        }).sort((rec1, rec2) => rec2.YearOfInvoice - rec1.YearOfInvoice)

        let salesYears = newMemberData.map((val) => {
            return val.YearOfInvoice
        })

        setSalesYears(salesYears)

        let compareTableData = [...newMemberData, ...renewedMemberData, ...totalMembersData]

        return compareTableData
    }

    const MemberSalesColumn = [
        {
            title: <div className='primary-color'>MEMBERS TYPE</div>,
            // colspan: 6,
            width: "15%",
            dataIndex: 'Type',
            render: (data, row, index) => {
                const obj = {
                    children: <div>{data}</div>,
                    props: {}
                }
                for (let i = 0; i <= multiYearTableData.length; i++) {
                    if (index % salesYears.length === 0) {
                        obj.props.rowSpan = salesYears.length;
                    }
                    if (index % salesYears.length !== 0) {
                        obj.props.rowSpan = 0;
                    }
                }
                return obj
            }
        },
        {
            title: <div className='primary-color'>YEARS</div>,
            colspan: 0,
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
            title: <div className='primary-color'>SALES</div>,
            colspan: 0,
            dataIndex: 'Members',
            render: (_, data) => {
                let textSalesPercentage = data.salesPercentage;
                let text = data.Members
                if (data.Type === 'NEW') {
                    return (
                        <div>
                            {text === 0 ? '-' : <a
                                onClick={() =>
                                    handleCompareTableClick(data, "newMembers")
                                }
                            >
                                {text}
                            </a>}
                            {!Number(textSalesPercentage) ? "" : (
                                <>
                                    {" "} ({Math.abs(textSalesPercentage)}%
                                    {Math.sign(textSalesPercentage) !== 1 ? (
                                        <ArrowUpOutlined style={{ color: "green" }} />
                                    ) : (
                                        <ArrowDownOutlined style={{ color: "red" }} />
                                    )})
                                </>
                            )}
                        </div>
                    );
                } else if (data.Type === 'RENEWING') {
                    return (
                        <div>
                            {text === 0 ? '-' : <a
                                onClick={() =>
                                    handleCompareTableClick(data, "renewMembers")
                                }
                            >
                                {text}
                            </a>}
                            {!Number(textSalesPercentage) ? "" : (
                                <>
                                    {" "} ({Math.abs(textSalesPercentage)}%
                                    {Math.sign(textSalesPercentage) !== 1 ? (
                                        <ArrowUpOutlined style={{ color: "green" }} />
                                    ) : (
                                        <ArrowDownOutlined style={{ color: "red" }} />
                                    )})
                                </>
                            )}
                        </div>
                    );
                } else {
                    return (
                        <div>
                            {text === 0 ? '-' :
                                <a onClick={() => handleCompareTableClick(data)}>
                                    {text}
                                </a>
                            }
                            {!Number(textSalesPercentage) ? "" : (
                                <>
                                    {" "} ({Math.abs(textSalesPercentage)}%
                                    {Math.sign(textSalesPercentage) !== 1 ? (
                                        <ArrowUpOutlined style={{ color: "green" }} />
                                    ) : (
                                        <ArrowDownOutlined style={{ color: "red" }} />
                                    )})
                                </>
                            )}
                        </div>
                    );
                }
            }
        },
        // {
        //     title: 'SALES CHANGES',
        //     colspan: 0,
        //     dataIndex: 'salesPercentage',
        //     render: (_,data) => {
        //         let text = data.salesPercentage;
        //         return <div>{text !== 'NaN' ? `${Math.abs(text)}%` : '-'} { text !== 'NaN' ? Math.sign(text) !== 1 ? <ArrowUpOutlined  style={{color: 'green'}} /> : <ArrowDownOutlined  style={{color:'red'}} /> : '' }</div>
        //     }
        // },
        {
            title: <div className='primary-color'>REVENUE</div>,
            colspan: 0,
            dataIndex: 'Revenue',
            render: (_, data) => {
                let textRevenuePercentage = data.revenuePercentage;
                let text = data.Revenue
                if (data.Type === 'NEW') {
                    return (
                        <div>
                            {text === 0 ? '-' : <a onClick={() => handleCompareTableClick(data, "newMembers")}>
                                {currencyFormatter(text)}
                            </a>}
                            {!Number(textRevenuePercentage) ? "" : (
                                <>
                                    {" "} ({Math.abs(textRevenuePercentage)}%
                                    {Math.sign(textRevenuePercentage) !== 1 ? (
                                        <ArrowUpOutlined style={{ color: "green" }} />
                                    ) : (
                                        <ArrowDownOutlined style={{ color: "red" }} />
                                    )})
                                </>
                            )}
                        </div>
                    );
                } else if (data.Type === 'RENEWING') {
                    return (
                        <div>
                            {text === 0 ? '-' : <a onClick={() => handleCompareTableClick(data, "renewMembers")}>
                                {currencyFormatter(text)}
                            </a>}
                            {!Number(textRevenuePercentage) ? "" : (
                                <>
                                    {" "} ({Math.abs(textRevenuePercentage)}%
                                    {Math.sign(textRevenuePercentage) !== 1 ? (
                                        <ArrowUpOutlined style={{ color: "green" }} />
                                    ) : (
                                        <ArrowDownOutlined style={{ color: "red" }} />
                                    )})
                                </>
                            )}
                        </div>
                    );
                } else {
                    return (
                        <div>
                            {text === 0 ? '-' : <a onClick={() => handleCompareTableClick(data)}>
                                {currencyFormatter(text)}
                            </a>}
                            {!Number(textRevenuePercentage) ? "" : (
                                <>
                                    {" "} ({Math.abs(textRevenuePercentage)}%
                                    {Math.sign(textRevenuePercentage) !== 1 ? (
                                        <ArrowUpOutlined style={{ color: "green" }} />
                                    ) : (
                                        <ArrowDownOutlined style={{ color: "red" }} />
                                    )})
                                </>
                            )}
                        </div>
                    );
                }
            }
        },
        // {
        //     title: 'REVENUE CHANGES',
        //     colspan: 0,
        //     dataIndex: 'revenuePercentage',
        //     render: (_, data) => {
        //         let text = data.revenuePercentage;
        //         return <div>{text !== 'NaN' ? `${Math.abs(text)}%` : '-'} { text !== 'NaN' ? Math.sign(text) !== 1 ? <ArrowUpOutlined  style={{color: 'green'}} /> : <ArrowDownOutlined  style={{color:'red'}} /> : '' }</div>  
        //     }
        // },  
    ]

    useEffect(() => {
        if (salesActivity.length || compareTableDataSource.length || multiYearData.length) {
            let invoiceKey = 'DayOfInvoiceKey';
            switch (selectedOptions) {
                case "date": {
                    invoiceKey = 'DayOfInvoiceKey';
                    break;
                }
                case "week": {
                    invoiceKey = 'WeekOfInvoiceKey';
                    break;
                }
                case "month": {
                    invoiceKey = 'MonthOfInvoiceKey';
                    break;
                }
                case "quarter": {
                    invoiceKey = 'QuarterOfInvoiceKey';
                    break;
                }
                case "year": {
                    invoiceKey = 'YearOfInvoice';
                    break;
                }
                default: {
                    break;
                }
            }
            if (compareMode && dateFormat === 'single_month_multi_year') {
                setMultiYearTableData(getMultiYearTableData({
                    data: getCompareSalesChartInfo(multiYearData),
                    start_date: multiYearDates[0],
                    end_date: multiYearDates[1]
                    // start_date: multiYearDates.length ? multiYearDates[0] : selectedDates[0], 
                    // end_date: multiYearDates.length ? multiYearDates[1] : selectedDates[1]
                }))
            }
            if (compareMode === false) {
                setTableDataSource(getReportTableData(
                    getDataToConstruct(salesActivity),
                    groups_array,
                    invoiceKey
                ))
            }
            if (compareMode && dateFormat === 'multi_year') {
                setMultiYearTableData(getMultiYearTableData({
                    data: getCompareSalesChartInfo(multiYearData),
                    start_date: multiYear[0],
                    end_date: multiYear[1]
                }))
            }
            if (compareMode && dateFormat === 'date_range') {
                setMultiYearTableData(getMultiYearTableData({
                    data: getCompareSalesChartInfo(multiYearData),
                    start_date: selectedDates[0],
                    end_date: selectedDates[1]
                }))
            }
            // setTableSource(getReportTableData(
            //     getDataToConstruct(salesActivity), 
            //     groups_array,
            //     invoiceKey
            // ))
            // setCompareTableData(getCompareTableData(
            //     getCompareSalesChartInfo(compareTableDataSource),
            //     groups_array,
            //     invoiceKey
            // ))
        }
    }, [salesActivity, selectedOptions, compareMode, visualizationType, compareTableDataSource, multiYearData]);

    const MemberDetailsColumn = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width:2,
            className: "text-left",
            render: (_, data) => {
                return <div> {data.ReviewIDThisCustID} </div>
            },
        },
        {
            title: "Name",
            dataIndex: "user",
            key: "user",
            width:7,
            className: "text-left",
            render: (_, data) => {
                return (
                    <div style={{ fontSize: '16px' }}>
                        <Row style={{ flexWrap: "nowrap" }}>
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
            width:6,
            render: (_, data) => {
                return <div> {data.Company ? data.Company : '-'} </div>
            },
        },
        {
            title: "Member Type",
            dataIndex: "GroupName",
            key: "GroupName",
            width:3.5,
            className: "text-left",
            render: (_, data) => {
                return <div> {data.GroupName ? data.GroupName : '-'} </div>
            },
        },
        {
            title: "Joining Date",
            dataIndex: "MemberJoinDate",
            key: "MemberJoinDate",
            width:3,
            className: "text-left",
            render: (_, data) => {
                return <div> {moment(data.MemberJoinDate).isValid() ? moment(data.MemberJoinDate).format('DD/MM/YYYY') : "-"} </div>
            },
        },
        {
            title: "Expiration Date",
            dataIndex: "ExpirationDate",
            key: "ExpirationDate",
            width:3.5,
            className: "text-left",
            render: (_, data) => {
                return <div> {moment(data.ExpirationDate).isValid() ? moment(data.ExpirationDate).format('DD/MM/YYYY') : "-"} </div>
            },
        },
        {
            title: "Action",
            dataIndex: "action",
            key: "action",
            width:4,
            className: "text-left",
            render: (_, data) => {
                return <Button target="_blank" href={`https://www.xcdsystem.com/${appdir}/admin/contacts/managecontacts/index.cfm?CFGRIDKEY=${data.ReviewIDThisCustID}`}> Manage </Button>
            },
        }
    ]

    const handleMemberDataBasedSelectedGroups = () => {
        let membershipGroupData;

        membershipGroupData = membersGroup.map((data) => {
            return sourceData?.filter(item => item?.GroupName.trim() === data.trim())
        }).flat();

        setSalesActivity(membershipGroupData);
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
    }, [sourceData, tableSource, membersGroup])

    // useEffect(() => {
    //     if (salesActivity?.length) {
    //         let constructedDataSource = _map(_groupBy(salesActivity, "GroupID"), (groupArr) => {
    //             let UUIDObj = combineAllArrays(groupArr, ["NewMemberUUIDs", "RenewMemberUUIDs"]);
    //             return {
    //                 GroupID: groupArr[0]["GroupID"],
    //                 GroupName: groupArr[0]["GroupName"],
    //                 ...addValuesInObj(groupArr, ["TotalInvoices", "TotalRevenue", "NewMembers",  "RenewingMembers", "RenewingMembersRevenue",  "NewMembersRevenue"]),
    //                 ...UUIDObj,
    //                 MembersUUIDs: _flattenDeep(Object.values(UUIDObj)),
    //             }
    //         })
    //         setTableDataSource(constructedDataSource);
    //         setTableSource(constructedDataSource);
    //     }
    // }, [salesActivity])

    useEffect(() => {
        if (isDatePickerOpen === false && isTouched === true) {
            if (compareMode === false) {
                fetchSalesInfo(appdir, groupid, selectedDates[0], selectedDates[1])
                setIsTouched(false)
            }
            if (compareMode && groupIds.length) {
                fetchCompareSalesDetails(appdir, groupIds, selectedDates[0], selectedDates[1])
                setIsTouched(false)
            }
        }
    }, [isDatePickerOpen, compareMode, groupIds, isTouched])

    useEffect(() => {
        if (compareMode === true && groupIds.length) {
            if (dateFormat === 'single_month_multi_year' && multiYearDates.length) {
                fetchCompareSalesDetails(appdir, groupIds, multiYearDates[0], multiYearDates[1])
            }
            if (dateFormat === 'multi_year' && multiYear.length) {
                fetchCompareSalesDetails(appdir, groupIds, multiYear[0], multiYear[1])
            }
        }
    }, [dateFormat, multiYearDates, groupIds, multiYear, compareMode])

    const handleSendEmail = () => {
        let reviewIds = _map(memberDetails, "ReviewIDThisCustID").join();
        window.parent.postMessage(
            { reviewIds, type: "Email" },
            "*"
        );
    }

    const handleReportTableClick = (data, Members) => {
        let TotalCount;
        let TotalRevenue;
        let UUIDS;
        if (Members === 'newMembers') {
            TotalCount = data.NewMembers;
            TotalRevenue = data.NewMembersRevenue;
            UUIDS = data.NewMemberUUIDs;
        } else if (Members === 'renewMembers') {
            TotalCount = data.RenewingMembers;
            TotalRevenue = data.RenewingMembersRevenue;
            UUIDS = data.RenewMemberUUIDs;
        } else {
            TotalCount = data.TotalInvoices;
            TotalRevenue = data.TotalRevenue;
            UUIDS = data.MembersUUIDs;
        }
        fetchSalesDetails(UUIDS, source_hex)
        setChartCount(TotalCount)
        setRevenueCount(TotalRevenue)
        setShowModal(true)
    }

    const handleCompareTableClick = (data, Members) => {
        let UUIDS;
        let TotalCount;
        let TotalRevenue;
        if (Members === 'newMembers') {
            UUIDS = data.NewMemberUUIDs
            TotalCount = data.Members
            TotalRevenue = data.Revenue

        } else if (Members === 'renewMembers') {
            UUIDS = data.RenewMemberUUIDs
            TotalCount = data.Members
            TotalRevenue = data.Revenue
        } else {
            UUIDS = data.TotalMemberUUIDs
            TotalCount = data.Members
            TotalRevenue = data.Revenue
        }
        setChartCount(TotalCount)
        setRevenueCount(TotalRevenue)
        fetchSalesDetails(UUIDS, source_hex)
        setShowModal(true)
    }

    const handleCancel = () => {
        setShowModal(false)
        setSearchValue("")
        setSelectedTableData([])
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

    const memberTypeColumn = [
        {
            title: "MEMBER TYPE",
            dataIndex: "GroupName",
            key: "GroupName",
            children: [
                {
                    title: '',
                    dataIndex: 'GroupName',
                    width: 300,
                    fixed: 'left',
                    className: "text-left",
                    render: (_, data) => {
                        return <div>{data.GroupName}</div>
                    }

                },
            ],
            sorter: sortGroupName,
        },
        {
            title: "TOTAL",
            dataIndex: "TotalInvoices",
            key: "TotalInvoices",
            children: [
                {
                    title: 'MEMBERS',
                    dataIndex: 'TotalMembersPercentage',
                    className: "text-left",
                    render: (_, data) => {
                        let text = data.TotalInvoices;
                        let percentage = data.TotalMembersPercentage;
                        return <>
                            {text !== 0 ? <div style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
                                <a onClick={() => handleReportTableClick(data)}>
                                    {text}
                                </a>
                                <div style={{ fontSize: '12px', color: 'GrayText', marginTop: '2px' }}>({percentage}%)</div>
                            </div> : '-'}
                        </>
                    },
                },
                {
                    title: 'REVENUE',
                    dataIndex: 'TotalRevenuePercentage',
                    className: "text-left",
                    render: (_, data) => {
                        let text = data.TotalRevenue;
                        let percentage = data.TotalRevenuePercentage;
                        return <>
                            {text !== 0 ? <div style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
                                <a onClick={() => handleReportTableClick(data)}>
                                    {currencyFormatter(text)}
                                </a>
                                <div style={{ fontSize: '12px', color: 'GrayText', marginTop: '2px' }}>
                                    ({percentage}%)
                                </div>
                            </div> : '-'}
                        </>
                    },
                },
            ],
        },

        {
            title: "NEW",
            dataIndex: "NewMembers",
            key: "NewMembers",
            children: [
                {
                    title: 'MEMBERS',
                    dataIndex: 'NewMembers',
                    className: "text-left",
                    render: (_, data) => {
                        let text = data.NewMembers;
                        let percentage = data.TotalNewMembersPercentage
                        return <>
                            {text !== 0 ? <div style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
                                <a onClick={() => handleReportTableClick(data, 'newMembers')}>
                                    {text}
                                </a>
                                <div style={{ fontSize: '12px', color: 'GrayText', marginTop: '2px' }}>({percentage}%)</div>
                            </div> : '-'}
                        </>
                    }
                },
                {
                    title: 'REVENUE',
                    dataIndex: 'NewMembersRevenue',
                    className: "text-left",
                    render: (_, data) => {
                        let text = data.NewMembersRevenue;
                        let percentage = data.TotalNewMembersRevenuePercentage
                        return <>
                            {text !== 0 ? <div style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
                                <a onClick={() => handleReportTableClick(data, 'newMembers')}>
                                    {currencyFormatter(text)}
                                </a>
                                <div style={{ fontSize: '12px', color: 'GrayText', marginTop: '2px' }}>
                                    ({percentage}%)
                                </div>
                            </div> : '-'}
                        </>
                    }
                },
            ]
        },
        {
            title: "RENEWING",
            dataIndex: "RenewingMembers",
            key: "RenewingMembers",
            children: [
                {
                    title: 'MEMBERS',
                    dataIndex: 'RenewingMembers',
                    className: "text-left",
                    render: (_, data) => {
                        let text = data.RenewingMembers;
                        let percentage = data.TotalRenewMemPercentage;
                        return <>
                            {text !== 0 ? <div style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
                                <a onClick={() => handleReportTableClick(data, 'renewMembers')}>
                                    {text}
                                </a>
                                <div style={{ fontSize: '12px', color: 'GrayText', marginTop: '2px' }}>({percentage}%)</div>
                            </div> : '-'}
                        </>
                    }
                },
                {
                    title: 'REVENUE',
                    dataIndex: 'RenewingMembersRevenue',
                    className: "text-left",
                    render: (_, data) => {
                        let text = data.RenewingMembersRevenue;
                        let percentage = data.TotalRenewMemRevenuePercentage
                        return <>
                            {text !== 0 ? <div style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
                                <a onClick={() => handleReportTableClick(data, 'renewMembers')}>
                                    {currencyFormatter(text)}
                                </a>
                                <div style={{ fontSize: '12px', color: 'GrayText', marginTop: '2px' }}>
                                    ({percentage})
                                </div>
                            </div> : '-'}
                        </>
                    }
                },
            ]
        },
    ];

    const reportTableHeaders = [
        { label: "MEMBER TYPE", key: "GroupName" },
        { label: "TOTAL MEMBERS", key: "TotalInvoices" },
        { label: "TOTAL REVENUE", key: 'TotalRevenue' },
        { label: "NEW MEMBERS", key: "NewMembers" },
        { label: "NEW MEMBERS REVENUE", key: "NewMembersRevenue" },
        { label: "RENEWING MEMBERS", key: "RenewingMembers" },
        { label: "RENEWING MEMBERS REVENUE", key: "RenewingMembersRevenue" }
    ]

    const compareTableHeaders = [
        { label: "MEMBERS TYPE", key: "MembersType" },
        { label: "YEARS", key: "Years" },
        { label: "SALES", key: 'Sales' },
        { label: "SALES CHANGES", key: "SalesPercentage" },
        { label: "REVENUE", key: "Revenue" },
        { label: "REVENUE CHANGES", key: "RevenuePercentage" }
    ]

    const multiYearCompareHeader = [
        { label: "MEMBERS TYPE", key: "Type" },
        { label: "YEARS", key: "YearOfInvoice" },
        { label: "SALES", key: 'Members' },
        { label: "SALES CHANGES", key: "salesPercentage" },
        { label: "REVENUE", key: "Revenue" },
        { label: "REVENUE CHANGES", key: "revenuePercentage" }
    ]

    const renderActionBar = () => {
        return (
            <Row gutter={16} className="mt-4 mb-2 pl-2 row-gap">
                <Col>
                    {(compareMode && visualizationType?.includes('TABLE')) ?
                        <>
                            {/* <CustomExportCsv
                                dataSource={compareTableData.map(data => {
                                    return {
                                        MembersType: data.Type,
                                        Years: data.YearOfInvoice,
                                        Sales: data.Members,
                                        SalesPercentage: data.salesPercentage,
                                        Revenue: data.Revenue,
                                        RevenuePercentage: data.revenuePercentage
                                    }
                                })}
                                Headers={compareTableHeaders}
                                exportFileName="Comparative Report Table"
                            /> */}
                        </>
                        :
                        <CustomExportCsv
                            dataSource={tableDataSource}
                            Headers={reportTableHeaders}
                            exportFileName="Report Table"
                        />
                    }
                    {(allowDateChange && (dateFormat === 'single_month_multi_year' || dateFormat === 'multi_year')) &&
                        <CustomExportCsv
                            dataSource={multiYearTableData}
                            Headers={multiYearCompareHeader}
                            exportFileName="Compare Sales Tables"
                        />
                    }
                </Col>
            </Row>
        );
    }

    const reportTable = () => {
        return (
            <Table
                dataSource={tableDataSource}
                columns={memberTypeColumn}
                pagination={false}
                bordered={true}
                className='salesReportTable pl-2 py-3'
                scroll={{ x: 1200, y: 300 }}
                summary={(tableData) => {
                    let totalMembers = 0;
                    let totalRevenue = 0;
                    let totalNewMembers = 0;
                    let totalNewMemRevenue = 0;
                    let totalRenewMem = 0;
                    let totalRenewMemRevenue = 0;
                    tableData.forEach((data) => {
                        totalMembers += data.TotalInvoices;
                        totalRevenue += data.TotalRevenue;
                        totalNewMembers += data.NewMembers;
                        totalNewMemRevenue += data.NewMembersRevenue;
                        totalRenewMem += data.RenewingMembers;
                        totalRenewMemRevenue += data.RenewingMembersRevenue;
                    });
                    return (
                        <Table.Summary fixed>
                            <Table.Summary.Row style={{ backgroundColor: "#F9F9F9" }}>
                                <Table.Summary.Cell index={0} className='text-left'><div style={{ color: "#0673b1", fontWeight: 'bold' }}>TOTAL</div></Table.Summary.Cell>
                                <Table.Summary.Cell index={1} className='text-left'>
                                    <Typography>{totalMembers}</Typography>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} className='text-left'>
                                    <Typography>{currencyFormatter(totalRevenue)}</Typography>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={3} className='text-left'>
                                    <Typography>{totalNewMembers}</Typography>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={4} className='text-left'>
                                    <Typography>{currencyFormatter(totalNewMemRevenue)}</Typography>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={5} className='text-left'>
                                    <Typography>{totalRenewMem}</Typography>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={6} className='text-left'>
                                    <Typography>{currencyFormatter(totalRenewMemRevenue)}</Typography>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        </Table.Summary>
                    );
                }}
            />
        )
    }

    // const renderCompareTable = () => {
    //     return(
    //         <Table dataSource={compareTableData} columns={MemberSalesColumn} className='compareReportTable' />
    //     )
    // }

    const renderCompareTable = () => {
        if (!multiYearData.length) {
            return <NoDataFound />
        } else {
            // if(dateFormat === 'single_month_multi_year' || dateFormat === 'multi_year'){
            return (
                <Table dataSource={multiYearTableData} columns={MemberSalesColumn} className='compareReportTable' pagination={false} />
            )
            // }
        }
    }

    const renderMemberModal = () => {
        return (
            <div>
                <Modal open={showModal} className='popup-modal-width' title="Member Details" onCancel={handleCancel} footer={null}>
                    <div className='d-flex'>
                        <div className="ml-3" style={{ fontSize: "16px" }}>
                            <Typography>Total Count </Typography>
                            <div style={{ fontWeight: 'bold' }}>{chartCount}</div>
                        </div>
                        <div className="ml-5" style={{ fontSize: "16px" }}>
                            <Typography>Total Revenue</Typography>
                            <div style={{ fontWeight: 'bold' }}>{currencyFormatter(revenueCount)}</div>
                        </div>
                        <div className="ml-5" style={{ fontSize: "16px" }}>
                            <Typography>Report Type</Typography>
                            <div style={{ fontWeight: 'bold' }}>{'Sales Activity'}</div>
                        </div>
                    </div>
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
                                        GroupName: data.GroupName ? data.GroupName : '-',
                                        MemberJoinDate: moment(data.MemberJoinDate).format("DD/MM/YYYY"),
                                        ExpirationDate: moment(data.ExpirationDate).format("DD/MM/YYYY"),
                                    };
                                })}
                                Headers={currentTotalMemberHeader}
                                exportFileName={"Report Table"}
                            />
                        </Col>
                    </Row>
                    <Table dataSource={memberDetails} size='small' columns={MemberDetailsColumn} pagination={true} className='CurrentMemberTable' scroll={{ y: 300 }} loading={loading} />
                </Modal>
            </div>
        )
    }

    return (
        <CommonSpinner loading={loading}>
            {/* <MultiSelectWidget 
                    groupsArray={groups_array}
                    membersGroup={membersGroup}
                    setSelectedMembersGroups={setSelectedMembersGroups}                    
                /> */}
            {config.showByConfig && !config.showChartType ?
                <div className='d-flex flex-row mt-5 mb-3 justify-space-between align-end'>
                    <div>
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
                    {renderActionBar()}
                </div> : <>{renderActionBar()}</>}
            {!loading && <div className='mt-2'>
                {(compareMode && visualizationType?.includes('TABLE')) ? renderCompareTable() : reportTable()}
            </div>}
            {renderMemberModal()}
        </CommonSpinner>
    )
}
export default ReportTable