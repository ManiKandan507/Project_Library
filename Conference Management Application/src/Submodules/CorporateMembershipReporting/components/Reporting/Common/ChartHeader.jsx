import React from "react";
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
	loader = false
}) => {
	const showViewBySelect = !_isEmpty(viewBySelect);
	const {
		className = "mb-4",
		defaultValue = [],
		onChange,
		loading,
		dataSource = {},
		mode = "multiple",
		style = { width: "100%" },
		placeholder = "Please select"
	} = select;

	const {
		showDatePicker = false,
		showRangePicker = false,
		allowClear = true,
		defaultValue: dateDefaultValue,
		onChange: dateOnChange,
		className: dateClassName = ""
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

	return (
		<div>
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
				{Object.keys(dataSource).map((groupId) => (<Option key={groupId}>{dataSource[groupId]}</Option>))}
			</Select>
			<div className="px-2 d-flex">
				{Boolean(pageTotal) ? <Typography.Title level={5} className='mb-1 mt-2'>{pageTotal}</Typography.Title> : null}
				<div className="d-flex flex-grow-1 justify-end">
					{showViewBySelect &&
						<Select key={defaultView} onChange={viewByChange} defaultValue={defaultView} style={{ marginRight: '10px', width: '100px' }}>
							{Object.keys(viewByOptions).map(key => (<Option value={key} disabled={viewByOptions[key].disabled}>{key}</Option>))}
						</Select>
					}
					{showDatePicker && <DatePicker className={dateClassName} allowClear={allowClear} defaultValue={dateDefaultValue} onChange={dateOnChange} />}
					{showRangePicker && <RangePicker className={dateClassName} allowClear={allowClear} defaultValue={dateDefaultValue} onChange={dateOnChange} />}
					{showDownload && <DownloadChart disabled={disabled} chartRef={chartRef} fileName={fileName} />}
				</div>
			</div>

		</div>
	)
}

export default ChartHeader;