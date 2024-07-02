import React from 'react';
import { Select } from 'antd';
import moment from "moment";

import CommonDatePicker from './DatePicker';

const { Option } = Select;

const HeaderContainer = ({
    title,
    screen,
    selectFieldValues = {},
    handleDateChange = () => { },
    style = {},
    userSelectField = {}
}) => {

    const {
        key,
        defaultValue,
        data,
        onChange = () => { },
    } = selectFieldValues;

    return (
        <>
            <div className="d-flex align-center justify-space-between">
                <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                    {title}
                </div>
                <div>
                    {screen === 'bandwidth'
                        ? (<Select
                            key={key}
                            defaultValue={defaultValue}
                            style={style}
                            onChange={onChange}
                        >
                            {Object.keys(data).map((key, index) => (
                                <Option value={key} disabled={data[key].disabled} key={index}>{key}</Option>
                            ))}
                        </Select>
                        ) : null
                    }
                    {screen !== 'by_user' && screen !== 'active_user' ? (
                        <CommonDatePicker
                            defaultValue={[moment().subtract(30, 'days'), moment()]}
                            onChange={handleDateChange}
                        />
                    ) : null}
                </div>
            </div>
            {screen === 'by_user' ? (
                <div className="d-flex justify-space-between">
                    <Select
                        style={{ width: '85%' }}
                        placeholder="Select User"
                        onChange={userSelectField.onChange}
                        showSearch
                    >
                        {userSelectField?.data?.map((data, index) => {
                            return (
                                <Option value={`${data.Firstname} ${data.Lastname}`} key={index}>
                                    {`${data.Firstname} ${data.Lastname}`}
                                </Option>
                            )
                        })}
                    </Select>
                    <div>
                        <CommonDatePicker
                            defaultValue={[moment().subtract(15, 'days'), moment()]}
                            onChange={handleDateChange}
                        />
                    </div>
                </div>
            ) : null}
        </>
    )
}

export default HeaderContainer;