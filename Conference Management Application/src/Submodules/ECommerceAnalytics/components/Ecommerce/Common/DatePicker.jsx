import React from "react";
import { DatePicker } from "antd";


const { RangePicker } = DatePicker;

const CommonDatePicker = ({ defaultValue = [], onChange = () => { } }) => {
    return (
        <RangePicker
            className='date-picker'
            defaultValue={defaultValue}
            format='MM/DD/YYYY'
            onChange={onChange}
        />
    )
}

export default CommonDatePicker;
