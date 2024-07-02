import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Select, Spin } from "antd";
import { requestCurrentMembers } from "../../appRedux/actions/Reporting";
import { stringToColour as stc } from "../../helpers/common";
import CustomResponsiveBarCanvas from "../Reporting/Common/ResponsiveBarCanvas";
import ChartHeader from "./Common/ChartHeader";
import moment from "moment";
import { DEFAULT_DATE } from "../../constants";

const { Option } = Select;
const CurrentMembers = props => {
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(true);
  const [currentMembersFetched, setCurrentMembersFetched] = useState(false);
  const [pageTotal, setPageTotal] = useState("");
  const [asOfDate, setAsOfDate] = useState(moment());
  const currentMembers = useSelector(
    state => state.reporting.currentMembers.data
  );
  const memberLoading = useSelector(state => state.reporting.loading) || false;
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
    useState(currentMembers);

  function handleGroupChange(groupIDs) {
    if (groupIDs.length > 0) {
      setSelectedGroups(groupIDs);
      setCurrentMembersFetched(false);
      setLoader(true);
    }
  }

  function handleDateChange(dates) {
    if (dates) {
      setAsOfDate(dates);
      setCurrentMembersFetched(false);
      setLoader(true);
    }
  }

  function generateOptions() {
    return Object.keys(allGroupMap).map(groupId => {
      return <Option key={groupId}>{allGroupMap[groupId]}</Option>;
    });
  }
  useEffect(() => {
    if (currentMembers) {
      let totalMembers = 0;
      let filteredData = currentMembers.map(memberGroup => {
        totalMembers += memberGroup["CountPerGroup"];
        memberGroup["color"] = stc(memberGroup.GroupName);
        return memberGroup;
      });
      setPageTotal(`Total Members: ${totalMembers}`);
      setFilteredBarChartData(filteredData);
      setLoader(false);
      setCurrentMembersFetched(true);
    }
  }, [currentMembers]);

  useEffect(() => {
    if (!currentMembersFetched) {
      dispatch(
        requestCurrentMembers({
          sourceHex: props.sourceHex,
          groupid: selectedGroups,
          as_of: moment(asOfDate).format("DD/MM/YYYY"),
        })
      );
    }
  }, [currentMembersFetched]);

  return (
    <div>
      <CustomResponsiveBarCanvas
        loader={loader}
        data={filteredBarChartData}
        axisLeft={{
          tickPadding: 2,
        }}
        memberLoading={memberLoading}
        sourceHex={props.sourceHex}
        screen={props.screen}
        payload={{ as_of: moment().format(DEFAULT_DATE) }}
        appdir={props.appdir}
        chartHeaderData={{
          select: {
            loading: loader,
            defaultValue: selectedGroups,
            dataSource: allGroupMap,
            onChange: handleGroupChange,
          },
          datePicker: {
            showDatePicker: false,
            defaultValue: asOfDate,
            onChange: handleDateChange,
          },
          downloadChart: {
            fileName: { name: "current-members", startDate: asOfDate },
          },
          pageTotal,
        }}
      />
    </div>
  );
};

export default CurrentMembers;
