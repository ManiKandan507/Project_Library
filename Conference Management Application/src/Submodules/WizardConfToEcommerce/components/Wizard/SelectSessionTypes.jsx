import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  TreeSelect,
  Spin,
  message,
  Alert,
  Table,
  Divider,
  Tooltip,
} from "antd";
import {
  FileImageOutlined,
  FileOutlined,
  FilePdfOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import {
  requestNextStep,
  requestPreviousStep,
  requestSessionTypes,
  requestAllSessions,
  requestStoreSelectedSessionTypes,
  requestAbstracts,
  requestAllSessionsDetails,
} from "../../appRedux/actions/Wizard";
import "./custom.css";
import { isEmpty } from "lodash";
const { SHOW_CHILD } = TreeSelect;
const SelectSessionTypes = props => {
  const dispatch = useDispatch();

  const sessionTypes = useSelector(
    state => state.wizard.select_session_types.session_types
  );
  const allSessions = useSelector(
    state => state.wizard.select_session_types.all_sessions
  );

  // const allSessionsDetails = useSelector(
  //   state => state.wizard.select_session_types.all_sessions_details
  // );

  const [treeData, setTreeData] = useState([]);
  const stateConfig = useSelector(state => state.wizard.config);

  const session_types_fetched = useSelector(
    state => state.wizard.select_session_types.session_types_fetched
  );
  const all_sessions_fetched = useSelector(
    state => state.wizard.select_session_types.all_sessions_fetched
  );
  // const all_sessions_details_fetched = useSelector(
  //   state => state.wizard.select_session_types.all_sessions_details_fetched
  // );

  const conference = stateConfig.conference;
  // const [fetchingSessionDetails, setFetchingSessionDetails] = useState(false);
  const [fetchingSessionTypes, setFetchingSessionTypes] = useState(false);
  const [fetchingAllSessions, setFetchingAllSessions] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState(
    stateConfig.session_list?.length > 0
      ? stateConfig.session_list.map(session => session.SessionID)
      : []
  );

  const [sessionContentMap, setSessionContentMap] = useState({});
  const columns = [
    {
      title: "Name",
      dataIndex: "title",
      key: "title",
      width: "80%",
      render: (title, row) => {
        if (row.type == "session_type") {
          return <strong>{title}</strong>;
        }
        return title;
      },
    },
    {
      title: "Presentation Contents",
      dataIndex: "content",
      key: "content",
      width: "20%",
      render: (content, row) => {
        //PDF, Video, Image
        if (content) {
          if (row.type == "session") {
            const [counts, names] = content;
            if (counts?.length == 4) {
              // Show only the > 0 counts
              // return (
              //   <p>
              //     <Tooltip title={names[0].join(", ")}>
              //       {counts[0]} <FilePdfOutlined />
              //     </Tooltip>{" "}
              //     <Divider type="vertical" />
              //     <Tooltip title={names[1].join(", ")}>
              //       {counts[1]} <VideoCameraOutlined />
              //     </Tooltip>
              //     <Divider type="vertical" />
              //     <Tooltip title={names[2].join(", ")}>
              //       {counts[2]} <FileImageOutlined />
              //     </Tooltip>
              //   </p>
              // );
              let finalRender = [];
              finalRender.push(
                counts[0] > 0 ? (
                  <>
                    <Tooltip title={names[0].join(", ")}>
                      {counts[0]} <FilePdfOutlined />
                    </Tooltip>
                  </>
                ) : (
                  <></>
                )
              );
              if (
                counts[0] > 0 &&
                (counts[1] > 0 || counts[2] > 0 || counts[3] > 0)
              ) {
                finalRender.push(<Divider type="vertical" />);
              }
              finalRender.push(
                counts[1] > 0 ? (
                  <>
                    <Tooltip title={names[1].join(", ")}>
                      {counts[1]} <VideoCameraOutlined />
                    </Tooltip>
                  </>
                ) : (
                  <></>
                )
              );
              if (counts[1] > 0 && (counts[2] > 0 || counts[3] > 0)) {
                finalRender.push(<Divider type="vertical" />);
              }
              finalRender.push(
                counts[2] > 0 ? (
                  <>
                    <Tooltip title={names[2].join(", ")}>
                      {counts[2]} <FileImageOutlined />
                    </Tooltip>
                  </>
                ) : (
                  <></>
                )
              );
              if (counts[2] > 0 && counts[3] > 0) {
                finalRender.push(<Divider type="vertical" />);
              }
              finalRender.push(
                counts[3] > 0 ? (
                  <>
                    <Tooltip title={names[3].join(", ")}>
                      {counts[3]} <FileOutlined />
                    </Tooltip>
                  </>
                ) : (
                  <></>
                )
              );

              return finalRender;
            }
          } else if (row.type == "session_type") {
            const [counts] = content;
            if (counts?.length == 4) {
              // Show only the > 0 counts
              let finalRender = [];
              finalRender.push(
                counts[0] > 0 ? (
                  <>
                    <FilePdfOutlined />
                  </>
                ) : (
                  <></>
                )
              );
              if (
                counts[0] > 0 &&
                (counts[1] > 0 || counts[2] > 0 || counts[3] > 0)
              ) {
                finalRender.push(<Divider type="vertical" />);
              }
              finalRender.push(
                counts[1] > 0 ? (
                  <>
                    <VideoCameraOutlined />
                  </>
                ) : (
                  <></>
                )
              );
              if (counts[1] > 0 && (counts[2] > 0 || counts[3] > 0)) {
                finalRender.push(<Divider type="vertical" />);
              }
              finalRender.push(
                counts[2] > 0 ? (
                  <>
                    <FileImageOutlined />
                  </>
                ) : (
                  <></>
                )
              );

              if (counts[2] > 0 && counts[3] > 0) {
                finalRender.push(<Divider type="vertical" />);
              }
              finalRender.push(
                counts[3] > 0 ? (
                  <>
                    <FileOutlined />
                  </>
                ) : (
                  <></>
                )
              );
              return finalRender;
            }
          }
        }
        return <></>;
      },
    },
  ];
  useEffect(() => {
    if (conference.ConferenceID) {
      if (!session_types_fetched && !fetchingSessionTypes) {
        //Request session types
        dispatch(
          requestSessionTypes({
            sourceHex: props.sourceHex,
            uuid: props.uuid,
            conferenceId: conference.ConferenceID,
          })
        );
        setFetchingSessionTypes(true);
      }
      if (!all_sessions_fetched && !fetchingAllSessions) {
        //Request all sessions
        dispatch(
          requestAllSessions({
            sourceHex: props.sourceHex,
            uuid: props.uuid,
            conferenceId: conference.ConferenceID,
          })
        );
        setFetchingAllSessions(true);
      }
      // if (!all_sessions_details_fetched && !fetchingSessionDetails) {
      //   //Request all sessions details
      //   dispatch(
      //     requestAllSessionsDetails({
      //       sourceHex: props.sourceHex,
      //       uuid: props.uuid,
      //       conferenceId: conference.ConferenceID,
      //     })
      //   );
      //   //to avoid duplicate API call
      //   setFetchingSessionDetails(true);
      // }
    } else {
      console.error("Conference ID is empty ");
    }
  });

  useEffect(() => {
    // if (all_sessions_details_fetched) {
    //   setFetchingSessionDetails(false);
    // }
    if (session_types_fetched) {
      setFetchingSessionTypes(false);
    }
    if (all_sessions_fetched) {
      setFetchingAllSessions(false);
    }
  }, [
    // all_sessions_details_fetched,
    session_types_fetched,
    all_sessions_fetched,
  ]);

  useEffect(() => {
    if (
      sessionTypes !== {} &&
      allSessions.length > 0
      // &&
      // allSessionsDetails.length > 0
    ) {
      if (isEmpty(sessionContentMap)) {
        let tempMap = {};

        allSessions.forEach(sess => {
          if (tempMap[sess.SessionID]) {
            if (sess.files_array) {
              tempMap[sess.SessionID].push(...sess.files_array);
            }
          } else {
            if (sess.files_array) {
              tempMap[sess.SessionID] = [...sess.files_array];
            } else {
              tempMap[sess.SessionID] = [];
            }
          }
        });

        // allSessionsDetails.forEach(detail => {
        //   let liveObject = [];
        //   if (detail.live_config_object?.session_video_url) {
        //     liveObject.push({
        //       name: "Live Recording",
        //       href: detail.live_config_object.session_video_url,
        //     });
        //   }
        //   if (tempMap[detail.session_id]) {
        //     tempMap[detail.session_id].push(
        //       ...detail.video_links_array,
        //       ...detail.file_links_array,
        //       ...detail.poster_links_array,
        //       ...liveObject
        //     );
        //   } else {
        //     tempMap[detail.session_id] = [
        //       ...detail.video_links_array,
        //       ...detail.file_links_array,
        //       ...detail.poster_links_array,
        //       ...liveObject,
        //     ];
        //   }
        // });

        setSessionContentMap(tempMap);
      } else {
        let intermediateTree = [];
        let finalTree = [];

        let nodeMap = {};
        let sessionTypeContentCount = {};
        //Creating the root nodes
        sessionTypes.session_types.forEach(type => {
          intermediateTree.push({
            title: type.name,
            value: type.id,
            key: type.id,
            type: "session_type",
          });
          nodeMap[type.name] = [];
          sessionTypeContentCount[type.name] = [0, 0, 0, 0]; //PDF, Video, Image, File
        });
        intermediateTree.push({
          title: "Unknown",
          value: -1,
          key: -1,
          type: "session_type",
        });
        nodeMap["Unknown"] = [];
        sessionTypeContentCount["Unknown"] = [0, 0, 0, 0]; //PDF, Video, Image, File
        //Creating the leaf nodes
        allSessions.forEach(session => {
          let contentTypeCount = [0, 0, 0, 0]; //PDF, Video, Image, File
          let contentTypeName = [[], [], [], []]; //PDF, Video, Image, File
          if (session.SessionType !== "" && nodeMap[session.SessionType]) {
            sessionContentMap[session.SessionID]?.forEach(content => {
              [contentTypeCount, contentTypeName] = calculateContentTypeCount(
                contentTypeCount,
                contentTypeName,
                content
              );
            });

            nodeMap[session.SessionType].push({
              title: session.SessionName,
              value: session.SessionID,
              key: session.SessionID,
              type: "session",
              content: [contentTypeCount, contentTypeName],
            });
            sessionTypeContentCount[session.SessionType][0] =
              sessionTypeContentCount[session.SessionType][0] +
              contentTypeCount[0];
            sessionTypeContentCount[session.SessionType][1] =
              sessionTypeContentCount[session.SessionType][1] +
              contentTypeCount[1];
            sessionTypeContentCount[session.SessionType][2] =
              sessionTypeContentCount[session.SessionType][2] +
              contentTypeCount[2];
            sessionTypeContentCount[session.SessionType][3] =
              sessionTypeContentCount[session.SessionType][3] +
              contentTypeCount[3];
          } else {
            sessionContentMap[session.SessionID]?.forEach(content => {
              [contentTypeCount, contentTypeName] = calculateContentTypeCount(
                contentTypeCount,
                contentTypeName,
                content
              );
            });
            nodeMap["Unknown"].push({
              title: session.SessionName,
              value: session.SessionID,
              key: session.SessionID,
              type: "session",
              content: [contentTypeCount, contentTypeName],
            });
            sessionTypeContentCount["Unknown"][0] =
              sessionTypeContentCount["Unknown"][0] + contentTypeCount[0];
            sessionTypeContentCount["Unknown"][1] =
              sessionTypeContentCount["Unknown"][1] + contentTypeCount[1];
            sessionTypeContentCount["Unknown"][2] =
              sessionTypeContentCount["Unknown"][2] + contentTypeCount[2];
            sessionTypeContentCount["Unknown"][3] =
              sessionTypeContentCount["Unknown"][3] + contentTypeCount[3];
          }
        });

        intermediateTree.forEach(node => {
          finalTree.push({
            title: node.title,
            key: node.key,
            value: node.value,
            children: nodeMap[node.title],
            type: node.type,
            content: [sessionTypeContentCount[node.title]],
          });
        });
        setTreeData(finalTree);
      }
    }
  }, [
    sessionTypes,
    allSessions,
    //  allSessionsDetails,
    sessionContentMap,
  ]);

  const calculateContentTypeCount = (
    oldContentTypeCount,
    olContentTypeName,
    content
  ) => {
    const extension = content.href.split(".").pop().toLowerCase();
    let contentTypeCount = oldContentTypeCount;
    let contentTypeName = olContentTypeName;
    if (extension === "pdf") {
      contentTypeCount[0] = oldContentTypeCount[0] + 1;
      if (content.name) contentTypeName[0].push(content.name);
    } else if (extension === "mp4") {
      contentTypeCount[1] = oldContentTypeCount[1] + 1;
      if (content.name) contentTypeName[1].push(content.name);
    } else if (
      extension === "png" ||
      extension === "jpg" ||
      extension === "jpeg" ||
      extension === "svg" ||
      extension === "webp"
    ) {
      contentTypeCount[2] = oldContentTypeCount[2] + 1;
      if (content.name) contentTypeName[2].push(content.name);
    } else {
      // console.log("Unknown extension", extension);
      contentTypeCount[3] = oldContentTypeCount[3] + 1;
      if (content.name) contentTypeName[3].push(content.name);
    }
    return [contentTypeCount, contentTypeName];
  };
  const submitSelectSessionTypes = () => {
    if (selectedSessions.length === 0) {
      message.error("Please select at least 1 session");
      return;
    }
    let finalSessions = [];
    allSessions.forEach(session => {
      if (selectedSessions.includes(session.SessionID)) {
        finalSessions.push(session);
      }
    });
    //TODO:IMPORTANT: Multiple dispatch method causing the next component re-rendering multiple times
    //store the selected sessions
    dispatch(requestStoreSelectedSessionTypes(finalSessions));

    const sessionIDs = finalSessions.map(session => session.SessionID);
    dispatch(
      requestAbstracts({
        sourceHex: props.sourceHex,
        sessionIDs: sessionIDs,
      })
    );

    dispatch(requestNextStep());
  };
  const previousStep = () => {
    dispatch(requestPreviousStep());
  };

  // const onChange = value => {
  //   setSelectedSessions(value);
  // };

  // rowSelection objects indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      let leafKeys = [];
      selectedRows.forEach(row => {
        if (row.type === "session") {
          leafKeys.push(row.value);
        }
      });

      setSelectedSessions(leafKeys);
    },
  };
  return session_types_fetched && all_sessions_fetched ? (
    // &&
    // all_sessions_details_fetched
    <div style={{ display: "flex", flexDirection: "column", padding: "2%" }}>
      <div>
        {allSessions.length === 0 ? (
          <Alert
            message="No Sessions Found"
            description="Please select another event"
            type="error"
            showIcon
            style={{ marginRight: "5%", marginLeft: "5%" }}
          />
        ) : (
          <>
            <Alert
              message="Select sessions for migration"
              description="Please select the sessions you would like to migrate into your store as products."
              type="info"
              showIcon
              style={{ margin: "0 5%", width: "90%" }}
            />
            {/* <TreeSelect
              treeCheckable={true}
              value={selectedSessions}
              onChange={onChange}
              treeData={treeData}
              showCheckedStrategy={SHOW_CHILD}
              placeholder="Please select sessions to migrate"
              style={{ margin: "0 5%", marginTop: "2%", width: "70%" }}
              allowClear={true}
              maxTagCount={5}
            /> */}
            <Alert
              message="Click checkbox on header column to Select All sessions "
              banner
              style={{ margin: "0 5%", marginTop: "2%", width: "90%" }}
            />
            <Table
              columns={columns}
              rowSelection={{
                ...rowSelection,
                selectedRowKeys: selectedSessions,
                checkStrictly: false,
              }}
              dataSource={treeData}
              pagination={false}
              style={{ margin: "0 5%", width: "90%" }}
            />
          </>
        )}
      </div>
      <br />
      <div>
        <Button
          type="primary"
          style={{ float: "right", marginRight: "15%" }}
          onClick={() => submitSelectSessionTypes()}
        >
          Next
        </Button>
        <Button
          style={{ float: "right", marginRight: "2%" }}
          onClick={() => previousStep()}
        >
          Previous
        </Button>
      </div>
    </div>
  ) : (
    <div>
      <Spin
        size="large"
        style={{
          marginTop: "5%",
          marginLeft: "50%",
        }}
      />
    </div>
  );
};

export default SelectSessionTypes;
