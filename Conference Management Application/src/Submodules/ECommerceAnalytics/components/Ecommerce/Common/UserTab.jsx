import React from "react";
import { Select, DatePicker } from 'antd';
import moment from "moment";

const { Option } = Select;
const { RangePicker } = DatePicker;


const UserTab = ({ isDropDown = true })=>{
    return(
        <div style={{display:'flex', justifyContent: 'space-between'}}>
                {isDropDown && <Select style={{ width: '85%' }} placeholder="Select User">
                    <Option>lucy</Option>
                    <Option>kumar</Option>
                </Select>}
           <div>
                <RangePicker
                    className='date-picker'
                    defaultValue={[moment().subtract(30, 'days'), moment()]}
                    format={'DD/MM/YYYY'}
                />
           </div>
            
        </div>
    )
}

export default UserTab;