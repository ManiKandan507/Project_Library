import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import CardWrapper from '../Common/CardWrapper';
import CustomTable from '../Common/CustomTable';
import { fetchMostViewedFilesRequest } from "../../../appRedux/actions";
import { limit, offset } from "../Utils";
import { Tooltip } from "antd";
import { InfoCircleFilled } from "@ant-design/icons";

const PopularFileDetails = ({
    title,
    activeTab,
    tableColumn,
    loading = false,
    appdir,
    dates,
}) => {
    const dispatch = useDispatch();

    const mostViewedFileData = useSelector(
        (state) => {
            const { mostViewFileData } = state.reporting
          return mostViewFileData?.files?.length ? mostViewFileData?.files : []
        } 
    );
    
    useEffect(() => {
        if (dates && dates.length) {
            dispatch(fetchMostViewedFilesRequest({
                appDir: appdir,
                startDate: dates[0],
                endDate: dates[1],
                offset,
                limit
            }));
        }
    }, [dates]);

    return (
        <div>
            <div className='d-flex'>
                <div className='mr-2 card-title' >{title}</div>
                <Tooltip title={title} placement="right">
                    <InfoCircleFilled style={{fontSize:"14px", color:"#808080"}}  />
                </Tooltip>
            </div>
            <div className='mt-2 ml-2'>
                <CustomTable
                    exportCsv={false}
                    columns={tableColumn}
                    tableData={mostViewedFileData}
                    showPagination={false}
                    loading={loading}
                />
            </div>
        </div>
        // </CardWrapper>
    )
}

export default PopularFileDetails;