import React, { useContext, useEffect, useState } from "react";
import { Button, Switch } from "antd";
import moment from "moment";
import { SalesChartWidget } from "@/MembershipReportingV2/SalesChartWidget";
import GlobalContext from "@/MembershipReportingV2/context/MemberContext";
import { LeftOutlined } from "@ant-design/icons";
import EditGroups from "./common/EditGroups";
import DateRangePickerWidget from "./SalesChartWidget/DateRangePickerWidget/index";
import ChartViewTypes from "./SalesChartWidget/ChartViewTypes";
import MultiSelectWidget from "./common/MultiSelectWidget";

const SalesActivity = props => {
  const [showByConfig] = useState(props?.config?.showByConfig ? true : false);
  const [allowDateChange] = useState(
    props?.config?.dateTime?.allowDateChange ? true : false
  );
  const [dateFormat] = useState(
    props.config?.dateTime?.dateTimeSelectionFormat
  );
  const [configDates] = useState([
    props.config?.dateTime.startDate,
    props.config.dateTime.endDate,
  ]);
  const [compareMode] = useState(props.config?.compareMode);
  const [showChartTypes] = useState(props.config?.showChartTypes);
  const [chartTypes] = useState(props.config?.chartTypes);
  const [timeGroupBy] = useState(props.config?.dateTime?.timeGroupBy);

  const salesDates = props?.config?.dateTime;

  const { groups_array, client_minimum_year_value } = props?.params;

  const [activeTab, setActiveTab] = useState(() => {
    if (showByConfig) {
      if (props.config.defaultChartType === "VOLUME") {
        return "salesByVolume";
      }
      if (props.config.defaultChartType === "REVENUE") {
        return "salesByRevenue";
      }
      if (props.config.defaultChartType === "TABLE") {
        return "reportTable";
      }
    }
    return "salesByVolume";
  });

  useEffect(() => {
    if (showByConfig) {
      if (props.config.defaultChartType === "VOLUME") {
        setActiveTab("salesByVolume")
      }
      if (props.config.defaultChartType === "REVENUE") {
        setActiveTab("salesByRevenue")
      }
      if (props.config.defaultChartType === "TABLE") {
        setActiveTab("reportTable")
      }
    }
  }, [props.config.defaultChartType])

  const [isRangePickerTouched, setIsRangePickerTouched] = useState(false);
  const {
    selectedOptions,
    setSelectedDates,
    setDefaultDates,
    membersGroup,
    setSelectedMembersGroups,
    membersType,
    count,
    handleCount,
    isGroups,
  } = useContext(GlobalContext);

  return (
    <>
      <div className="ml-6 mr-6">
        <div className="d-flex flex-row justify-space-between">
          <div>
            <div className="d-flex flex-row justify-space-between align-baseline" style={{ gap: "15px" }} >
              <h2 className="primary-color" style={{ marginBottom: "0.1rem", marginTop: "0.1rem" }}>
                {props.config.reportLabel}
              </h2>
            </div>
            <p className="mb-0" style={{ fontSize: "13px" }}>
              {props.config.description}
            </p>
          </div>
          <div>{!isGroups && <EditGroups groupsArray={groups_array} />}</div>
        </div>
        {isGroups && (
          <MultiSelectWidget
            groupsArray={groups_array}
            membersGroup={membersGroup}
            setSelectedMembersGroups={setSelectedMembersGroups}
          />
        )}
        {!allowDateChange &&
          salesDates?.startDate !== "" &&
          salesDates?.endDate !== "" && (
            <div className="ml-2 mt-5 mb-2" style={{ fontSize: "15px" }}>
              <strong>
                {moment(salesDates?.startDate, "DD/MM/YYYY").format(
                  "MMM-DD-YYYY"
                )}{" "}
                -{" "}
                {moment(salesDates?.endDate, "DD/MM/YYYY").format(
                  "MMM-DD-YYYY"
                )}
              </strong>
            </div>
          )}
        {allowDateChange && showChartTypes && (
          <div className="mt-5 mb-2">
            <DateRangePickerWidget
              showByConfig={showByConfig}
              dateFormat={dateFormat}
              configDates={configDates}
              compareMode={compareMode}
              minimumYear={client_minimum_year_value}
              timeGroupBy={timeGroupBy}
              props={props}
            />
          </div>
        )}
        <div>
          <ChartViewTypes
            showByConfig={showByConfig}
            showChartTypes={showChartTypes}
            chartTypes={chartTypes}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
        {!props.loading && activeTab === "salesByVolume" && (
          <SalesChartWidget
            {...props}
            type={"TOTAL_MEMBERS"}
            activeTab={activeTab}
            setIsRangePickerTouched={setIsRangePickerTouched}
          />
        )}
        {!props.loading && activeTab === "salesByRevenue" && (
          <SalesChartWidget
            {...props}
            type={"TOTAL_REVENUE"}
            activeTab={activeTab}
            setIsRangePickerTouched={setIsRangePickerTouched}
          />
        )}
        {!props.loading && activeTab === "reportTable" && (
          <SalesChartWidget {...props} type={"REPORT_TABLE"} />
        )}
      </div>
    </>
  );
};

export default SalesActivity;
