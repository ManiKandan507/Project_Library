import React, { useState, useEffect } from "react";
import moment from 'moment';
import { Avatar, Table, Tag, Tooltip } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { ReactComponent as Information } from '@/AnalyticsAll/NativeDashboards/MembershipReporting/assets/icons/Information.svg';
import { sortMemberGroupType, sortName } from "@/AnalyticsAll/StatComponents/util";
import CommonSpinner from "@/MembershipReportingV2/common/CommonSpinner";
import { useRecentMemberHook } from "@/MembershipReportingV2/hooks/Home";
import {ErrorBoundary, ErrorFallback} from '@/MembershipReportingV2/common/errorBoundary'
import { dateFormat } from "../util";

export const RecentOrders = (props) => {
    const { params: { source_hex }, signal } = props

    const [dataSource, setDataSource] = useState([])
    const { recentOrders, loading } = useRecentMemberHook(source_hex, 10, signal)
    
    useEffect(()=>{
        let orderDatas = [];
            recentOrders.map((data) => {
                if(data.Membership === 'RENEWING_MEMBER'){
                    orderDatas.push({...data, Membership:'Renewing Member', color:'#faad14'})
                } else {
                    orderDatas.push({...data, Membership:'New Member', color:'#55c51e'})
                }
            })
            setDataSource(orderDatas)
    },[recentOrders])

    const userColumn = [
        {
            title: "Name",
            dataIndex: "user",
            key: "user",
            width:50,
            ellipsis:true,
            render: (_, data) => {
            return <div className="d-flex text-left">
                    <div className="pt-1"><Avatar size={40} alt="profile" className="mr-2" icon={<UserOutlined/>} src={data.Picture}/></div>
                    <div className="d-flex flex-column flex-wrap">
                        <div className="d-flex flex-wrap">
                            <div style={{width:'100%'}}> {data.Firstname} {data.Lastname} </div>
                            <div> <Tag color={data.color} className="d-flex align-center" style={{fontSize:'13px'}}>{data.Membership}</Tag></div>
                        </div>
                        <div className="pt-1">
                            <Tooltip title={data.MemberGroupType}>
                                <Tag className="elipsis lg-w-200">{data.MemberGroupType}</Tag>
                            </Tooltip>
                        </div> 
                    </div>
                </div>
            },
            sorter:sortName,
        },
        {
            title: "Order Date",
            dataIndex: "DatePaid",
            key: "DatePaid",
            width:'25%',
            render: (_, data) => {
                return (
                    <div className= "text-left">{dateFormat(data.DatePaid)}</div>
                )
            }
        },
    ];

    const Test =()=>{
        throw new Error("error")
    } 

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}> 
            {/* <Test/> */}
            <CommonSpinner loading={loading}>
                <div className="py-4">
                    <div className="d-flex title py-2">
                        <div>{"RECENT ORDERS"}</div>
                        <span className="ml-2">
                            <Tooltip title={"10 most recent membership orders"} placement="right">
                                <Information style={{ width: "0.9rem" }} />
                            </Tooltip>
                        </span>
                    </div>
                    <div className='py-2'>
                        <Table
                        dataSource={dataSource}
                        columns={userColumn}
                        pagination={false}
                        className="memberTable"
                        scroll={{ y: 300 }}
                        rowKey={({ReviewID}) => ReviewID}
                        />
                    </div>
                </div>
            </CommonSpinner>
        </ErrorBoundary>
    );
};
