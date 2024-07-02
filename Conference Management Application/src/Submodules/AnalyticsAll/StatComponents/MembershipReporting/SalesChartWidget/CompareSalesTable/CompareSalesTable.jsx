import React from "react";
import { Table } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import moment from "moment/moment";

const CompareSalesTable = ({
    dataSource,
    type,
    pagination,
    scroll,
    className,
    bordered,
    startDate,
    viewBy,
    handleTableClick
}) => {

    const compareSalesTableColumn = () => {
        const year = dataSource.map((val) => {
            return val.YearOfInvoice
        })
    
        const totalYears = [...new Set(year)];
        const salesYears = moment(startDate, 'DD/MM/YYYY').format('MM') !== moment().startOf('year').format('MM') ? totalYears.length - 1 : totalYears.length;

        const compareSalesColumn = [
            {
                title: "MONTHS",
                colspan: 3,
                dataIndex: 'NameOfMonth',
                render: (data, row, index) => {
                    const obj = {
                        children : <div style={{color: '#0070af'}}>{data}</div>,
                        props: {}
                    }
                    for(let i = 0; i <= dataSource.length; i++){
                        if(index % salesYears === 0){
                            obj.props.rowSpan = salesYears;
                        }
                        if(index % salesYears !== 0){
                            obj.props.rowSpan = 0;
                        }
                    }
                    return obj
                }
            },
            {
                title: 'YEARS',
                colspan: 0,
                dataIndex: 'YearOfInvoice',
                render: (data, row, index) => {
                    const obj = {
                        children:  data,
                        props: {}   
                    }
                    return obj
                }
            },
            {
                title: type === 'TOTAL_MEMBERS' ? 'SALES' : 'REVENUE',
                colspan: 0,
                dataIndex: type === 'TOTAL_MEMBERS' ? 'TotalInvoices' : 'TotalRevenue',
                render: (_,data) => {
                    const obj = {
                        children: <a onClick={() => handleTableClick(data)}>{type === 'TOTAL_MEMBERS' ?  data.TotalInvoices : `$${data.TotalRevenue}`}</a>,
                        props: {}
                    }
                    return obj
                }
            },
            {
                title: type === 'TOTAL_MEMBERS' ? 'SALES CHANGES' : 'REVENUE CHANGES',
                colspan: 0,
                dataIndex: 'percent',
                render: (_,data) => {
                    let text = data.percent;
                    return <div>{text !== '' && text !== 'NA' ? `${Math.abs(text)}%` : '-'} { text !== '' && text !== 'NA' ? Math.sign(text) === 1 ? <ArrowUpOutlined  style={{color: 'green'}} /> : <ArrowDownOutlined  style={{color:'red'}} /> : '' }</div>
                }
            },
        ]
        return compareSalesColumn
    }

    const compareQuarterTableColumn = () => {
        const year = dataSource.map((val) => {
            return val.YearOfInvoice
        })
    
        const totalYears = [...new Set(year)];
        const salesYears = moment(startDate, 'DD/MM/YYYY').format('MM') !== moment().startOf('year').format('MM') ? totalYears.length - 1 : totalYears.length;

        const compareSalesColumn = [
            {
                title: "QUARTER",
                colspan: 3,
                dataIndex: 'Quarter',
                render: (data, row, index) => {
                    const obj = {
                        children : <div style={{color: '#0070af'}}>{data}</div>,
                        props: {}
                    }
                    for(let i = 0; i <= dataSource.length; i++){
                        if(index % salesYears === 0){
                            obj.props.rowSpan = salesYears;
                        }
                        if(index % salesYears !== 0){
                            obj.props.rowSpan = 0;
                        }
                    }
                    return obj
                }
            },
            {
                title: 'YEARS',
                colspan: 0,
                dataIndex: 'YearOfInvoice',
                render: (data, row, index) => {
                    const obj = {
                        children:  data,
                        props: {}   
                    }
                    return obj
                }
            },
            {
                title: type === 'TOTAL_MEMBERS' ? 'SALES' : 'REVENUE',
                colspan: 0,
                dataIndex: 'TotalSales',
                render: (_,data) => {
                    const obj = {
                        children:  <a onClick={() => handleTableClick(data)}>{type === 'TOTAL_MEMBERS' ?  data.TotalSales : `$${data.TotalSales}`}</a> ,
                        props: {}
                    }
                    return obj
                }
            },
            {
                title: type === 'TOTAL_MEMBERS' ? 'SALES CHANGES' : 'REVENUE CHANGES',
                colspan: 0,
                dataIndex: 'percent',
                render: (_,data) => {
                    let text = data.percent;
                    return <div>{text !== '' && text !== 'NA' ? `${Math.abs(text)}%` : '-'} { text !== '' && text !== 'NA' ? Math.sign(text) === 1 ? <ArrowUpOutlined  style={{color: 'green'}} /> : <ArrowDownOutlined  style={{color:'red'}} /> : '' }</div>
                }
            },
        ]
        return compareSalesColumn
    }

    return (
        <div>
            <Table 
                dataSource={dataSource}
                columns={viewBy === 'month' ? compareSalesTableColumn() : compareQuarterTableColumn()}
                pagination={pagination}
                scroll={scroll}
                className={className}
                bordered={bordered}
            />
        </div>
    )
}

export default CompareSalesTable;