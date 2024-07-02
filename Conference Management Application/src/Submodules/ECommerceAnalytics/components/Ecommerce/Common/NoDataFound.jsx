import { Empty } from 'antd';
import React from 'react';
import { NO_DATA_FOUND_TEXT } from '../../../constants';

const NoDataFound = ({ noDataLabel = "" }) => {
   return <Empty description={noDataLabel ? noDataLabel : NO_DATA_FOUND_TEXT} image={Empty.PRESENTED_IMAGE_SIMPLE} />
}

export default NoDataFound