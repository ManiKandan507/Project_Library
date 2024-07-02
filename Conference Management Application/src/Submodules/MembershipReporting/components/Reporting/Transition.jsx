import React, { useEffect, useState, createRef, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Select, DatePicker, Spin, Button, Typography, Alert, Table, Space } from "antd";
import { ResponsiveSankey } from "@nivo/sankey";
import {
  requestMemberTransition,
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
import CustomTableTransition from "./Common/CustomTableTransition";
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
  NOMEMBERSHIP,
} from "../../constants";
import ChartHeader from "./Common/ChartHeader";

const { Option } = Select;
const Transition = props => {
  const sourceHex = props.sourceHex;
  const screen = props.screen;
  const exportTableRef = useRef();
  const [loader, setLoader] = useState(true);
  const chartRef = createRef();
  const [memberTransitionFetched, setMemberTransitionFetched] = useState(false);
  const Transition = useSelector(state => state.reporting.transition);
  const modalVisible =
    useSelector(({ reporting }) => reporting.showModal) || false;
  const [startDate, setStartDate] = useState(moment().subtract(1, "years"));
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
      break;
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
    let matchedGroupInfo = Transition?.tableDataUUIDs[data.groupname] || [];
  
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



  const handleNestedMemberClick = (data, key, groupName) => {
   
    let matchedGroupInfo = Transition?.tableDataUUIDs[data.groupname] || [];


    if (matchedGroupInfo[key][`${groupName}`]?.length > 0) {
      setSelectedItem({
        ...data,
        UUIDs: matchedGroupInfo[key][`${groupName}`],
        groupTitle: data.groupname,
        value: matchedGroupInfo[key][`${groupName}`].length,
        isTable: true,
        selectedValue: HASH_DATA[key],
      });
      dispatch(showModal(false));
      dispatch(
        getMemberDetailsRequest({
          screen,
          sourceHex,
          uuids: matchedGroupInfo[key][`${groupName}`].slice(0, PAGE_SIZE),
        })
      );
    }
  };
  const DownloadNestedMemberInfo = ({ data, keyVal, groupName }) => {
    return Number(data[keyVal][`${groupName}`]) ? (
      <Button type="link" onClick={() => handleNestedMemberClick(data, keyVal, groupName)}>
        {currencyFormatter(data[keyVal][`${groupName}`], false)}
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
      title: HASH_DATA[TRANSITIONED_OUT],
      label: HASH_DATA[TRANSITIONED_OUT],
      dataIndex: TRANSITIONED_OUT,
      key: TRANSITIONED_OUT,
      render: (_, data) => (
        <DownloadMemberInfo data={data} keyVal={TRANSITIONED_OUT} />
      ),
    },
    {
      title: HASH_DATA[NOMEMBERSHIP],
      label: HASH_DATA[NOMEMBERSHIP],
      dataIndex: NOMEMBERSHIP,
      key: NOMEMBERSHIP,
      render: (_, data) => <DownloadMemberInfo data={data} keyVal={NOMEMBERSHIP} />,
    },
  ];

  function handleGroupChange(groupIDs) {
    if (groupIDs > 0) {
      setSelectedGroups([groupIDs]);
      setMemberTransitionFetched(false);
      setLoader(true);
    }
  }

  function handleDateChange(dates) {
    if (dates) {
      setStartDate(dates[0].set({ date: 1, month: 0 }));
      setEndDate(dates[1].set({date: 31, month: 11}));
      setMemberTransitionFetched(false);
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
    if (Transition) {
      setMemberTransitionFetched(true);
      setLoader(false);
      
      let finalMemberData = [];
      //transform the dict to list
      let totalBeginning = 0;
      let totalEnd = 0;
      if (Transition.tableData) {
        finalMemberData = _map(
          Transition.tableData,
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
  }, [Transition]);
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
    if (!memberTransitionFetched) {
      dispatch(
        requestMemberTransition({
          sourceHex: sourceHex,
          groupid: selectedGroups,
          start_date: moment(startDate).get("year"),
          end_date: moment(endDate).get("year"),
        })
      );
    }
  });
const expandedRowRender = (record) => {
  const columnsTransitionIn = [
    {
      title: '',
      dataIndex: 'group_name',
      key: 'group_name',
      render: text => (
        <div className="text-left">
          {text}
        </div>
      ),
    },
    {
      title: '',
      dataIndex: 'members',
      key: 'members',
      // render: (text, data) => {
      //   console.log("text, data columnsTransitionIn",text, data);
      //   return <DownloadNestedMemberInfo data={data.parentRow} keyVal={'transitioned_in_details'} groupName={data.group_name} />;
      // },
    },
  ];


  const columnsTransitionOut = [
    {
      title: '',
      dataIndex: 'group_name',
      key: 'group_name',
      render: text => (
        <div className="text-left">
          {text}
        </div>
      ),
    },
    {
      title: '',
      dataIndex: 'members',
      key: 'members',
      // render: (text, data) => {
      //   console.log("text, data columnsTransitionOut",text, data);
      //   return <DownloadMemberInfo data={data} keyVal={'members'} nestedTableKey={"transitioned_out_details"}  groupData={data} />;
      // },
    },
  ];


  let transitionInData = []
  for (const key in record.transitioned_in_details){
    if(record.transitioned_in_details[key]>0){
      transitionInData.push({
          group_name: `${key}`,
          members: record.transitioned_in_details[key],
          parentRow: record
        })
    }
  }


  let transitionOutData =[]
  
  for (const key in record.transitioned_out_details){
    if(record.transitioned_out_details[key] > 0){

      transitionOutData.push({
        group_name: `${key}`,
        members: record.transitioned_out_details[key],
        parentRow: record
      })
    }
    }

  return (
    <div style={{ display:"flex", justifyContent: 'space-between',  paddingLeft:"5%", paddingRight:"5%", }}>
       <div style={{ flex: '1', marginRight: '1%' }}>
      {transitionInData.length > 0 && (
        <>
          <Alert message= {<> Transitioned Into <strong>{`${record.groupname} (${record.transitionedinto})`} </strong> </>} type="success" />
          <Table
            columns={columnsTransitionIn}
            size={"small"}
            dataSource={transitionInData}
            pagination={false}
          />
          <br />
        </>
      )}
      </div>
       <div style={{ flex: '1', marginRight: '1%' }}>
      {transitionOutData.length > 0 && (
        <>
          <Alert message={<> Transitioned Out of <strong>{`${record.groupname} (${record.transitionedout})`} </strong> </>} type="error" />
          <Table
            columns={columnsTransitionOut}
            size={"small"}
            dataSource={transitionOutData}
            pagination={false}
          />
          <br />
        </>
      )}
       </div>
      {transitionOutData.length == 0 &&transitionInData.length == 0 && (<p>Nothing to show here</p>) }
    </div>
  );
}
  return (
    <div>
      <Alert type="info" showIcon message={<p> Compare members who bought membership in single year with the membership type of those users in a future year.<br />
Excludes new members. In order to be considered as transitioning, you must have been a member at the time of the first period</p>} />
<br />
      <ChartHeader
        select={{
          loading: loader,
          defaultValue: selectedGroups,
          dataSource: allGroupMap,
          onChange: handleGroupChange,
        }}
        allowMultiSelect= {false}
        datePicker={{
          showRangePicker: true,
          showYearPicker: true,
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
          {(!Transition.nodes.length && !Transition.links.length) ? (
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
                  data={Transition}
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
              <CustomTableTransition
                exportCsv={true}
                scroll={{ x: 768, y: 500 }}
                columns={columns}
                fileName={{ name: "transition", startDate, endDate }}
                tableData={memberTableData}
                selectedItem={selectedItem}
                handleMemberInfo={(e, size) => handleMemberInfo(e, size)}
                exportCsvInfo={{
                  className: "my-0 ml-4",
                  handleMemberDataExport: (e) => setDownloadCsv(e),
                  fileName: { name: "transition", startDate, endDate },
                  memberData: dataSource,
                  handleExportCsv: downloadCsv,
                  screen: props.screen,
                  exportTableRef: exportTableRef,
                  headers: columns
                }}
                expandRowRender = {{expandedRowRender}}
                rowKey={"groupname"}
              />
            </Spin>
          )}
        </div>
      )}
      {showMemberModal && (
        <MembersInfoModal
          fileName={{ name: "transition", startDate, endDate }}
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
export default Transition;
