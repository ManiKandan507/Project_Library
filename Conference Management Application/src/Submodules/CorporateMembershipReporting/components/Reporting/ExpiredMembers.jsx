import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { requestExpiredMembers } from "../../appRedux/actions/Reporting";
import { stringToColour as stc } from "../../helpers/common";
import CustomResponsiveBarCanvas from "../Reporting/Common/ResponsiveBarCanvas";
import moment from "moment";
import { DEFAULT_DATE } from "../../constants";

const ExpiredMembers = (props) => {
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(true);
  const [expiredMembersFetched, setExpiredMembersFetched] = useState(false);
  const expiredMembers = useSelector((state) => state.reporting.expiredMembers.data);
  const memberLoading = useSelector((state) => state.reporting.loading) || false;
  const [asOfDate, setAsOfDate] = useState(moment());
  const [selectedGroups, setSelectedGroups] = useState(props.groupsid.map((o) => o['groupid'].toString()));
  const [allGroupMap, setAllGroupMap] = useState(props.groupsid.reduce((obj, item) => Object.assign(obj, { [item.groupid]: item.groupname }), {}));
  const [filteredBarChartData, setFilteredBarChartData] = useState(expiredMembers);
  const [pageTotal, setPageTotal] = useState("");

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
          appdir: props.appdir,
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
        axisLeft={{ legend: "Membership Expired" }}
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
            showDatePicker: true,
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
