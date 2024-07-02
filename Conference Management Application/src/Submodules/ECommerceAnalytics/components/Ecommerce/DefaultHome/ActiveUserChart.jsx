import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Badge, Spin, Tooltip } from 'antd';

import CardWrapper from '../Common/CardWrapper';
import ResponsiveLineChart from '../Common/CustomLineChart';
import { fetchMonthlyActiveUsersRequest } from '../../../appRedux/actions';
import { InfoCircleFilled } from '@ant-design/icons';
import Header from './Header';

const ActiveUserChart = ({ title = '', chartData, activeTab, dates, appdir,handleDateFilter}) => {
    const dispatch = useDispatch();

    const loading = useSelector(
        (state) => state.reporting.monthlyActiveUserLoading
    );

    useEffect(() => {
        dispatch(fetchMonthlyActiveUsersRequest({
            appDir: appdir,
            startDate: dates[0],
            endDate: dates[1]
        }))
    }, [dates]);

    return (
        <div>
            <div className='d-flex justify-space-between'>
                <div className='d-flex'>
                    <div className='mr-2 card-title' >{title}</div>
                        <Tooltip title={title} placement="right">
                            <InfoCircleFilled style={{fontSize:"14px", color:"#808080"}}  />
                        </Tooltip>
                </div>
                <div className='pr-5'>
                    <Header handleDateFilter={handleDateFilter} />
                </div>
            </div>
            <div className='d-flex  ml-2'>
                <Badge color={"cyan"} style={{fontSize:"13px",width:"15px",height:"16px"}}/>
                <div className='ml-2' style={{fontSize:"14px"}}>No of Users</div>
            </div>
                {loading ? (
                    <div style={{ textAlign: 'center' }}>
                        <Spin size="large" />
                    </div>
                ) :
                    (<ResponsiveLineChart
                        data={chartData}
                        loading={loading}
                        curve='linear'
                        yFormat="<(5.0f"
                        label="Users"
                        colors={{ scheme: 'category10' }}
                        type="active_users"
                    />)
                }
        </div>
    )
}

export default ActiveUserChart;