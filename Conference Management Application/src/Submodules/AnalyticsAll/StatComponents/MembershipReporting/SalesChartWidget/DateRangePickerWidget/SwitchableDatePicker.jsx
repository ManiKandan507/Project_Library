import React, { useState, useContext, useEffect, useCallback } from "react";
import { Button, Col, DatePicker, Row, Select } from "antd";
import GlobalContext from "../../context/MemberContext";
import { formatDate } from "@/AnalyticsAll/StatComponents/util";
import moment from "moment";
import GroupBySelection from "./GroupBySelection";
import { SearchOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { Option } = Select;

const SwitchableDatePicker = ({ props }) => {
  const [showByConfig] = useState(props?.config?.showByConfig ? true : false);
  const [showTimeGroupBy] = useState(
    props.config.dateTime.showTimeGroupBy ? true : false
  );
  const [timeGroupBy] = useState(props.config.dateTime.timeGroupBy);
  const [hasCompare] = useState(
    showByConfig ? props.config.compareMode : false
  );

  const {
    isDatePickerOpen,
    setIsDatePickerOpen,
    isTouched,
    setIsTouched,
    dateRangeError,
    selectedDates: contextSelectedDates,
    defaultDates: contextDefaultDates,
    setSelectedDates: contextSetSelectedDates,
    setDefaultDates: contextSetDefaultDates,
    selectedOptions: contextSelectedOptions,
    setSelectedOptions: contextSetSelectedOptions,
  } = useContext(GlobalContext);

  const [selectedDates, setSelectedDates] = useState(() => {
    if (showByConfig) {
      return [props.config.dateTime.startDate, props.config.dateTime.endDate];
    } else {
      return contextSelectedDates;
    }
  });

  const [defaultDates, setDefaultDates] = useState(() => {
    if (showByConfig) {
      return [
        moment(props.config.dateTime.startDate, "DD/MM/YYYY"),
        moment(props.config.dateTime.endDate, "DD/MM/YYYY"),
      ];
    } else {
      return contextDefaultDates;
    }
  });

  const [selectedOptions, setSelectedOptions] = useState(() => {
    if (showByConfig) {
      switch (props.config.dateTime.defaultGroupBy) {
        case "DATE": {
          return "date";
        }
        case "WEEK": {
          return "week";
        }
        case "MONTH": {
          return "month";
        }
        case "QUARTER": {
          return "quarter";
        }
        case "YEAR": {
          return "year";
        }
        default: {
          return "date";
        }
      }
    } else {
      return contextSelectedOptions;
    }
  });

  useEffect(() => {
    contextSetSelectedOptions(selectedOptions);
  }, [selectedOptions]);

  useEffect(() => {
    contextSetDefaultDates(defaultDates);
  }, [defaultDates]);

  useEffect(() => {
    contextSetSelectedDates(selectedDates);
  }, [selectedDates]);

  const disabledPeriods = current => {
    let period;
    switch (selectedOptions) {
      case "date":
        period = current && current > moment().endOf("day");
        break;
      case "month":
        period = current && current > moment().endOf("month");
        break;
      case "week":
        period = current && current > moment().endOf("week");
        break;
      case "quarter":
        period = current && current > moment().endOf("quarter");
        break;
      case "year":
        period = current && current > moment().endOf("year");
        break;
      default:
        break;
    }
    return period;
  };

  const handleDate = useCallback(
    (value, dateStrings) => {
      setIsTouched(true);
      if (selectedOptions === "date") {
        setSelectedDates([
          formatDate(dateStrings?.[0]),
          formatDate(dateStrings?.[1]),
        ]);
        setDefaultDates([moment(dateStrings?.[0]), moment(dateStrings?.[1])]);
      } else if (selectedOptions === "week") {
        setSelectedDates([
          formatDate(moment(value?.[0]).startOf("weeks")),
          formatDate(moment(value?.[1]).endOf("weeks")),
        ]);
        setDefaultDates([
          moment(value?.[0]).startOf("weeks"),
          moment(value?.[1]).endOf("weeks"),
        ]);
      } else if (selectedOptions === "quarter") {
        let sdate = moment(value?.[0]);
        let edate = moment(value?.[1]).add(2, "months").endOf("months");
        setSelectedDates([formatDate(sdate), formatDate(edate)]);
        setDefaultDates([sdate, edate]);
      } else if (selectedOptions === "year") {
        setSelectedDates([
          formatDate(dateStrings?.[0]),
          formatDate(moment(dateStrings?.[1]).endOf("year")),
        ]);
        setDefaultDates([
          moment(dateStrings?.[0]),
          moment(dateStrings?.[1]).endOf("year"),
        ]);
      } else if (selectedOptions === "month") {
        setSelectedDates([
          formatDate(dateStrings?.[0]),
          formatDate(moment(dateStrings?.[1]).endOf("months")),
        ]);
        setDefaultDates([
          moment(dateStrings?.[0]),
          moment(dateStrings?.[1]).endOf("months"),
        ]);
      }
    },
    [selectedDates, selectedOptions]
  );

  const handleOpenPop = open => {
    setIsDatePickerOpen(open);
  };

  const handleSalesDates = () => {
    let salesDates = [];
    if (isDatePickerOpen === "" || isDatePickerOpen === true) {
      salesDates = defaultDates;
    }
    if (isDatePickerOpen === false) {
      salesDates = defaultDates;
    }
    return salesDates;
  };

  return (
    <Row>
      <>
        <Col>
          <h4>Date Range</h4>
          <GroupBySelection
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            showTimeGroupBy={showTimeGroupBy}
            timeGroupBy={timeGroupBy}
            hasCompare={hasCompare}
            showByConfig={showByConfig}
          />
        </Col>
        <Col className="pl-3">
          <h4>Start Date</h4>
          <DatePicker
            picker={selectedOptions}
            value={handleSalesDates[0]}
            // disabledDate={disabledStartYear}
            onChange={(value, dateString) =>
              handleDate(value, dateString, "startYear")
            }
            allowClear={false}
          />
        </Col>

        <Col className="pl-3">
          <h4>End Date</h4>
          <DatePicker
            picker={selectedOptions}
            value={handleSalesDates[1]}
            popupClassName="month-picker"
            onChange={(value, dateString) =>
              handleDate(value, dateString, "endMonth")
            }
            allowClear={false}
          />
        </Col>
        <Col className="pl-3" style={{ paddingTop: "29px" }}>
          <Button
            onClick={handleDate}
            icon={<SearchOutlined />}
            // disabled={(multiDates.startMonth && multiDates.startYear && multiDates.endYear) ? false : true}
          >
            Search
          </Button>
        </Col>
        {/* <Row>
                <Col className="mr-5">
                    <GroupBySelection 
                        selectedOptions={selectedOptions}
                        setSelectedOptions={setSelectedOptions}
                        showTimeGroupBy={showTimeGroupBy}
                        timeGroupBy={timeGroupBy}
                        hasCompare={hasCompare}
                        showByConfig={showByConfig}
                    />
                </Col>
                <Col >
                    <RangePicker
                        picker={selectedOptions}
                        disabledDate={disabledPeriods}
                        value={handleSalesDates}
                        onOpenChange={handleOpenPop}
                        onChange={handleDate}
                        allowClear={false}
                    />
                    <div>
                        <div className="mt-2">
                            <div style={{ color: "red" }}>
                                {dateRangeError
                                    ? "Date range must be within 12 months"
                                    : ""}
                            </div>
                        </div>
                    </div>
                </Col>
            </Row> */}
      </>
    </Row>
  );
};
export default SwitchableDatePicker;
