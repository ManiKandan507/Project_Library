import React, { useEffect } from 'react';
import _map from 'lodash/map';
import { useDispatch, useSelector } from "react-redux";

import CardWrapper from '../Common/CardWrapper';
import CustomTable from '../Common/CustomTable';
import { limit, offset } from "../Utils";
import { fetchActiveUsersUidRequest, fetchActiveUsersDataRequest } from '../../../appRedux/actions';
import { ACTIVE_USER_DATA_LIMIT } from '../../../constants';
import { Tooltip } from 'antd';
import { InfoCircleFilled } from '@ant-design/icons';

const ActiveUserDetails = ({
    title,
    activeTab,
    tableColumn,
    tableData,
    loading = false,
    appdir,
    sourceHex,
    dates
}) => {

    const dispatch = useDispatch();

    const isActiveUserSuccess = useSelector(
        (state) => state.reporting.isActiveUserSuccess
    );

    const activeUsersUidData = useSelector(
        (state) => state.reporting.activeUsersUidData?.users
    );

    useEffect(() => {
        dispatch(fetchActiveUsersUidRequest({
            appDir: appdir,
            startDate: dates[0],
            endDate: dates[1],
            offset,
            limit: ACTIVE_USER_DATA_LIMIT,
        }));
    }, [dates]);

    useEffect(() => {
        if (isActiveUserSuccess && activeUsersUidData.length) {
            let constructedUids = _map(activeUsersUidData, (data) => data.contact_uuid);
            dispatch(fetchActiveUsersDataRequest({
                appDir: appdir,
                startDate: dates[0],
                endDate: dates[1],
                constructedUids,
            }));
        }
    }, [isActiveUserSuccess, activeUsersUidData]);


    return (
        <div>
            <div className='d-flex'>
                <div className='mr-2 card-title ' >{title}</div>
                <Tooltip title={title} placement="right">
                    <InfoCircleFilled style={{fontSize:"14px", color:"#808080"}}  />
                </Tooltip>
            </div>
            <div className='mt-2 ml-2'>
                <CustomTable
                    exportCsv={false}
                    columns={tableColumn}
                    tableData={tableData}
                    showPagination={false}
                    loading={loading}
                />
            </div>
        </div>
    )
}

export default ActiveUserDetails;