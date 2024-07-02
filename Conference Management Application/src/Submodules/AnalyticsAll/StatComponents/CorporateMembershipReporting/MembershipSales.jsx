import React, { useState, useRef } from "react";
import { Button, Col, Radio, Row, Table } from "antd";
import moment from "moment";

import CommonSpinner from "@/CorporateMembershipReportingV2/common/CommonSpinner";
import DownloadChart from "@/CorporateMembershipReportingV2/common/DownloadChart";
import CustomExportCsv from "@/CorporateMembershipReportingV2/common/CustomExportCsv";
import {ErrorBoundary, ErrorFallback} from '@/CorporateMembershipReportingV2/common/errorBoundary';
import { useSalesActivityHook } from "@/CorporateMembershipReportingV2/hooks/SalesActivity";
import { MembershipSalesChart } from "@/CorporateMembershipReportingV2/MembershipSalesChart";
import { getMonthStartDate } from "@/AnalyticsAll/StatComponents/util";
import _groupBy from 'lodash/groupBy';
import  _map from 'lodash/map';
import { ArrowDownOutlined, ArrowUpOutlined, LineChartOutlined, TableOutlined } from "@ant-design/icons";
import { getMonthName } from "../util";

export const MembershipSales = (props) => {

    const chartRef = useRef();
    const { params: { source_hex, groups_array, primary_color }, signal } = props
    const [navigate, setNavigate] = useState(true);
    const [activeTab, setActiveTab] = useState('chart')

    const groupid = groups_array.map((data) => {
        return data.groupid
    })

    let { salesActivity,loading } = useSalesActivityHook(source_hex, groupid, getMonthStartDate(2), moment().format('DD/MM/YYYY'), signal);

    const constructData = salesActivity.map((sale)=>{
        const MonthOfInvoice =  getMonthName(sale.PaidMonth);
        return {
            ...sale,
            MonthOfInvoiceKey: `${MonthOfInvoice}`,
        }
    })

    const reverseMonth = constructData.sort((a,b)=> b.PaidYear - a.PaidYear);

    const constructedData = _map(_groupBy(reverseMonth, "PaidMonth"),(groupArr) => {
        if(groupArr.length === 1){
            groupArr.map((arr)=>{
                return(groupArr.push({
                    PaidMonth: arr.PaidMonth,
                    PaidYear: arr.PaidYear - 1,
                    TotalInvoices: 0,
                    MonthOfInvoiceKey: arr.MonthOfInvoiceKey
                }))
            })
        }
        let YearOfInvoiceKey;
        let MonthData = groupArr.map((sales)=>{
            let percent = groupArr["1"]?.TotalInvoices !== 0 ? (((groupArr["1"]?.TotalInvoices - groupArr["0"]?.TotalInvoices)/groupArr[1]?.TotalInvoices*100).toFixed(2)) : "NA" ;
            YearOfInvoiceKey = `${groupArr["0"]?.PaidMonth} - ${groupArr["0"]?.PaidYear}`
            let salesPercentData = {...sales, Percent: percent}
            return salesPercentData
        })
        return ({YearOfInvoice:YearOfInvoiceKey, MonthData})
    })

    constructedData.sort((a,b) => {
        a = a.YearOfInvoice.split("-");
        b = b.YearOfInvoice.split("-")
        return new Date(b[1], b[0], 1) - new Date(a[1], a[0], 1)
    });
    
    const DataSources = constructedData.map((src)=>{
        return src.MonthData
    }).flat(1)

    const renderContent = (value, row, index) => {
        const obj = {
            children: value,
            props: {}
        }
        if (index) {
            obj.props.colSpan = 1;
            obj.props.rowSpan = 1;
        }
        return obj;
    }

    const MemberSalesColumn = [
        {
            title: "MONTH",
            dataIndex: "MonthOfInvoiceKey",
            key: "MonthOfInvoiceKey",
            colSpan: 2,
            render: (data, row, index) => {
                const obj = {
                    children : data,
                    props: {}
                }
                for(let i = 0; i <= DataSources.length; i++){
                    if(index % 2 === 0){
                        obj.props.rowSpan = 2;
                    }
                    if(index % 2 !== 0){
                        obj.props.rowSpan = 0;
                    }
                }
                return obj
            },
        },
        {
            title: "PaidYear",
            colSpan: 0,
            dataIndex: 'PaidYear',
            render: renderContent,
        },
        {
            title: "TotalInvoices",
            colSpan: 0,
            dataIndex: "TotalInvoices",
            key: "TotalInvoices",
            render: renderContent
        },
        {
            title: "SALES",
            dataIndex: "Percent",
            colSpan: 2,
            render: (data, row, index) => {
                const obj = {
                    children :<div>{data === "NA" ? data : `${Math.abs(data)} %`} {Math.sign(data) !== 1 || data === "NA" ? <ArrowUpOutlined  style={{color: 'green'}} /> : <ArrowDownOutlined  style={{color:'red'}} /> }</div>,
                    props: {}
                }
                for(let i = 0; i <= DataSources.length; i++){
                    if(index % 2 === 0){
                        obj.props.rowSpan = 2;
                    }
                    if(index % 2 !== 0){
                        obj.props.rowSpan = 0;
                    }
                }
                return obj 
            }
        }
    ];

    const handleClick = (e) => {
        let salesView;
        if (e.target.value === 'chart') {
            salesView = true;
        }
        else {
            salesView = false
        }
        setNavigate(salesView)
        setActiveTab(e.target.value)
    }

    const salesHeaders = [
        { label:`Months(${moment().startOf('month').subtract(2, "months").format('MM/DD/YYYY')} - ${moment().format('MM/DD/YYYY')})`, key: "PaidMonth" },
        { label: "Sales", key: "TotalInvoices" },
    ]

    const Test =()=>{
        throw new Error("error")
    }

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}> 
            {/* <Test/> */}
            <CommonSpinner loading={loading}>
                <div className="py-4">
                    <Row gutter={16}>
                        <Col flex={3} className='title ml-2'>{'MEMBERSHIP SALES AND RENEWALS'}</Col>
                        <Col>
                            <Radio.Group value={activeTab} onChange={handleClick}>
                                <Radio.Button value='chart'><LineChartOutlined className="pr-1" /> Chart</Radio.Button>
                                <Radio.Button value='table'> <TableOutlined className="pr-1" /> Table</Radio.Button>
                            </Radio.Group>
                        </Col>
                        {salesActivity?.length && navigate ? <Col>
                            <DownloadChart chartRef={chartRef} fileName={{ name: "Membership Sales" }} />
                        </Col>
                            : ""}
                        {DataSources.length && !navigate ? 
                            <Col>
                                <CustomExportCsv
                                    dataSource={DataSources.map(data=>{
                                        return{
                                            PaidMonth:`${data.MonthOfInvoiceKey} - ${data.PaidYear}`,
                                            TotalInvoices:data.TotalInvoices,
                                        }
                                    })}
                                    Headers={salesHeaders}
                                    exportFileName="Membership Sales"
                                />
                            </Col> : ''
                        }
                    </Row>
                    {navigate && <div className="py-2" style={{ height: '350px' }}>
                        <MembershipSalesChart salesActivity={salesActivity} chartRef={chartRef}primary_color= {primary_color} />
                    </div>}
                    {!navigate && <div className="pa-6">
                        <Table dataSource={DataSources} columns={MemberSalesColumn} pagination={false} className='salesTable' 
                            scroll={{y:300}}
                            rowKey={({PaidMonth}) => PaidMonth}
                            bordered
                        />
                    </div>}
                    <div className="py-2 ml-6">
                        <Button className="exploreMore" onClick={() => props.handleExplore('salesactivity')}> <span style={{ textDecoration: 'underline' }}> Explore More </span></Button>
                    </div>
                </div>
            </CommonSpinner>
        </ErrorBoundary>
    );
};