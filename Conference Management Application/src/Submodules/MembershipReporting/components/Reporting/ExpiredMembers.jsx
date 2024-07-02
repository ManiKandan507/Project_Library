import React, { useEffect, useState, createRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Select, DatePicker, Space, Spin } from "antd";
import { requestExpiredMembers } from "../../appRedux/actions/Reporting";
import { stringToColour as stc } from "../../helpers/common";
import CustomResponsiveBarCanvas from "../Reporting/Common/ResponsiveBarCanvas";
import ChartHeader from "./Common/ChartHeader";

import moment from "moment";
import { DEFAULT_DATE } from "../../constants";
// const { RangePicker } = DatePicker;
const { Option } = Select;
const ExpiredMembers = (props) => {
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(true);
  const [expiredMembersFetched, setExpiredMembersFetched] = useState(false);
  const [pageTotal, setPageTotal] = useState("");
  const expiredMembers = useSelector(
    (state) => state.reporting.expiredMembers.data
  );
  const memberLoading = useSelector(
    (state) => state.reporting.loading
  ) || false;

  // const [startDate, setStartDate] = useState(moment().subtract(30, "days"));
  const [asOfDate, setAsOfDate] = useState(moment());

  const [selectedGroups, setSelectedGroups] = useState(() => {
    let defaultSelectedGroups = [];
    for (const group in props.groupsid) {
      defaultSelectedGroups.push(props.groupsid[group].groupid.toString());
    }
    return defaultSelectedGroups;
  });
  const [allGroupMap, setAllGroupMap] = useState(() => {
    let groupDict = {};
    for (const group in props.groupsid) {
      groupDict[props.groupsid[group].groupid] =
        props.groupsid[group].groupname;
    }
    return groupDict;
  });
  const [filteredBarChartData, setFilteredBarChartData] =
    useState(expiredMembers);

  function handleGroupChange(groupIDs) {
    if (groupIDs.length > 0) {
      setSelectedGroups(groupIDs);
      setExpiredMembersFetched(false);
      setLoader(true);
    }
  }

  function handleDateChange(dates) {
    if (dates) {
      setAsOfDate(dates);
      setExpiredMembersFetched(false);
      setLoader(true);
    }
  }

  function generateOptions() {
    return Object.keys(allGroupMap).map((groupId) => {
      return <Option key={groupId}>{allGroupMap[groupId]}</Option>;
    });
  }

  useEffect(() => {
    if (expiredMembers) {
      let totalMembers = 0;
      let filteredData = expiredMembers.map((memberGroup) => {
        totalMembers += memberGroup["CountPerGroup"];
        memberGroup["color"] = stc(memberGroup.GroupName);
        return memberGroup;
      });
      setPageTotal(`Total Members: ${totalMembers}`);
      setFilteredBarChartData(filteredData);
      setLoader(false);
      setExpiredMembersFetched(true);
    }
  }, [expiredMembers]);

  useEffect(() => {
    if (!expiredMembersFetched) {
      dispatch(
        requestExpiredMembers({
          sourceHex: props.sourceHex,
          groupid: selectedGroups,
          expiry_as_of: moment(asOfDate).format("DD/MM/YYYY"),
          // end_date: moment(endDate).format("DD/MM/YYYY"),
        })
      );
    }
  }, [expiredMembersFetched]);

  return (
    <div>
      <CustomResponsiveBarCanvas
        loader={loader}
        data={filteredBarChartData}
        axisLeft={{
          legend: "Membership Expired"
        }}
        sourceHex={props.sourceHex}
        memberLoading={memberLoading}
        screen={props.screen}
        payload={{ expiry_as_of: moment().format(DEFAULT_DATE) }}
        appdir={props.appdir}
        chartHeaderData={{
          select: {
            loading: loader,
            defaultValue: selectedGroups,
            dataSource: allGroupMap,
            onChange: handleGroupChange
          },
          datePicker: {
            showDatePicker: false,
            defaultValue: asOfDate,
            onChange: handleDateChange
          },
          downloadChart: {
            fileName: { name: "expired-members", startDate: asOfDate }
          },
          pageTotal
        }}
      />
    </div>
  );
};

export default ExpiredMembers;
