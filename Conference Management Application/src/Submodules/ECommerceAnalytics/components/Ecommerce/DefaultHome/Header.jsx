import React from 'react';
import moment from 'moment';

import CommonDatePicker from '../Common/DatePicker';

const Header = ({ title = '', handleDateFilter }) => {

    const handleDateChange = (value, dateStrings) => {
        handleDateFilter(dateStrings);
    }

    return (
        <div className='d-flex flex-row justify-space-between'>
            <div>
                {title}
            </div>
            <div>
                <CommonDatePicker
                    defaultValue={[moment().subtract(30, 'days'), moment()]}
                    onChange={handleDateChange}
                />
            </div>
        </div>
    )
}

export default Header;