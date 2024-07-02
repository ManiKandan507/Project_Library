import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Select, Spin } from "antd";
import _map from 'lodash/map';
import { requestCurrentMembers } from "../../appRedux/actions/Reporting";
import { stringToColour as stc } from "../../helpers/common";
import CustomResponsiveBarCanvas from "../Reporting/Common/ResponsiveBarCanvas";

const { Option } = Select;
const CurrentMembers = (props) => {
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(true);
  const [currentMembersFetched, setCurrentMembersFetched] = useState(false);
  const currentMembers = useSelector((state) => state.reporting.currentMembers.data);
  const memberLoading = useSelector((state) => state.reporting.loading) || false;
  const [selectedGroups, setSelectedGroups] = useState(props.groupsid.map((o) => o['groupid'].toString()));
  const [allGroupMap, setAllGroupMap] = useState(props.groupsid.reduce((obj, item) => Object.assign(obj, { [item.groupid]: item.groupname }), {}));
  const [filteredBarChartData, setFilteredBarChartData] = useState(currentMembers);
  const [pageTotal, setPageTotal] = useState("");
  function handleGroupChange(groupIDs) {
    if (groupIDs.length > 0) {
      setSelectedGroups(groupIDs);
      setCurrentMembersFetched(false);
      setLoader(true);
    }
  }

  useEffect(() => {
    if (currentMembers) {
      let totalMembers = 0;
      let filteredData = currentMembers.map((memberGroup) => {
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
      dispatch(requestCurrentMembers({ appdir: props.appdir, sourceHex: props.sourceHex, groupid: selectedGroups }));
    }
  }, [currentMembersFetched]);
  return (
    <div>
      <CustomResponsiveBarCanvas
        loader={loader}
        data={filteredBarChartData}
        axisLeft={{ tickPadding: 2 }}
        memberLoading={memberLoading}
        sourceHex={props.sourceHex}
        screen={props.screen}
        appdir={props.appdir}
        chartHeaderData={{
          select: {
            loading: loader,
            defaultValue: selectedGroups,
            dataSource: allGroupMap,
            onChange: handleGroupChange
          },
          downloadChart: {
            fileName: { name: "current-members", startDate: new Date() }
          },
          pageTotal,
        }}
      />
    </div>
  );
};

export default CurrentMembers;
