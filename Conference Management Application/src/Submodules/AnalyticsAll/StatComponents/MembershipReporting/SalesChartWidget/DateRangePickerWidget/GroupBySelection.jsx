import React from "react";
import { Select } from "antd";

const { Option } = Select;

const GroupBySelection = ({
    selectedOptions,
    setSelectedOptions,
    showTimeGroupBy,
    timeGroupBy,
    hasCompare,
    showByConfig}) => {
    
    const handleChange = (e) => {
        setSelectedOptions(e)
    }

    return (
        <div>
            {showByConfig ?  (
                    showTimeGroupBy ?  (
                      <Select
                        value={selectedOptions}
                        style={{ width: 100 }}
                        onChange={handleChange}
                      >
                        {!hasCompare ? (
                        <>
                          {timeGroupBy.includes(
                            "DATE"
                          ) && <Option value="date">Date</Option>}
                          {timeGroupBy.includes(
                            "WEEK"
                          ) && <Option value="week">Week</Option>}
                          {timeGroupBy.includes(
                            "MONTH"
                          ) && <Option value="month">Month</Option>}
                          {timeGroupBy.includes(
                            "QUARTER"
                          ) && <Option value="quarter">Quarter</Option>}
                          {timeGroupBy.includes(
                            "YEAR"
                          ) && <Option value="year">Year</Option>}
                        </>
                        ) : (
                        <>
                          {timeGroupBy.includes(
                            "MONTH"
                          ) && <Option value="month">Month</Option>}
                          {timeGroupBy.includes(
                            "QUARTER"
                          ) && <Option value="quarter">Quarter</Option>}
                        </>
                        )}
                      </Select>
                    ) : (
                      <></>
                    )
                  ) : (
                    <Select
                      value={selectedOptions}
                      style={{ width: 100 }}
                      onChange={handleChange}
                    >
                      {!hasCompare ? (
                        <>
                          <Option value="date">Date</Option>
                          <Option value="week">Week</Option>
                          <Option value="month">Month</Option>
                          <Option value="quarter">Quarter</Option>
                          <Option value="year">Year</Option>
                        </>
                      ) : (
                        <>
                          <Option value="month">Month</Option>
                          <Option value="quarter">Quarter</Option>
                        </>
                      )}
                    </Select>
                  )}
        </div>
    )
}
export default GroupBySelection;