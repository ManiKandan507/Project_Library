import React from "react";
import { memo } from "react";
import { DatePicker } from "antd";
import moment from 'moment'
import { calculateMonthDays } from "@/AnalyticsAll/StatComponents/util";

const { RangePicker } = DatePicker;

const CommonDatePicker = ({ handleDate = () => { } }) => {

    const disabledDate = (current) => {
        return current && current > moment().endOf('day')
    }

    return (
        <RangePicker
            className='date-picker ml-3'
            defaultValue={[moment().startOf('month').subtract(calculateMonthDays(2), "days"), moment()]}
            format='MM/DD/YYYY'
            onChange={handleDate}
            allowClear={false}
            disabledDate={disabledDate}
        />
    )
}

export default memo(CommonDatePicker);
