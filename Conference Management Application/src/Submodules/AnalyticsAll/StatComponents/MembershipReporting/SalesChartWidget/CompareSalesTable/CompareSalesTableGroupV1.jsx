import React, { useEffect, useState } from "react";
import { Table } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { isEmpty, set } from "lodash";
import { currencyFormatter } from '@/AnalyticsAll/StatComponents/util';
import _groupBy from 'lodash/groupBy';
import _map from 'lodash/map';
import { percentageCalculation } from "../helper";

const CompareSalesTableGroupV1 = ({
    dataSource,
    type,
    pagination,
    scroll,
    className,
    bordered,
    startDate,
    viewBy,
    handleTableClick,
    setCompareMembershipTypeTable,
}) => {

    const [tableResource, setTableResource] = useState([]);

    useEffect(() => {
        if (viewBy === "month" || viewBy === "year") {
            setTableResource(constructDataByMonth())
        } else {
            setTableResource(constructDataByQuarter())
        }
    }, [dataSource, viewBy])

    useEffect(() => {
        if(Object.keys(tableResource).length){
            setCompareMembershipTypeTable(tableResource)
        }
    }, [tableResource])

    const constructDataByMonth = () => {
        let tableDataSource = [];
        const wholeDataByYear = {}
        const typeByYear = {}
        let tableColumn = []
        let revenueByType = {}
        const groupWithRevenue = []
        let previousMonthRawData;
        const monthsWithRowSpan = {};
        let monthStartsIndex = 0;
        const isinvoiceType = type === "invoice" ? true : false;
        const year = dataSource.map(val => val.YearOfInvoice);
        const totalYears = [...new Set(year)];

        const constructData = dataSource.map(data => ({
            month: data.NameOfMonth,
            group: data.groups.map(data => data.GroupName),
        }))

        Object.entries(_groupBy(dataSource, "NameOfMonth")).forEach((data) => {
            const monthlyType = {}
            data[1].forEach(({ YearOfInvoice, TotalInvoices, TotalRevenue }) => { monthlyType[YearOfInvoice] = isinvoiceType ? TotalInvoices : TotalRevenue })
            revenueByType[data[0]] = monthlyType
        })

        const groupByMonth = Object.entries(_groupBy(constructData, "month")).map(data => ({
            month: data[0],
            group: [... new Set(data[1].map(data => data.group).flat(1))]
        }))

        groupByMonth.map(({ month, group }) => {
            group.forEach(name => {
                dataSource.forEach(sourceData => {
                    if (sourceData.NameOfMonth === month) {
                        sourceData.groups.forEach((data) => {
                            if (data.GroupName === name) {
                                groupWithRevenue.push({
                                    month: month,
                                    groupName: name,
                                    year: data.YearOfInvoice,
                                    invoice: data.TotalInvoices,
                                    revenue: data.TotalRevenue,
                                    groupData: data,
                                    monthlyData: sourceData
                                })
                            }
                        })
                    }
                })
            })
        })

        const groupByGroupName = _groupBy(groupWithRevenue, "groupName")
        let previousmonth = groupByMonth[0]?.month
        
        const groupByYear = Object.entries(groupByGroupName).map(data => {
            let groupRevenue = {};
            const wholeGroupdata = {}
            data[1].forEach(({ year, revenue, groupData }) => {
                groupRevenue[year] = groupRevenue[year] ? groupRevenue[year] + revenue : revenue;
                wholeGroupdata[year] = { ...wholeGroupdata[year] }
                wholeGroupdata[year].memberUUIDs = [...new Set(wholeGroupdata[year]?.memberUUIDs ? [wholeGroupdata[year].memberUUIDs, groupData.memberUUIDs].flat(1) : groupData.memberUUIDs)]
                wholeGroupdata[year].TotalInvoices = wholeGroupdata[year].TotalInvoices ? wholeGroupdata[year].TotalInvoices + groupData.TotalInvoices : groupData.TotalInvoices
                wholeGroupdata[year].TotalRevenue = wholeGroupdata[year].TotalRevenue ? wholeGroupdata[year].TotalRevenue + groupData.TotalRevenue : groupData.TotalRevenue
            })

            return {
                group: data[0],
                type: groupRevenue,
                data: wholeGroupdata
            }
        })

        groupByMonth.forEach(({ month, group }, index) => {
            const monthlyRawData = {}
            group.forEach((data, idx) => {
                const revenue = {}
                const invoice = {}
                const groupRawData = {}
                groupByGroupName[data].forEach((groupData) => {
                    if (groupData.month === month) {
                        revenue[groupData.year] = groupData.revenue
                        invoice[groupData.year] = groupData.invoice
                        groupRawData[groupData.year] = groupData.groupData;
                        monthlyRawData[groupData.year] = groupData.monthlyData
                    }
                })
                if (previousmonth !== month) {
                    tableDataSource.push({
                        group: "Sub Total",
                        type: revenueByType[previousmonth],
                        data: previousMonthRawData
                    })
                }
                tableDataSource.push({
                    month,
                    group: data,
                    type: isinvoiceType ? invoice : revenue,
                    data: groupRawData
                })
                if (index === groupByMonth.length - 1 && idx === group.length - 1) {
                    tableDataSource.push({
                        group: "Sub Total",
                        type: revenueByType[month],
                        data: previousMonthRawData
                    })
                }
                previousMonthRawData = monthlyRawData
                previousmonth = month
            })
        })

        Object.entries(_groupBy(dataSource, "YearOfInvoice")).forEach(data => {
            const memberUUIDs = []
            let TotalInvoices = 0
            let TotalRevenue = 0
            data[1].forEach(data => {
                memberUUIDs.push(...data.memberUUIDs)
                TotalInvoices += data.TotalInvoices
                TotalRevenue += data.TotalRevenue
            })
            typeByYear[data[0]] = isinvoiceType ? TotalInvoices : TotalRevenue
            wholeDataByYear[data[0]] = {
                memberUUIDs: [...new Set(memberUUIDs)],
                TotalInvoices,
                TotalRevenue
            }
        })

        tableDataSource.push({
            month: "Total",
            type: typeByYear,
            data: wholeDataByYear
        })

        groupByYear.push({
            group: "Total",
            type: typeByYear,
            data: wholeDataByYear
        })

        groupByMonth.forEach(({ month, group }) => { monthsWithRowSpan[month] = group.length + 1 });

        const rowSpanIndex = Object.entries(monthsWithRowSpan).map(data => {
            let temp = monthStartsIndex
            monthStartsIndex += data[1]
            return temp
        });

        tableColumn = [
            viewBy !== "year" ?
                {
                    title: <div className='primary-color'>MONTHS</div>,
                    dataIndex: `month`,
                    width: "10%",
                    key: `month`,
                    render: (data, row, index) => {
                        const obj = {
                            children: <div>{data}</div>,
                            props: {}
                        }
                        if (data === "Total") {
                            obj.props.rowSpan = 1
                            obj.props.colSpan = 2
                            obj.props.className = "totalRevenueRows"
                        }
                        else {
                            obj.props.rowSpan = rowSpanIndex.includes(index) ? monthsWithRowSpan[data] : 0
                        }
                        return obj
                    },
                } : null,
            {
                title: <div className='primary-color'>TYPES</div>,
                dataIndex: `group`,
                key: `group`,
                render: (data, row, index) => {
                    const obj = {
                        children: <div > {data}</div>,
                        props: { colSpan: !data ? 0 : 1, className: data === "Sub Total" ? "subTotalRevenueRows" : data === "Total" ? "totalRevenueRows" : "" }
                    }
                    return obj
                },
            }
        ].filter(Boolean);

        tableColumn.push(
            ...totalYears.map((year, index) => {
                return {
                    title: <div className='primary-color'>{year}</div>,
                    width: "15%",
                    dataIndex: "type",
                    render: (data, row, idx) => {
                        const isShowPercent = data[totalYears?.[index + 1]] ? true : false
                        const percent = percentageCalculation(data?.[year], data[totalYears?.[index + 1]])
                        const obj = {
                            children: <>{data[year] ?
                                <div className="d-flex ">
                                    <div className="mr-1" style={{ fontWeight: "normal" }}>
                                        <a onClick={() => { handleTableClick(row.data?.[year] ?? "") }}>
                                            {isinvoiceType ? data[year] : currencyFormatter(data[year])}
                                        </a>
                                    </div>
                                    <div style={{ color: "grey" }}>
                                        {isShowPercent &&
                                            <>
                                                {percent ? `(${percent < 0 ? percent * -1 : percent}%` : ""}
                                                {percent > 0 ? <ArrowUpOutlined style={{ color: "green" }} /> : <ArrowDownOutlined style={{ color: "red" }} />})
                                            </>
                                        }
                                    </div>
                                </div>
                                : <div>-</div>
                            }</>,
                            props: {}
                        }
                        if (row.group === "Sub Total") {
                            obj.props.className = "subTotalRevenueRows"
                        }
                        if (row.month === "Total" || row.group === "Total") {
                            obj.props.className = "totalRevenueRows"
                        }
                        return obj
                    }
                };
            })
        );

        return {
            tableDataSource: viewBy === "year" ? groupByYear : tableDataSource,
            tableColumn
        }
    }

    const constructDataByQuarter = () => {
        const groupWithType = [];
        const wholeDataByYear = {}
        const quarterWithGroupsRevenue = {}
        const quarterSubTotal = {}
        const typeByYear = {}
        const isinvoiceType = type === "invoice" ? true : false;
        const tableDataSource = []
        const quarterRowSpan = {};
        const year = dataSource.map(val => val.YearOfInvoice);
        const totalYears = [...new Set(year)];
        let quarterStartsIndex = 0;

        const groupByQuater = Object.entries(_groupBy(dataSource, "QuarterOfInvoice")).map(data => ({
            quarter: data[0],
            groups: [... new Set(data[1].map(data => data.groups.map(groupsValue => groupsValue.GroupName)).flat(1))]
        }))

        groupByQuater.forEach(({ quarter, groups }) => {
            groups.forEach(name => {
                dataSource.forEach(sourceData => {
                    if (sourceData.QuarterOfInvoice === quarter) {
                        sourceData.groups.forEach(data => {
                            if (data.GroupName === name) {
                                groupWithType.push({
                                    quarter: quarter,
                                    groupName: name,
                                    year: data.YearOfInvoice,
                                    invoice: data.TotalInvoices,
                                    revenue: data.TotalRevenue,
                                    data: data
                                })
                            }
                        })
                    }
                })
            })
        })

        Object.entries(_groupBy(groupWithType, "quarter")).forEach(data => {
            const groupsQuarterType = {}

            data[1].forEach(({ groupName, revenue, invoice, year, data: groupData }) => {
                const typeValue = isinvoiceType ? invoice : revenue
                groupsQuarterType[groupName] = { ...groupsQuarterType[groupName] }
                groupsQuarterType[groupName][type] = {...groupsQuarterType[groupName]?.[type],
                    [year]: groupsQuarterType[groupName]?.[type]?.[year] ?
                        groupsQuarterType[groupName]?.[type]?.[year] + typeValue : typeValue
                };
                groupsQuarterType[groupName].data = {...groupsQuarterType[groupName].data,
                    [year]: {
                        memberUUIDs: [...new Set(
                            groupsQuarterType[groupName].data?.[year]?.memberUUIDs ?
                                [groupsQuarterType[groupName].data?.[year]?.memberUUIDs,
                                groupData.memberUUIDs].flat(1)
                                :
                                groupData.memberUUIDs
                        )],
                        TotalInvoices: groupsQuarterType[groupName].data?.[year]?.TotalInvoices ?
                            groupsQuarterType[groupName].data?.[year]?.TotalInvoices + groupData.TotalInvoices : groupData.TotalInvoices,
                        TotalRevenue: groupsQuarterType[groupName].data?.[year]?.TotalRevenue ?
                            groupsQuarterType[groupName].data?.[year]?.TotalRevenue + revenue : revenue
                    }
                };
                quarterSubTotal[data[0]] = { ...quarterSubTotal[data[0]] }
                quarterSubTotal[data[0]][type] = {...quarterSubTotal[data[0]]?.[type],
                    [year]: quarterSubTotal[data[0]]?.[type]?.[year] ?
                        quarterSubTotal[data[0]]?.[type]?.[year] + typeValue : typeValue
                }
                typeByYear[year] = typeByYear[year] ? typeByYear[year] + typeValue : typeValue
                quarterSubTotal[data[0]].data = {...quarterSubTotal[data[0]].data,
                    [year]: {
                        memberUUIDs: [...new Set(quarterSubTotal[data[0]].data?.[year]?.memberUUIDs ?
                            [quarterSubTotal[data[0]].data?.[year]?.memberUUIDs,
                            groupData.memberUUIDs].flat(1)
                            :
                            groupData.memberUUIDs
                        )],
                        TotalInvoices: quarterSubTotal[data[0]].data?.[year]?.TotalInvoices ?
                            quarterSubTotal[data[0]].data?.[year]?.TotalInvoices + groupData.TotalInvoices : groupData.TotalInvoices,
                        TotalRevenue: quarterSubTotal[data[0]].data?.[year]?.TotalRevenue ?
                            quarterSubTotal[data[0]].data?.[year]?.TotalRevenue + revenue : revenue
                    }
                }
            })
            quarterWithGroupsRevenue[data[0]] = groupsQuarterType
        })

        let previousQuatar = Object.keys(quarterWithGroupsRevenue)[0];

        Object.entries(quarterWithGroupsRevenue).forEach((data, index) => {
            Object.entries(data[1]).forEach((groupData, groupIndex) => {
                if (previousQuatar !== data[0]) {
                    tableDataSource.push({
                        group: "Sub Total",
                        type: quarterSubTotal[previousQuatar][type],
                        data: quarterSubTotal[previousQuatar].data
                    })
                }
                tableDataSource.push({
                    quarter: data[0],
                    group: groupData[0],
                    type: groupData[1][type],
                    data: groupData[1].data,
                })
                if (index === Object.entries(quarterWithGroupsRevenue).length - 1 && groupIndex === Object.entries(data[1]).length - 1) {
                    tableDataSource.push({
                        group: "Sub Total",
                        type: quarterSubTotal[data[0]][type],
                        data: quarterSubTotal[data[0]].data
                    })
                }
                previousQuatar = data[0]
            })
        })

        Object.entries(_groupBy(dataSource, "YearOfInvoice")).forEach(data => {
            const memberUUIDs = []
            let TotalInvoices = 0
            let TotalRevenue = 0
            data[1].forEach(data => {
                memberUUIDs.push(...data.memberUUIDs)
                TotalInvoices += data.TotalInvoices
                TotalRevenue += data.TotalRevenue
            })
            wholeDataByYear[data[0]] = {
                memberUUIDs: [...new Set(memberUUIDs)],
                TotalInvoices,
                TotalRevenue
            }
        })

        tableDataSource.push({
            quarter: "Total",
            type: typeByYear,
            data: wholeDataByYear
        })

        groupByQuater.forEach(data => { quarterRowSpan[data.quarter] = data.groups.length + 1 });

        const quarterRowSpanIndex = Object.entries(quarterRowSpan).map(data => {
            let temp = quarterStartsIndex
            quarterStartsIndex += data[1]
            return temp
        });

        const tableColumn = [
            {
                title: <div className='primary-color'>QUARTER</div>,
                dataIndex: `quarter`,
                width: "10%",
                key: `month`,
                render: (data, row, index) => {
                    const obj = {
                        children: <div>{data}</div>,
                        props: {}
                    }
                    obj.props.rowSpan = quarterRowSpanIndex.includes(index) ? quarterRowSpan[data] : 0
                    if (data === "Total") {
                        obj.props.rowSpan = 1
                        obj.props.colSpan = 2
                        obj.props.className = "totalRevenueRows"
                    }
                    return obj
                },
            },
            {
                title: <div className='primary-color'>TYPES</div>,
                dataIndex: `group`,
                key: `group`,
                render: (data, row, index) => {
                    const obj = {
                        children: <div > {data}</div>,
                        props: { colSpan: !data ? 0 : 1, className: data === "Sub Total" ? "subTotalRevenueRows" : "" }
                    }
                    return obj
                },
            }
        ]

        tableColumn.push(
            ...totalYears.map((year, index) => {
                return {
                    title: <div className='primary-color'>{year}</div>,
                    width: "16%",
                    dataIndex: "type",
                    render: (data, row, idx) => {
                        const isShowPercent = data[totalYears?.[index + 1]] ? true : false
                        const percent = percentageCalculation(data[year], data[totalYears[index + 1]])
                        const obj = {
                            children: <>{data[year] ?
                                <div className="d-flex ">
                                    <div className="mr-1" style={{ fontWeight: "normal" }}>
                                        <a onClick={() => { handleTableClick(row.data?.[year] ?? "") }}>
                                            {isinvoiceType ? data[year] : currencyFormatter(data[year])}
                                        </a>
                                    </div>
                                    <div style={{ color: "grey" }}>
                                        {isShowPercent &&
                                            <>
                                                {percent ? `(${percent < 0 ? percent * -1 : percent}%` : ""}
                                                {percent > 0 ? <ArrowUpOutlined style={{ color: "green" }} /> : <ArrowDownOutlined style={{ color: "red" }} />})
                                            </>
                                        }
                                    </div>
                                </div>
                                : <div>-</div>
                            }</>,
                            props: {}
                        }
                        if (row.group === "Sub Total") {
                            obj.props.className = "subTotalRevenueRows"
                        }
                        if (row.quarter === "Total") {
                            obj.props.className = "totalRevenueRows"
                        }
                        return obj
                    }
                };
            })
        );

        return {
            tableDataSource,
            tableColumn
        }
    }

    return (
        <div>
            <Table
                dataSource={tableResource.tableDataSource}
                columns={tableResource.tableColumn}
                pagination={pagination}
                scroll={scroll}
                className={className}
                bordered={bordered}
                size="small"
            />
        </div>
    );
};

export default CompareSalesTableGroupV1;
