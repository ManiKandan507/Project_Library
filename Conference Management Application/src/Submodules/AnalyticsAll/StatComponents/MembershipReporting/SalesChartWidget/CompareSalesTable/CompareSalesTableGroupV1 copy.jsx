import React, { useEffect } from "react";
import { Table } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import moment from "moment/moment";
import { isEmpty } from "lodash";
import { useState } from "react";
import { currencyFormatter } from '@/AnalyticsAll/StatComponents/util';
import _groupBy from 'lodash/groupBy';
import _map from 'lodash/map';
import { dataSource1 } from "./staticDatasource"

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
}) => {

    const [updatedCompareSalesTable, setUpdatedCompareSalesTable] = useState([]);
    const [compareSalesTableData, setCompareSalesTableData] = useState({})

    useEffect(() => {
        if (viewBy !== 'quarter') {
            setCompareSalesTableData(membershipTypeTableDataConstruction(dataSource, handleTableClick))
        }
    }, [dataSource, viewBy])


    useEffect(() => {
        if (!isEmpty(type)) {
            let quarterDataSource = {};
            let monthDataSource = {};
            let finalDataSource = [];

            dataSource.map((data, index) => {
                if (viewBy == "month" || viewBy == "year") {
                    if (
                        isEmpty(monthDataSource) ||
                        isEmpty(monthDataSource[data.NameOfMonth])
                    ) {
                        monthDataSource[data.NameOfMonth] = {
                            [data.YearOfInvoice]: data,
                        };
                    } else {
                        if (
                            isEmpty(monthDataSource[data.NameOfMonth][data.YearOfInvoice])
                        ) {
                            monthDataSource[data.NameOfMonth] = {
                                ...monthDataSource[data.NameOfMonth],
                                [data.YearOfInvoice]: data,
                            };
                        } else {
                            // console.log("Error processing data", monthDataSource, data);
                        }
                    }
                }
                if (viewBy == "quarter") {
                    if (
                        isEmpty(quarterDataSource) ||
                        isEmpty(quarterDataSource[data.Quarter])
                    ) {
                        quarterDataSource[data.Quarter] = {
                            [data.YearOfInvoice]: data,
                        };
                    } else {
                        if (isEmpty(quarterDataSource[data.Quarter][data.YearOfInvoice])) {
                            quarterDataSource[data.Quarter] = {
                                ...quarterDataSource[data.Quarter],
                                [data.YearOfInvoice]: data,
                            };
                        } else {
                            console.log("Error processing data", quarterDataSource, data);
                        }
                    }
                }
            });
            if (viewBy == "month" || viewBy == "year") {
                Object.entries(monthDataSource).map(([key, value]) => {
                    finalDataSource.push({
                        NameOfMonth: `${key}`,
                        data: value,
                    });
                });
            }
            if (viewBy == "quarter") {
                Object.entries(quarterDataSource).map(([key, value]) => {
                    finalDataSource.push({
                        Quarter: `${key}`,
                        data: value,
                    });
                });
            }
            setUpdatedCompareSalesTable(finalDataSource);
        }
    }, [viewBy, dataSource]);

    const compareSalesTableColumn = () => {
        const year = dataSource.map(val => val.YearOfInvoice);
        const totalYears = [...new Set(year)];
        const salesYears = moment(startDate, "DD/MM/YYYY").format("MM") !== moment().startOf("year").format("MM") ? totalYears.length - 1 : totalYears.length;

        let compareSalesColumn = [
            {
                title: "MONTHS",
                colspan: 3,
                width: "10%",
                dataIndex: "NameOfMonth",
                render: (data, row, index) => {
                    const obj = {
                        children: <div style={{ color: "#0070af" }}>{data}</div>,
                        props: {},
                    };
                    return obj;
                },
            }
        ];
        compareSalesColumn.push(
            ...totalYears.map((year, index) => {
                return {
                    title: `${year}`,
                    colspan: 0,
                    dataIndex: "YearOfInvoice",
                    render: (data, row, index) => {
                        if (row.data?.[`${year}`]) {
                            let tempRow = row.data?.[`${year}`];
                            let text = tempRow.percent ?? "";
                            const obj = {
                                children: (
                                    <>
                                        <a onClick={() => handleTableClick(tempRow)}>
                                            {type === "TOTAL_MEMBERS"
                                                ? tempRow.TotalInvoices
                                                : `${currencyFormatter(tempRow.TotalRevenue)}`}
                                        </a>
                                        {text !== "" && text !== "NA" && (
                                            <>
                                                &nbsp;(
                                                {text !== "" && text !== "NA"
                                                    ? `${Math.abs(text)}%`
                                                    : "-"}
                                                {text !== "" && text !== "NA" ? (
                                                    Math.sign(text) === 1 ? (
                                                        <ArrowUpOutlined style={{ color: "green" }} />
                                                    ) : (
                                                        <ArrowDownOutlined style={{ color: "red" }} />
                                                    )
                                                ) : (
                                                    ""
                                                )}
                                                )
                                            </>
                                        )}
                                    </>
                                ),
                                props: {},
                            };
                            return obj;
                        } else {
                            return {};
                        }
                    },
                };
            })
        );
        return compareSalesColumn;
    };

    const compareQuarterTableColumn = () => {
        const year = dataSource.map(val => {
            return val.YearOfInvoice;
        });

        const totalYears = [...new Set(year)];
        const salesYears =
            moment(startDate, "DD/MM/YYYY").format("MM") !==
                moment().startOf("year").format("MM")
                ? totalYears.length - 1
                : totalYears.length;

        let compareSalesColumn = [
            {
                title: "QUARTER",
                colspan: 3,
                width: "10%",
                dataIndex: "Quarter",
                render: (data, row, index) => {
                    const obj = {
                        children: <div style={{ color: "#0070af" }}>{data}</div>,
                        props: {},
                    };
                    return obj;
                },
            },
        ]

        compareSalesColumn.push(
            ...totalYears.map((year, index) => {
                return {
                    title: `${year}`,
                    colspan: 0,
                    dataIndex: "YearOfInvoice",
                    render: (data, row, index) => {
                        if (row.data?.[`${year}`]) {
                            let tempRow = row.data?.[`${year}`];

                            let text = tempRow.percent ?? "";
                            const obj = {
                                children: (
                                    <>
                                        <a onClick={() => handleTableClick(tempRow)}>
                                            {type === "TOTAL_MEMBERS"
                                                ? tempRow.TotalInvoices
                                                : `$${tempRow.TotalRevenue}`}
                                        </a>
                                        {text !== "" && text !== "NA" && (
                                            <>
                                                &nbsp;(
                                                {text !== "" && text !== "NA"
                                                    ? `${Math.abs(text)}%`
                                                    : "-"}
                                                {text !== "" && text !== "NA" ? (
                                                    Math.sign(text) === 1 ? (
                                                        <ArrowUpOutlined style={{ color: "green" }} />
                                                    ) : (
                                                        <ArrowDownOutlined style={{ color: "red" }} />
                                                    )
                                                ) : (
                                                    ""
                                                )}
                                                )
                                            </>
                                        )}
                                    </>
                                ),
                                props: {},
                            };
                            return obj;
                        } else {
                            return {};
                        }
                    },
                };
            })
        );
        return compareSalesColumn;
    };

    const membershipTypeTableDataConstruction = (dataSource, handleTableClick) => {
        let finalData = [];
        let yearViewColumn = []
        let revenueByMonth = {}
        let totalRevenue = {}
        let groupWithRevenue = []

        const constructData = dataSource.map(data => ({
            month: data.NameOfMonth,
            group: data.groups.map(data => data.GroupName),
        }))

        Object.entries(_groupBy(dataSource, "NameOfMonth")).forEach(data => {
            const monthlyRevenue = {}
            data[1].forEach(data => { monthlyRevenue[data.YearOfInvoice] = data.TotalRevenue })
            revenueByMonth[data[0]] = monthlyRevenue
        })

        Object.values(revenueByMonth).forEach(data => {
            Object.entries(data).forEach(val => {
                totalRevenue[val[0]] = Math.floor(totalRevenue[val[0]] ? totalRevenue[val[0]] + val[1] : val[1])
            })
        })

        const groupByMonth = Object.entries(_groupBy(constructData, "month")).map(data => ({
            month: data[0],
            group: [... new Set(data[1].map(data => data.group).flat(1))]
        }))


        groupByMonth.map(({ month, group }) => {
            group.forEach(name => {
                dataSource.forEach(sourceData => {
                    if (sourceData.NameOfMonth === month) {
                        sourceData.groups.forEach(data => {
                            if (data.GroupName === name) {
                                groupWithRevenue.push({
                                    month: month,
                                    groupName: name,
                                    year: data.YearOfInvoice,
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

        groupByMonth.forEach(({ month, group }, index) => {
            group.forEach((data, idx) => {
                const revenue = {}
                const groupRawData = {}
                const monthlyRawData = {}

                groupByGroupName[data].forEach(groupData => {
                    if (groupData.month === month) {
                        revenue[groupData.year] = groupData.revenue
                        groupRawData[groupData.year] = groupData.groupData
                        monthlyRawData[groupData.year] = groupData.monthlyData
                    }
                })
                if (previousmonth !== month) {
                    finalData.push({
                        group: "Sub Total",
                        revenue: revenueByMonth[previousmonth],
                        data: monthlyRawData
                    })
                }
                finalData.push({
                    month,
                    group: data,
                    revenue,
                    data: groupRawData
                })
                if (index === groupByMonth.length - 1 && idx === group.length - 1) {
                    finalData.push({
                        group: "Sub Total",
                        revenue: revenueByMonth[month],
                        data: monthlyRawData

                    })
                }
                previousmonth = month
            })
        })

        finalData.push({
            month: "Total",
            revenue: totalRevenue
        })

        const percentageCalculation = (value1 = 0, value2 = 0) => {
            if (value1) {
                const greatest = value1 < value2 ? value2 : value1
                const smallest = value1 > value2 ? value2 : value1
                const isNegative = ((value1 - value2) / value1) * 100
                const getPercentage = ((greatest - smallest) / greatest) * 100
                return (isNegative < 0 && getPercentage > 0 ? getPercentage * -1 : getPercentage).toFixed(2)
            }
        };

        const monthsWithRowSpan = {};
        groupByMonth.forEach(({ month, group }) => { monthsWithRowSpan[month] = group.length + 1 });

        let monthStartsIndex = 0;
        const rowSpanIndex = Object.entries(monthsWithRowSpan).map(data => {
            let temp = monthStartsIndex
            monthStartsIndex += data[1]
            return temp
        });

        yearViewColumn = [
            {
                title: "MONTHS",
                dataIndex: `month`,
                width: '10%',
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
            },
            {
                title: "TYPES",
                dataIndex: `group`,
                // width: '25%',
                key: `group`,
                render: (data, row, index) => {
                    const obj = {
                        children: <div > {data}</div>,
                        props: { colSpan: !data ? 0 : 1, className: data === "Sub Total" ? "subTotalRevenueRows" : "" }
                    }
                    return obj
                },
            }
        ];

        const year = dataSource.map(val => val.YearOfInvoice);
        const totalYears = [...new Set(year)];

        yearViewColumn.push(
            ...totalYears.map((year, index) => {
                return {
                    title: `${year}`,
                    width: "13%",
                    dataIndex: "revenue",
                    render: (data, row, idx) => {
                        const l = row.data?.[year]
                        const percent = percentageCalculation(data[year], data[totalYears[index + 1]])
                        const obj = {
                            children: <> {data[year] ?
                                <div className="d-flex ">
                                    <div className="mr-1" style={{ fontWeight: "normal" }}>
                                        <a onClick={() => handleTableClick(l)}>
                                            {currencyFormatter(data[year])}
                                        </a>
                                    </div>
                                    <div style={{ color: "grey" }}>
                                        {index !== totalYears.length - 1 &&
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
                        if (row.month === "Total") {
                            obj.props.className = "totalRevenueRows"
                        }
                        return obj
                    }
                };
            })
        );

        return {
            finalData,
            yearViewColumn
        }
    };

    const groupByQuater = Object.entries(_groupBy(dataSource1, "QuarterOfInvoice")).map(data => ({
        quarter: data[0],
        groups: [... new Set(data[1].map(data => data.groups.map(groupsValue => groupsValue.GroupName)).flat(1))]
    }))


    const groupWithRevenue = [];
    groupByQuater.forEach(({ quarter, groups }) => {
        groups.forEach(name => {
            dataSource1.forEach(sourceData => {
                if (sourceData.QuarterOfInvoice === quarter) {
                    sourceData.groups.forEach(data => {
                        if (data.GroupName === name) {
                            groupWithRevenue.push({
                                quarter: quarter,
                                groupName: name,
                                year: data.YearOfInvoice,
                                revenue: data.TotalRevenue,
                            })
                        }
                    })
                }
            })
        })
    })
    const quarterWithGroupsRevenue = {}

    Object.entries(_groupBy(groupWithRevenue, "quarter")).forEach(data => {
        const groupsQuarterRevenue = {}
        data[1].forEach(groupData => {
            groupsQuarterRevenue[groupData.groupName] = { ...groupsQuarterRevenue[groupData.groupName] }
            groupsQuarterRevenue[groupData.groupName][groupData.year] = groupsQuarterRevenue[groupData.groupName][groupData.year] ? groupsQuarterRevenue[groupData.groupName][groupData.year] + groupData.revenue : groupData.revenue
        })
        quarterWithGroupsRevenue[data[0]] = groupsQuarterRevenue
    })
    const quarterFinalData = []
    Object.entries(quarterWithGroupsRevenue).forEach(data => {
        Object.entries(data[1]).forEach(groupData => {
            quarterFinalData.push({
                quarter: data[0],
                group: groupData[0],
                revenue: groupData[1]
            })
        })
    })

    const setColumn = [
        {
            title: "QUARTER",
            dataIndex: `quarter`,
            width: "10%",
            key: `month`,
            render: (data, row, index) => {
                const obj = {
                    children: <div>{data}</div>,
                    props: {}
                }
                return obj
            },
        },
        {
            title: "TYPES",
            dataIndex: `group`,
            key: `group`,
            render: (data, row, index) => {
                const obj = {
                    children: <div > {data}</div>,
                }
                return obj
            },
        }
    ]


    const year = dataSource.map(val => val.YearOfInvoice);
    const totalYears = [...new Set(year)];

    setColumn.push(
        ...totalYears.map((year, index) => {
            return {
                title: `${year}`,
                width: "15%",
                dataIndex: "revenue",
                render: (data, row, index) => {
                    return <div>{data[year]}</div>
                }
            };
        })
    );

    console.log('dataSource', dataSource)

    return (
        <div>
            {(viewBy === "month" || viewBy === "year") && Object.keys(compareSalesTableData).length > 0 ? <Table
                dataSource={compareSalesTableData?.finalData}
                columns={compareSalesTableData?.yearViewColumn}
                pagination={pagination}
                scroll={scroll}
                className={className}
                size="small"
                bordered={bordered}
            /> :
                <Table
                    dataSource={quarterFinalData}
                    columns={setColumn}
                    pagination={pagination}
                    scroll={scroll}
                    className={className}
                    bordered={bordered}
                />
            }
        </div>
    );
};

export default CompareSalesTableGroupV1;
