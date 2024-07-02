import React, { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Badge, Spin, Tooltip } from 'antd';

import CardWrapper from '../Common/CardWrapper';
import ResponsiveLineChart from '../Common/CustomLineChart';
import { fetchMonthlyBandwidthDataRequest } from '../../../appRedux/actions';
import { InfoCircleFilled } from '@ant-design/icons';

const BandwidthChart = ({ title = '', chartData, activeTab, dates, appdir }) => {
    const dispatch = useDispatch();

    const loading = useSelector(
        (state) => state.reporting.monthlyBandwidthLoading
    );

    useEffect(() => {
        dispatch(fetchMonthlyBandwidthDataRequest({
            appDir: appdir,
            startDate: dates[0],
            endDate: dates[1]
        }))
    }, [dates]);


    return (
        <>
            <div className='d-flex'>
                <div className='mr-2 card-title' >{title}</div>
                <Tooltip title={title} placement="right">
                    <InfoCircleFilled style={{fontSize:"14px", color:"#808080"}}  />
                </Tooltip>
            </div>
            <div className='d-flex mt-2 ml-2'>
                <Badge color={"cyan"} style={{fontSize:"13px",width:"15px",height:"16px"}} className="badgeIcon"/>
                <div className='ml-2' style={{fontSize:"14px"}}>Bandwidth Usage</div>
            </div>
            {loading ? (
                <div style={{ textAlign: 'center' }}>
                    <Spin size="large" />
                </div>
            ) : (<ResponsiveLineChart
                data={chartData}
                colors={{ scheme: 'pastel1' }}
                loading={loading}
                curve={'linear'}
                label="GB"
                type="bandwidth_usage"
            />)}
            </>
    )
}

export default BandwidthChart;