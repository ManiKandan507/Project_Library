import React, { useEffect, useState, createRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Select, DatePicker, Space, Spin } from "antd";
import { requestNewMembers } from "../../appRedux/actions/Reporting";
import { stringToColour as stc } from "../../helpers/common";
import CustomResponsiveBarCanvas from "../Reporting/Common/ResponsiveBarCanvas";
import ChartHeader from "./Common/ChartHeader";

import moment from "moment";
import { DEFAULT_DATE } from "../../constants";
const { RangePicker } = DatePicker;
const { Option } = Select;
const NewMembers = (props) => {
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(true);
  const chartRef = createRef();
  const [newMembersFetched, setNewMembersFetched] = useState(false);
  const newMembers = useSelector(
    (state) => state.reporting.newMembers.data
  );
  const memberLoading = useSelector(
    (state) => state.reporting.loading
  ) || false;
  const [startDate, setStartDate] = useState(moment().subtract(30, "days"));
  const [endDate, setEndDate] = useState(moment());

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
    useState(newMembers);
  const [pageTotal, setPageTotal] = useState("");

  function handleGroupChange(groupIDs) {
    if (groupIDs.length > 0) {
      setSelectedGroups(groupIDs);
      setNewMembersFetched(false);
      setLoader(true);
    }
  }

  function handleDateChange(dates) {
    if (dates) {
      setStartDate(dates[0]);
      setEndDate(dates[1]);
      setNewMembersFetched(false);
      setLoader(true);
    }
  }

  function generateOptions() {
    return Object.keys(allGroupMap).map((groupId) => {
      return <Option key={groupId}>{allGroupMap[groupId]}</Option>;
    });
  }

  useEffect(() => {
    if (newMembers) {
      let totalMembers = 0;
      let filteredData = newMembers.map((memberGroup) => {
        totalMembers += memberGroup["CountPerGroup"];
        memberGroup["color"] = stc(memberGroup.GroupName);
        return memberGroup;
      });
      setPageTotal(`Total Members: ${totalMembers}`);
      setFilteredBarChartData(filteredData);
      setLoader(false);
      setNewMembersFetched(true);
    }
  }, [newMembers]);

  useEffect(() => {
    if (!newMembersFetched) {
      dispatch(
        requestNewMembers({
          sourceHex: props.sourceHex,
          groupid: selectedGroups,
          start_date: moment(startDate).format("DD/MM/YYYY"),
          end_date: moment(endDate).format("DD/MM/YYYY"),
        })
      );
    }
  }, [newMembersFetched]);

  return (
    <div>
      <CustomResponsiveBarCanvas
        loader={loader}
        data={filteredBarChartData}
        axisLeft={{
          legend: "Membership Renewed"
        }}
        sourceHex={props.sourceHex}
        memberLoading={memberLoading}
        screen={props.screen}
        payload={{ start_date: moment(startDate).format(DEFAULT_DATE), end_date: moment(endDate).format(DEFAULT_DATE) }}
        appdir={props.appdir}
        chartHeaderData={{
          select: {
            loading: loader,
            defaultValue: selectedGroups,
            dataSource: allGroupMap,
            onChange: handleGroupChange
          },
          datePicker: {
            showRangePicker: true,
            defaultValue: [startDate, endDate],
            onChange: handleDateChange
          },
          downloadChart: {
            fileName: { name: "new-members", startDate: startDate, endDate: endDate }
          },
          pageTotal
        }}
      />
    </div>
  );

};

export default NewMembers;
