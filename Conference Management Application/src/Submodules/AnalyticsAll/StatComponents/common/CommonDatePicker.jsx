import React from "react";
import { memo } from "react";
import { DatePicker } from "antd";
import moment from 'moment'
import { calculateMonthDays } from "@/AnalyticsAll/StatComponents/utils";

const { RangePicker } = DatePicker;

const CommonDatePicker = ({ handleDate = () => { } }) => {
    return (
        <RangePicker
            className='date-picker'
            defaultValue={[moment().startOf('month').subtract(calculateMonthDays(2), "days"), moment()]}
            format='MM/DD/YYYY'
            onChange={handleDate}
        />
    )
}

export default memo(CommonDatePicker);
