import React, { useEffect, useState, createRef, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Select, DatePicker, Spin, Button, Typography } from "antd";
import { ResponsiveSankey } from "@nivo/sankey";
import {
  requestExtendedHistory,
  showModal,
  getMemberDetailsRequest,
  handleAllMembersExport,
  sendEmailRequest,
} from "../../appRedux/actions/Reporting";
import { currencyFormatter } from "../../helpers/common";
import moment from "moment";
import _isEmpty from "lodash/isEmpty";
import _map from "lodash/map";
import CustomTable from "./Common/CustomTable";
import NoDataFound from "./Common/NoDataFound";
import MembersInfoModal from "./Common/MembersInfoModal";
import {
  PAGE_SIZE,
  COUNT_AT_BEGINING,
  MEMBERS_ON_ENDDATE,
  NEW_MEMBERS,
  TRANSITIONED_INTO,
  NO_CHANGE,
  EXIT_SOCIETY,
  TRANSITIONED_OUT,
  EXPIRED,
  HASH_DATA,
  GROUP_NAME,
} from "../../constants";
import ChartHeader from "./Common/ChartHeader";

const { Option } = Select;
const Trend = props => {
  const sourceHex = props.sourceHex;
  const screen = props.screen;
  const exportTableRef = useRef();
  const [loader, setLoader] = useState(true);
  const chartRef = createRef();
  const [extendedHistoryFetched, setExtendedHistoryFetched] = useState(false);
  const Trend = useSelector(state => state.reporting.trend);
  const modalVisible =
    useSelector(({ reporting }) => reporting.showModal) || false;
  const [startDate, setStartDate] = useState(moment().subtract(30, "days"));
  const [endDate, setEndDate] = useState(moment());
  const [memberTableData, setMemberTableData] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [downloadCsv, setDownloadCsv] = useState(false)
  const [selectedItem, setSelectedItem] = useState({});
  const [selectedGroups, setSelectedGroups] = useState(() => {
    let defaultSelectedGroups = [];
    for (const group in props.groupsid) {
      defaultSelectedGroups.push(props.groupsid[group].groupid.toString());
    }
    return defaultSelectedGroups;
  });
  const [groupMapForChart, setGroupMapForChart] = useState(() => {
    let groupDict = {};
    for (const group in props.groupsid) {
      groupDict[
        props.groupsid[group].groupname
          .replace(/[^A-Z0-9]/gi, "_")
          .toLowerCase()
      ] = props.groupsid[group].groupname;
    }
    return groupDict;
  });
  const [allGroupMap, setAllGroupMap] = useState(() => {
    let groupDict = {};
    for (const group in props.groupsid) {
      groupDict[props.groupsid[group].groupid] =
        props.groupsid[group].groupname;
    }
    return groupDict;
  });
  const [totalValues, setTotalValues] = useState({ start: 0, end: 0 })
  const membersInfo =
    useSelector(({ reporting }) => reporting.membersInfo?.data) || [];
  const memberLoading = useSelector(state => state.reporting.loading) || false;
  const dispatch = useDispatch();
  const handleMemberClick = (data, key) => {
    let matchedGroupInfo = Trend?.tableDataUUIDs[data.groupname] || [];
    if (matchedGroupInfo[key]?.length > 0) {
      setSelectedItem({
        ...data,
        UUIDs: matchedGroupInfo[key],
        groupTitle: data.groupname,
        value: matchedGroupInfo[key].length,
        isTable: true,
        selectedValue: HASH_DATA[key],
      });
      dispatch(showModal(false));
      dispatch(
        getMemberDetailsRequest({
          screen,
          sourceHex,
          uuids: matchedGroupInfo[key].slice(0, PAGE_SIZE),
        })
      );
    }
  };
  const DownloadMemberInfo = ({ data, keyVal }) => {
    return Number(data[keyVal]) ? (
      <Button type="link" onClick={() => handleMemberClick(data, keyVal)}>
        {currencyFormatter(data[keyVal], false)}
      </Button>
    ) : (
      0
    );
  };
  const columns = [
    {
      label: HASH_DATA[GROUP_NAME],
      title: <div className="text-left">Group Name</div>,
      dataIndex: GROUP_NAME,
      key: GROUP_NAME,
      render: text => (
        <div className="text-left">
          <strong>{text}</strong>
        </div>
      ),
    },
    {
      title: HASH_DATA[COUNT_AT_BEGINING],
      label: HASH_DATA[COUNT_AT_BEGINING],
      dataIndex: COUNT_AT_BEGINING,
      key: COUNT_AT_BEGINING,
      render: (_, data) => (
        <DownloadMemberInfo data={data} keyVal={COUNT_AT_BEGINING} />
      ),
    },
    {
      title: HASH_DATA[MEMBERS_ON_ENDDATE],
      label: HASH_DATA[MEMBERS_ON_ENDDATE],
      dataIndex: MEMBERS_ON_ENDDATE,
      key: MEMBERS_ON_ENDDATE,
      render: (text, data) => {
        return <DownloadMemberInfo data={data} keyVal={MEMBERS_ON_ENDDATE} />;
      },
    },
    {
      title: HASH_DATA[NEW_MEMBERS],
      label: HASH_DATA[NEW_MEMBERS],
      dataIndex: NEW_MEMBERS,
      key: NEW_MEMBERS,
      render: (_, data) => {
        return <DownloadMemberInfo data={data} keyVal={NEW_MEMBERS} />;
      },
    },
    {
      title: HASH_DATA[TRANSITIONED_INTO],
      label: HASH_DATA[TRANSITIONED_INTO],
      dataIndex: TRANSITIONED_INTO,
      key: TRANSITIONED_INTO,
      render: (_, data) => (
        <DownloadMemberInfo data={data} keyVal={TRANSITIONED_INTO} />
      ),
    },
    {
      title: HASH_DATA[NO_CHANGE],
      label: HASH_DATA[NO_CHANGE],
      dataIndex: NO_CHANGE,
      key: NO_CHANGE,
      render: (_, data) => (
        <DownloadMemberInfo data={data} keyVal={NO_CHANGE} />
      ),
    },
    {
      title: HASH_DATA[EXPIRED],
      label: HASH_DATA[EXPIRED],
      dataIndex: EXPIRED,
      key: EXPIRED,
      render: (_, data) => <DownloadMemberInfo data={data} keyVal={EXPIRED} />,
    },
    {
      title: HASH_DATA[TRANSITIONED_OUT],
      label: HASH_DATA[TRANSITIONED_OUT],
      dataIndex: TRANSITIONED_OUT,
      key: TRANSITIONED_OUT,
      render: (_, data) => (
        <DownloadMemberInfo data={data} keyVal={TRANSITIONED_OUT} />
      ),
    },
    {
      title: HASH_DATA[EXIT_SOCIETY],
      label: HASH_DATA[EXIT_SOCIETY],
      dataIndex: EXIT_SOCIETY,
      key: EXIT_SOCIETY,
      render: (_, data) => (
        <DownloadMemberInfo data={data} keyVal={EXIT_SOCIETY} />
      ),
    },
  ];

  function handleGroupChange(groupIDs) {
    if (groupIDs.length > 0) {
      setSelectedGroups(groupIDs);
      setExtendedHistoryFetched(false);
      setLoader(true);
    }
  }

  function handleDateChange(dates) {
    if (dates) {
      setStartDate(dates[0]);
      setEndDate(dates[1]);
      setExtendedHistoryFetched(false);
      setLoader(true);
    }
  }

  function generateOptions() {
    return Object.keys(allGroupMap).map(groupId => {
      return <Option key={groupId}>{allGroupMap[groupId]}</Option>;
    });
  }
  const handleMemberInfo = (val, pageSize) => {
    setMemberTableData(dataSource.slice(val * pageSize - pageSize, val * pageSize))
  }
  const handleClick = val => {
    let icon = "targetLinks" in val || "sourceLinks" in val;
    const { UUIDs, targetLinks, sourceLinks } = val;
    let uuid = [];
    if (!_isEmpty(targetLinks)) {
      uuid = targetLinks.map(data => data.UUIDs);
    } else if (!_isEmpty(sourceLinks)) {
      uuid = sourceLinks.map(data => data.UUIDs);
    } else {
      uuid = UUIDs;
    }
    uuid = [].concat.apply([], uuid);
    if (uuid?.length > 0) {
      setSelectedItem({
        ...val,
        UUIDs: uuid,
        groupTitle: val.source ? val.source.name : val.name,
        isTable: false,
        icon: !icon,
      });
      dispatch(showModal(false));
      dispatch(
        getMemberDetailsRequest({
          screen,
          sourceHex,
          uuids: uuid.slice(0, PAGE_SIZE),
        })
      );
    }
  };

  useEffect(() => {
    if (Trend) {
      setExtendedHistoryFetched(true);
      setLoader(false);
      let tableData = {};
      /**
      for (const linkID in Trend.links) {
        const link = Trend.links[linkID];

        if (link.source.includes("_start")) {
          //if target is same group -> no change
          // if target is exit society -> exit society
          // if target is expired -> expired membership
          // if target any other group with _end then -> Add transitioned Out

          //Create table record in tableData if not exist
          if (!tableData[link.source.split("_start")[0]]) {
            tableData[link.source.split("_start")[0]] = {
              groupname: groupMapForChart[link.source.split("_start")[0]],
              countatbeginning: 0,
              membersonenddate: 0,
              newmembers: 0,
              transitionedinto: 0,
              nochange: 0,
              expired: 0,
              transitionedout: 0,
              exitsociety: 0,
            };
          }

          //Adding the count to countatbegining
          tableData[link.source.split("_start")[0]].countatbeginning =
            parseInt(
              tableData[link.source.split("_start")[0]].countatbeginning
            ) + parseInt(link.value);

          if (link.target.includes("_end")) {
            //Create table record in tableData if not exist
            if (!tableData[link.target.split("_end")[0]]) {
              tableData[link.target.split("_end")[0]] = {
                groupname: groupMapForChart[link.target.split("_end")[0]],
                countatbeginning: 0,
                membersonenddate: 0,
                newmembers: 0,
                transitionedinto: 0,
                nochange: 0,
                expired: 0,
                transitionedout: 0,
                exitsociety: 0,
              };
            }

            //Adding the count to membersatebddate
            tableData[link.target.split("_end")[0]].membersonenddate =
              parseInt(
                tableData[link.target.split("_end")[0]].membersonenddate
              ) + parseInt(link.value);

            //TODO: Verify this logic. Need to handle the case for transitioned_in and transitioned_out EXPIREED,node cases
            if (
              link.source.split("_start")[0] === link.target.split("_end")[0]
            ) {
              //Same group
              tableData[link.source.split("_start")[0]].nochange = link.value;
            } else {
              // Transitioned Out and transitioned In to other group

              tableData[link.source.split("_start")[0]].transitionedout =
                parseInt(
                  tableData[link.source.split("_start")[0]].transitionedout
                ) + parseInt(link.value);

              tableData[link.target.split("_end")[0]].transitionedinto =
                parseInt(
                  tableData[link.target.split("_end")[0]].transitionedinto
                ) + parseInt(link.value);
            }
          } else if (link.target === "expired_membership") {
            //Expired memberships
            tableData[link.source.split("_start")[0]].expired = link.value;
          } else if (link.target === "exit_society") {
            //Exit Society Members
            tableData[link.source.split("_start")[0]].exitsociety = link.value;
          }
        } else if (link.source === "new_members") {
          //New members
          if (link.target.includes("_end")) {
            tableData[link.target.split("_end")[0]].newmembers = link.value;
          }
          //TODO: Find the location of showing new -> expired members and new member -> exit society in table
        } else {
          //TODO: This case should not come as per current link structure or new_members
          console.error("source or target are not groupNames", link);
        }
      }
       */
      let finalMemberData = [];
      //transform the dict to list
      let totalBeginning = 0;
      let totalEnd = 0;
      if (Trend.tableData) {
        finalMemberData = _map(
          Trend.tableData,
          (val, key) => {
            totalBeginning += val[COUNT_AT_BEGINING];
            totalEnd += val[MEMBERS_ON_ENDDATE];
            return val
          }
        )
      }
      setTotalValues({ start: totalBeginning, end: totalEnd });
      setMemberTableData(finalMemberData.slice(0, PAGE_SIZE));
      setDataSource(finalMemberData);
      setSelectedItem({ ...selectedItem, value: finalMemberData.length });
    }
  }, [Trend]);
  useEffect(() => {
    if (modalVisible) {
      setShowMemberModal(modalVisible);
    }
  }, [modalVisible]);
  useEffect(() => {
    if (memberTableData.length > 0 && downloadCsv && exportTableRef.current) {
      setTimeout(() => {
        exportTableRef.current.link.click();
        setDownloadCsv(false)
      }, 20);
    }
  }, [memberTableData, downloadCsv]);
  useEffect(() => {
    if (!extendedHistoryFetched) {
      dispatch(
        requestExtendedHistory({
          sourceHex: sourceHex,
          groupid: selectedGroups,
          start_date: moment(startDate).format("DD/MM/YYYY"),
          end_date: moment(endDate).format("DD/MM/YYYY"),
        })
      );
    }
  });

  return (
    <div>
      <ChartHeader
        select={{
          loading: loader,
          defaultValue: selectedGroups,
          dataSource: allGroupMap,
          onChange: handleGroupChange,
        }}
        datePicker={{
          showRangePicker: true,
          defaultValue: [startDate, endDate],
          onChange: handleDateChange,
        }}
        downloadChart={{
          chartRef: chartRef,
          fileName: { name: "trend", startDate: startDate, endDate: endDate },
          disabled: loader,
        }}
      />
      {loader ? (
        <div style={{ height: 500 }}>
          <Spin
            size="large"
            style={{
              marginTop: "25%",
              marginLeft: "50%",
            }}
          />
        </div>
      ) : (
        <div>
          {(!Trend.nodes.length && !Trend.links.length) ? (
            <NoDataFound />
          ) : (
            <Spin spinning={memberLoading} size="large">
              <div className="d-flex justify-space-between px-2">
                <Typography.Title level={5} className='mb-1 mt-2 d-flex align-center'>
                  <span className="mr-1">
                    Total Members
                    <div style={{ fontSize: '10px' }}>(as on {startDate.format('YYYY-MM-DD')})</div>
                  </span>: {totalValues.start}
                </Typography.Title>
                <Typography.Title level={5} className='mb-1 mt-2 d-flex align-center'>
                  <span className="mr-1">
                    Total Members
                    <div style={{ fontSize: '10px' }}>(as on {endDate.format('YYYY-MM-DD')})</div>
                  </span>: {totalValues.end}
                </Typography.Title>
              </div>
              <div className="lineChart" style={{ height: 600 }} ref={chartRef}>
                <ResponsiveSankey
                  data={Trend}
                  onClick={handleClick}
                  sort="input"
                  margin={{ top: 40, right: 180, bottom: 40, left: 180 }}
                  align="justify"
                  height="600"
                  colors={node => node.color}
                  nodeTooltip={node => (
                    <b>
                      {node.name} : {node.value}
                    </b>
                  )}
                  nodeOpacity={1}
                  nodeThickness={15}
                  nodeInnerPadding={3}
                  nodeSpacing={30}
                  nodeBorderWidth={1}
                  nodeBorderColor={{
                    from: "color",
                    modifiers: [["darker", 0.8]],
                  }}
                  linkOpacity={0.5}
                  linkHoverOthersOpacity={0.1}
                  enableLinkGradient={true}
                  label={node => {
                    if (node.id.includes("_start")) {
                      let finalNodeString = "";
                      for (const groupid in selectedGroups) {
                        if (
                          allGroupMap[selectedGroups[groupid]].localeCompare(
                            groupMapForChart[node.id.split("_start")[0]]
                          ) === 0
                        ) {
                          finalNodeString = `${node.name} (${currencyFormatter(
                            node.value,
                            false
                          )})`;
                          break;
                        }
                      }
                      return finalNodeString ? finalNodeString : `${node.name}`;
                    } else if (node.id.includes("_end")) {
                      let finalNodeString = "";
                      for (const groupid in selectedGroups) {
                        if (
                          allGroupMap[selectedGroups[groupid]].localeCompare(
                            groupMapForChart[node.id.split("_end")[0]]
                          ) === 0
                        ) {
                          finalNodeString = `${node.name} (${currencyFormatter(
                            node.value,
                            false
                          )})`;
                          break;
                        }
                      }
                      return finalNodeString ? finalNodeString : `${node.name}`;
                    } else {
                      return `${node.name} (${currencyFormatter(
                        node.value,
                        false
                      )})`;
                    }
                  }}
                  labelPosition="outside"
                  labelOrientation="horizontal"
                  labelPadding={5}
                  labelTextColor={{ from: "color", modifiers: [["darker", 1]] }}
                />
              </div>
              <CustomTable
                exportCsv={true}
                scroll={{ x: 768, y: 370 }}
                columns={columns}
                fileName={{ name: "trends", startDate, endDate }}
                tableData={memberTableData}
                selectedItem={selectedItem}
                handleMemberInfo={(e, size) => handleMemberInfo(e, size)}
                exportCsvInfo={{
                  className: "my-0 ml-4",
                  handleMemberDataExport: (e) => setDownloadCsv(e),
                  fileName: { name: "trends", startDate, endDate },
                  memberData: dataSource,
                  handleExportCsv: downloadCsv,
                  screen: props.screen,
                  exportTableRef: exportTableRef,
                  headers: columns
                }}
              />
            </Spin>
          )}
        </div>
      )}
      {showMemberModal && (
        <MembersInfoModal
          fileName={{ name: "trends", startDate, endDate }}
          selectedItem={selectedItem}
          appdir={props.appdir}
          screen={screen}
          sourceHex={sourceHex}
          membersInfo={membersInfo}
          handleClose={() => {
            dispatch(handleAllMembersExport(false));
            dispatch(sendEmailRequest(false));
            dispatch(showModal(false));
            setShowMemberModal(false);
          }}
          visible={showMemberModal}
        />
      )}
    </div>
  );
};
export default Trend;
