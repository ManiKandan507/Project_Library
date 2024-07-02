import React from "react";
import { Button, Table, Tooltip } from "antd";
import { ReactComponent as Information } from '@/AnalyticsAll/NativeDashboards/MembershipReporting/assets/icons/Information.svg';
import CommonSpinner from "@/MembershipReportingV2/common/CommonSpinner";
import { sortGroupname, sortNumbers } from "@/AnalyticsAll/StatComponents/util";
import { usePopularMembershipTypeHook } from "@/MembershipReportingV2/hooks/Home";
import { ErrorBoundary, ErrorFallback } from '@/MembershipReportingV2/common/errorBoundary';

export const PopularMembershipTypes = (props) => {

    const { params: { source_hex }, signal } = props

    let { popularMemberShip, loading } = usePopularMembershipTypeHook(source_hex, signal)

    const memberColumn = [
        {
            title: "Group Name",
            dataIndex: "Groupname",
            key: "Groupname",
            width: '70%',
            render: (_, data) => {
                return <div className= "text-left"> {data.Groupname} </div>
            },
            sorter: sortGroupname,
        },
        {
            title: "Count",
            dataIndex: "TotalInvoices",
            key: "TotalInvoices",
            render: (_, data) => {
                return <div className= "text-left"> {data.TotalInvoices} </div>
            },
            sorter: (obj1, obj2) => sortNumbers(obj1, obj2, 'TotalInvoices'),
        },
    ];

    const Test =()=>{
        throw new Error("error")
    } 

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            {/* <Test/> */}
            <CommonSpinner loading={loading}>
                <div className="d-flex title">
                    <div>{"POPULAR MEMBERSHIP TYPES"}</div>
                    <span className="ml-2">
                        <Tooltip title={"Top 5 memberships purchased within the last 90 days"} placement="right">
                            <Information style={{ width: "0.9rem" }} />
                        </Tooltip>
                    </span>
                </div>
                <div className="py-3">
                    <Table dataSource={popularMemberShip} columns={memberColumn} pagination={false}
                        className='memberTable' scroll={{ y: 300 }}
                        rowKey={({ GroupID }) => GroupID}
                    />
                </div>
                <div className="py-2">
                    <Button className="exploreMore" onClick={() => props.handleExplore('members')}> <span style={{ textDecoration: 'underline' }}> Explore More </span></Button>
                </div>
            </CommonSpinner>
        </ErrorBoundary>
    );
};