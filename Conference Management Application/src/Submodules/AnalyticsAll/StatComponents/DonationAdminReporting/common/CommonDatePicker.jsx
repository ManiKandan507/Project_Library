import React from "react";
import { memo } from "react";
import { DatePicker } from "antd";
import moment from 'moment'

const { RangePicker } = DatePicker;

const CommonDatePicker = ({ handleDate = () => { }, handleOpenPop = () => { } }) => {

    return (
        <RangePicker
            className='date-picker ml-3'
            defaultValue={[moment().subtract(6, 'month'), moment()]}
            format='MM/DD/YYYY'
            onChange={handleDate}
            onOpenChange={handleOpenPop}
        />
    )
}

export default memo(CommonDatePicker);
