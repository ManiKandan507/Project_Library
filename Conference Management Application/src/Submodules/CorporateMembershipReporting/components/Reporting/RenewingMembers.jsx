import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { requestRenewingMembers } from "../../appRedux/actions/Reporting";
import { stringToColour as stc } from "../../helpers/common";
import CustomResponsiveBarCanvas from "../Reporting/Common/ResponsiveBarCanvas";
import moment from "moment";
import { DEFAULT_DATE } from "../../constants";

const RenewingMembers = (props) => {
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(true);
  const [renewingMembersFetched, setRenewingMembersFetched] = useState(false);
  const renewingMembers = useSelector((state) => state.reporting.renewingMembers.data);
  const memberLoading = useSelector((state) => state.reporting.loading) || false;
  const [startDate, setStartDate] = useState(moment().subtract(30, "days"));
  const [endDate, setEndDate] = useState(moment());
  const [selectedGroups, setSelectedGroups] = useState(props.groupsid.map((o) => o['groupid'].toString()));
  const [allGroupMap, setAllGroupMap] = useState(props.groupsid.reduce((obj, item) => Object.assign(obj, { [item.groupid]: item.groupname }), {}));
  const [filteredBarChartData, setFilteredBarChartData] = useState(renewingMembers);
  const [pageTotal, setPageTotal] = useState("");

  function handleGroupChange(groupIDs) {
    if (groupIDs.length > 0) {
      setSelectedGroups(groupIDs);
      setRenewingMembersFetched(false);
      setLoader(true);
    }
  }

  function handleDateChange(dates) {
    if (dates) {
      setStartDate(dates[0]);
      setEndDate(dates[1]);
      setRenewingMembersFetched(false);
      setLoader(true);
    }
  }

  useEffect(() => {
    if (renewingMembers) {
      let totalMembers = 0;
      let filteredData = renewingMembers.map((memberGroup) => {
        totalMembers += memberGroup["CountPerGroup"];
        memberGroup["color"] = stc(memberGroup.GroupName);
        return memberGroup;
      });
      setFilteredBarChartData(filteredData);
      setPageTotal(`Total Members: ${totalMembers}`);
      setLoader(false);
      setRenewingMembersFetched(true);
    }
  }, [renewingMembers]);

  useEffect(() => {
    if (!renewingMembersFetched) {
      dispatch(
        requestRenewingMembers({
          sourceHex: props.sourceHex,
          appdir: props.appdir,
          groupid: selectedGroups,
          start_date: moment(startDate).format("DD/MM/YYYY"),
          end_date: moment(endDate).format("DD/MM/YYYY"),
        })
      );
    }
  }, [renewingMembersFetched]);

  return (
    <div>
      <CustomResponsiveBarCanvas
        loader={loader}
        data={filteredBarChartData}
        downloadChartName={{ name: "renewing-members", startDate: startDate, endDate: endDate }}
        axisLeft={{ legend: "Membership Renewed", }}
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
            fileName: { name: "renewing-members", startDate: startDate, endDate: endDate }
          },
          pageTotal
        }}
      />
    </div>
  );
};

export default RenewingMembers;
