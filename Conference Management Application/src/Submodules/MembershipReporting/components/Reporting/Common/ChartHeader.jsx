import React, { useEffect } from "react";
import { Select, DatePicker, Typography } from "antd";
import DownloadChart from "./DownloadChart";
import _isEmpty from 'lodash/isEmpty';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ChartHeader = ({
    select = {},
    datePicker = {},
    downloadChart = {},
    viewBySelect = {},
    pageTotal = 0,
    children,
    loader = false,
    allowMultiSelect= true,
}) => {
    const showViewBySelect = !_isEmpty(viewBySelect);
    const {
        className = "mb-4",
        defaultValue = [],
        onChange,
        loading,
        dataSource = {},
        mode = "multiple",
        style = {
            width: "100%"
        },
        placeholder = "Please select"
    } = select;

    const {
        showDatePicker = false,
        showRangePicker = false,
        showYearPicker = false,
        allowClear = true,
        defaultValue: dateDefaultValue,
        onChange: dateOnChange,
        className: dateClassName = "",
        
    } = datePicker

    const {
        chartRef = null,
        fileName = {},
        showDownload = true,
        disabled = false
    } = downloadChart;

    const {
        viewByOptions,
        viewByChange,
        defaultView
    } = viewBySelect;

    const generateOptions = () => {
        return Object.keys(dataSource).map((groupId) => {
            return <Option key={groupId}>{dataSource[groupId]}</Option>;
        })
    }

    return (
        <div>
            {allowMultiSelect && 
            <Select
                className={className}
                mode={mode}
                allowClear
                style={style}
                loading={loading}
                placeholder={placeholder}
                defaultValue={defaultValue}
                onChange={onChange}
            // maxTagCount="responsive"
            >
                {generateOptions()}
            </Select>
            }
            {!allowMultiSelect && 
            <Select
                className={className}
                allowClear
                style={style}
                loading={loading}
                placeholder={placeholder}
                defaultValue={defaultValue}
                onChange={onChange}
            // maxTagCount="responsive"
            >
                {generateOptions()}
            </Select>
            }
            
            <div className="px-2 d-flex">
                {pageTotal ? (
                    <Typography.Title level={5} className='mb-1 mt-2'>
                        {pageTotal}
                    </Typography.Title>
                ) : null}
                <div className="d-flex flex-grow-1 justify-end">
                    {showViewBySelect &&
                        <Select className="ml-3" key={defaultView} onChange={viewByChange} defaultValue={defaultView} style={{ width: '100px' }}>
                            {Object.keys(viewByOptions).map(key => (
                                <Option value={key} disabled={viewByOptions[key].disabled}>{key}</Option>
                            ))}
                        </Select>
                    }
                    {showYearPicker &&
                        <div className="ml-3">
                         <RangePicker
                                className={dateClassName}
                                allowClear={allowClear}
                                defaultValue={dateDefaultValue}
                                onChange={dateOnChange}
                                picker="year"
                            />
                    </div>
                    }
                    {!showYearPicker && showDatePicker &&
                        <div className="ml-3">
                            <DatePicker
                                className={dateClassName}
                                allowClear={allowClear}
                                defaultValue={dateDefaultValue}
                                onChange={dateOnChange}
                            />
                        </div>
                    }
                    {!showYearPicker && showRangePicker &&
                        <div className="ml-3">
                            <RangePicker
                                className={dateClassName}
                                allowClear={allowClear}
                                defaultValue={dateDefaultValue}
                                onChange={dateOnChange}
                            />
                        </div>
                    }
                    {showDownload &&
                        <div className="ml-3">
                            <DownloadChart
                                disabled={disabled}
                                chartRef={chartRef}
                                fileName={fileName}
                            />
                        </div>
                    }
                </div>
            </div>

        </div>
    )
}

export default ChartHeader;