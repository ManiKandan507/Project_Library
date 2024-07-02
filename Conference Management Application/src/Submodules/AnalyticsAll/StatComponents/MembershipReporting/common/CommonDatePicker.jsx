import React from "react";
import { memo } from "react";
import { DatePicker } from "antd";
import moment from 'moment'
import { calculateMonthDays } from "@/AnalyticsAll/StatComponents/util";

const { RangePicker } = DatePicker;

const CommonDatePicker = ({ handleDate = () => { }, handleOpenPop = () => { }, pickerType='date' }) => {

    return (
        <RangePicker
            className='date-picker ml-3'
            defaultValue={[moment().startOf('month').subtract(calculateMonthDays(2), "days"), moment()]}
            format={pickerType=='year'? 'YYYY':'MM/DD/YYYY'}
            onChange={handleDate}
            onOpenChange={handleOpenPop}
            picker={pickerType}
        />
    )
}

export default memo(CommonDatePicker);
