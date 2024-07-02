import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Alert,
  Table,
  Result,
  Card,
  Space,
  Input,
  Checkbox,
  Tag,
  message,
  Tooltip,
} from "antd";
import {
  requestNextStep,
  requestPreviousStep,
  requestStoreCustomBundles,
  requestUpdateCustomBundleAbstracts,
} from "../../appRedux/actions/Wizard";
import "./custom.css";
import ReactQuill from "react-quill";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import Search from "antd/lib/input/Search";
import { generateRandomString, stringToColour } from "../../helpers/common";
import { DeleteOutlined } from "@ant-design/icons";
import { CSSTransition, Transition } from "react-transition-group";
const _ = require("lodash");

const CreateCustomBundle = props => {
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

  const stateConfig = useSelector(state => state.wizard.config);

  const [sellSession] = useState(
    stateConfig.sell_session === "true" ? true : false
  );
  const [sellAbstract] = useState(
    stateConfig.sell_abstract === "true" ? true : false
  );
  const [createCustomBundle] = useState(
    stateConfig.create_custom_bundle === "true" ? true : false
  );

  const [showCreateBundleForm, setShowCreateBundleForm] = useState(false);

  const [selectedSessions, setSelectedSessions] = useState([]);
  const [selectedBundleName, setSelectedBundleName] = useState("");
  const [selectedBundleDescription, setSelectedBundleDescription] =
    useState("");

  const [doNotCreateProductList, setDoNotCreateProductList] = useState([]);

  const [tableData, setTableData] = useState(() => {
    let tempTableData = [];
    if (stateConfig.custom_bundles.length > 0) {
      stateConfig.custom_bundles.forEach(bundle => {
        const maxTableKey = _.max(tempTableData.map(rec => parseInt(rec.key)));

        tempTableData.push({
          ...bundle,
          key: _.isNumber(maxTableKey) ? maxTableKey + 1 : 0,
        });
      });
    }

    return tempTableData;
  });

  const processAllSessionsData = () => {
    let tempAllSessions = [];

    stateConfig.session_list.forEach(session => {
      let found = false;
      // filtering the currently selected sessions
      for (const sess in selectedSessions) {
        if (selectedSessions[sess].id == session.SessionID) {
          found = true;
          break;
        }
      }
      //filtering the selected session in other bundles
      // if (!found) {
      //   for (const record in tableData) {
      //     for (const sess in tableData[record].sessions) {
      //       if (tableData[record].sessions[sess].id == session.SessionID) {
      //         found = true;
      //       }
      //     }
      //     if (found) {
      //       break;
      //     }
      //   }
      // }

      //Filtering duplicate session from allSessions (edge case)
      if (!found) {
        for (const sess in tempAllSessions) {
          if (parseInt(tempAllSessions[sess].id) == session.SessionID) {
            found = true;
            break;
          }
        }
      }
      // Filter the state sessions
      // if (!found && stateConfig.custom_bundles.length > 0) {
      //   for (const sess in stateConfig.custom_bundles) {
      //     if (
      //       parseInt(stateConfig.custom_bundles[sess].id) == session.SessionID
      //     ) {
      //       found = true;
      //       break;
      //     }
      //   }
      // }

      if (!found) {
        tempAllSessions.push({
          id: `${session.SessionID}`,
          session_name: `${session.SessionName}`,
          session_type: `${
            session.SessionType == "" ? "Unknown" : session.SessionType
          }`,
        });
      }
    });

    return tempAllSessions;
  };

  const [allSessionData, setAllSessionData] = useState(
    processAllSessionsData()
  );
  const customBundleListColumns = [
    {
      title: "Bundle Name",
      dataIndex: "bundle_name",
      key: "bundle_name",
      width: "20%",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "30%",
      render: description => {
        return <div dangerouslySetInnerHTML={{ __html: description }}></div>;
      },
    },
    {
      title: "Sessions",
      dataIndex: "sessions",
      key: "sessions",
      width: "45%",
      render: (sessions, record, index) => {
        let result = [];
        let sessionNames = [];
        sessions?.forEach(session => {
          result.push(
            <Tag color="geekblue" key={session.id}>
              <strong>{session.session_type} :</strong> {session.session_name}
            </Tag>
          );
          sessionNames.push(session.session_name);
        });
        return (
          <Tooltip placement="topLeft" title={sessionNames?.toString()}>
            {result}
          </Tooltip>
        );
      },
      ellipsis: true,
    },
    {
      title: "Action",
      key: "action",
      width: "5%",
      render: (text, record) => (
        <Space size="middle">
          {showCreateBundleForm ? (
            <></>
          ) : (
            <DeleteOutlined
              disabled={showCreateBundleForm ? true : false}
              onClick={() => {
                deleteTableRecord(record);
              }}
            />
          )}
        </Space>
      ),
    },
  ];

  useEffect(() => {
    let tempAllSessions = processAllSessionsData();

    setAllSessionData(tempAllSessions);
  }, [tableData]);

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
  };

  const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    // padding: "1%",
    marginBottom: "2%",

    // change background colour if dragging
    background: isDragging ? "lightgreen" : "white",

    // styles we need to apply on draggables
    ...draggableStyle,
  });
  const getListStyle = (isDraggingOver, isDragging) => ({
    background: isDraggingOver ? "#e6fcff" : "#fafafa",
    padding: "2%",
    width: "30%",
    border: "1px solid lightgrey",
    overflow: "auto",
  });

  const nextStep = () => {
    dispatch(requestStoreCustomBundles(tableData));
    let bundleAbstracts = {};
    tableData.forEach(tableRecord => {
      if (!bundleAbstracts[tableRecord.custom_session_id]) {
        bundleAbstracts[tableRecord.custom_session_id] = [];
      }
      tableRecord.sessions.forEach(session => {
        bundleAbstracts[tableRecord.custom_session_id].push(
          ...stateConfig.abstracts[session.id]
        );
      });
    });

    dispatch(requestUpdateCustomBundleAbstracts(bundleAbstracts));
    dispatch(requestNextStep());
  };
  const previousStep = () => {
    dispatch(requestPreviousStep());
  };
  const handleOnDragEnd = result => {
    const { source, destination } = result;
    // dropped outside the list
    if (!destination) {
      return;
    }
    const sourceID = source.droppableId;
    const destinationID = destination.droppableId;

    if (sourceID === destinationID && sourceID === "selected_session") {
      const items = reorder(selectedSessions, source.index, destination.index);
      const newState = [...items];

      newState[sourceID] = items;
      setSelectedSessions(newState);
    } else if (sourceID === destinationID) {
      //Reorder in all_sessions
      return;
    } else if (
      sourceID === "all_session" &&
      destinationID === "selected_session"
    ) {
      const result = move(
        allSessionData,
        selectedSessions,
        source,
        destination
      );

      const newAllSession = result[sourceID];
      const newSelectedSessions = result[destinationID];

      setAllSessionData(newAllSession);
      setSelectedSessions(newSelectedSessions);
    } else if (
      destinationID === "all_session" &&
      sourceID === "selected_session"
    ) {
      const result = move(
        selectedSessions,
        allSessionData,
        source,
        destination
      );

      const newAllSession = result[destinationID];
      const newSelectedSessions = result[sourceID];

      setAllSessionData(newAllSession);
      setSelectedSessions(newSelectedSessions);
    }
  };

  const handleCreateBundleButtonClick = () => {
    setShowCreateBundleForm(true);
  };

  const saveCustomBundle = () => {
    if (_.isEmpty(selectedBundleName)) {
      message.error("Enter Bundle Name");
      return;
    }
    // else if (_.isEmpty(selectedBundleDescription)) {
    //   message.error("Enter Bundle Description");
    //   return;
    // }
    else if (_.isEmpty(selectedSessions)) {
      message.error("Select atleast 1 session for bundle");
      return;
    }

    const maxTableKey = _.max(tableData.map(rec => parseInt(rec.key)));
    const tempSessions = selectedSessions.map(sess => {
      return {
        ...sess,
        do_not_create_product: doNotCreateProductList.includes(
          parseInt(sess.id)
        )
          ? true
          : false,
      };
    });
    setTableData([
      ...tableData,
      {
        key: _.isNumber(maxTableKey) ? maxTableKey + 1 : 0,
        bundle_name: selectedBundleName,
        description: selectedBundleDescription,
        sessions: tempSessions,
        //Creating a temporary session ID for next steps
        custom_session_id: `bundle_${generateRandomString(5)}`,
        // do_not_create_product: doNotCreateProductList,
      },
    ]);

    setSelectedBundleName("");
    setSelectedBundleDescription("");
    setSelectedSessions([]);
    setDoNotCreateProductList([]);

    setShowCreateBundleForm(false);
  };

  const searchAllSessions = query => {
    if (query) {
      const newAllSessions = allSessionData.filter(session => {
        return session.session_name
          .toLowerCase()
          .includes(query.toLowerCase()) ||
          session.session_type.toLowerCase().includes(query.toLowerCase())
          ? session
          : false;
      });

      setAllSessionData(newAllSessions);
    } else {
      let tempAllSessions = processAllSessionsData();

      setAllSessionData(tempAllSessions);
    }
  };
  const handleDoNotCreateIndividualProduct = event => {
    if (event.target.checked) {
      setDoNotCreateProductList([
        ...doNotCreateProductList,
        parseInt(event.target.id),
      ]);
    } else {
      const updatedList = doNotCreateProductList.filter(id => {
        return id !== parseInt(event.target.id);
      });

      setDoNotCreateProductList(updatedList);
    }
  };

  const deleteTableRecord = record => {
    //Fetch all groupIDs

    setTableData(() => {
      let updatedTableData = [];
      tableData.forEach(tableRecord => {
        if (tableRecord.key !== record.key) {
          updatedTableData.push(tableRecord);
        }
      });
      return updatedTableData;
    });
  };

  const closeCustomBundle = () => {
    setSelectedBundleName("");
    setSelectedBundleDescription("");
    setSelectedSessions([]);
    setDoNotCreateProductList([]);
    setShowCreateBundleForm(false);
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "2%",
      }}
    >
      {sellSession ? (
        createCustomBundle ? (
          <>
            <Alert
              message="Create custom bundles from existing session"
              description="Merge presentations from multiple sessions to create new bundle/session."
              type="info"
              showIcon
              style={{ margin: "0 5%", width: "90%" }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                padding: "2%",
              }}
            >
              {/* Animation for opening the bundle form from top */}
              <CSSTransition
                in={showCreateBundleForm}
                timeout={300}
                classNames="bundleform"
                unmountOnExit
              >
                <Card
                  title="Create custom bundle"
                  style={{
                    flexGrow: 2,
                    margin: "0 2%",
                  }}
                  size="small"
                >
                  <Space direction="vertical">
                    Bundle Name:
                    <Input
                      placeholder="Enter Name"
                      id="bundle_name"
                      onChange={e => {
                        setSelectedBundleName(e.target.value);
                      }}
                    />
                  </Space>
                  <br />
                  <br />
                  <Space direction="vertical">
                    Bundle Description:
                    <ReactQuill
                      theme="snow"
                      style={{ width: "600px" }}
                      onChange={e => {
                        setSelectedBundleDescription(e);
                      }}
                    />
                  </Space>
                  <br />
                  <br />
                  <Card size="small">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        maxHeight: "600px",
                      }}
                    >
                      <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable
                          key={"all_session"}
                          droppableId={"all_session"}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              style={getListStyle(
                                snapshot.isDraggingOver,
                                snapshot.isDragging
                              )}
                              {...provided.droppableProps}
                            >
                              <>
                                <h3 style={{ textAlign: "center" }}>
                                  All sessions
                                </h3>
                                <Search
                                  placeholder="Search sessions"
                                  onSearch={searchAllSessions}
                                  allowClear
                                  style={{ marginBottom: "2%" }}
                                ></Search>

                                {allSessionData.map((item, index) => (
                                  <Draggable
                                    key={item.id}
                                    draggableId={item.id}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={getItemStyle(
                                          snapshot.isDragging,
                                          provided.draggableProps.style
                                        )}
                                      >
                                        <Card
                                          style={{
                                            display: "flex",
                                            justifyContent: "left",
                                          }}
                                          size={"small"}
                                        >
                                          <div>
                                            <Tag
                                              color={stringToColour(
                                                item.session_type.toLowerCase()
                                              )}
                                            >
                                              {item.session_type}
                                            </Tag>
                                            <br />
                                            <strong>{item.session_name}</strong>
                                          </div>
                                        </Card>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </>
                            </div>
                          )}
                        </Droppable>
                        <Droppable
                          key={"selected_session"}
                          droppableId={"selected_session"}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              style={getListStyle(
                                snapshot.isDraggingOver,
                                snapshot.isDragging
                              )}
                              {...provided.droppableProps}
                            >
                              <>
                                <h3 style={{ textAlign: "center" }}>
                                  Selected Sessions
                                </h3>
                                <Alert
                                  type="info"
                                  showIcon
                                  message="Drag sessions here for custom bundle"
                                ></Alert>
                                <br />

                                {selectedSessions.map((item, index) => (
                                  <Draggable
                                    key={item.id}
                                    draggableId={item.id}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={getItemStyle(
                                          snapshot.isDragging,
                                          provided.draggableProps.style
                                        )}
                                      >
                                        <>
                                          <Card
                                            style={{
                                              display: "flex",
                                              justifyContent: "left",
                                            }}
                                            size={"small"}
                                          >
                                            <div>
                                              <Tag
                                                color={stringToColour(
                                                  item.session_type.toLowerCase()
                                                )}
                                              >
                                                {item.session_type}
                                              </Tag>
                                              <br />
                                              <strong>
                                                {item.session_name}
                                              </strong>
                                            </div>
                                          </Card>
                                          <div
                                            style={{
                                              backgroundColor: "#FFF2F0",
                                            }}
                                          >
                                            <Checkbox
                                              id={item.id}
                                              onChange={
                                                handleDoNotCreateIndividualProduct
                                              }
                                              checked={
                                                doNotCreateProductList.includes(
                                                  parseInt(item.id)
                                                )
                                                  ? true
                                                  : false
                                              }
                                            ></Checkbox>
                                            {` Do not create this as an individual product`}
                                          </div>
                                        </>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </>
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>
                  </Card>
                  <br />

                  <Button
                    style={{ float: "right" }}
                    onClick={closeCustomBundle}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    style={{ float: "right", marginRight: "2%" }}
                    onClick={saveCustomBundle}
                  >
                    Save
                  </Button>
                </Card>
              </CSSTransition>

              {showCreateBundleForm ? (
                <></>
              ) : (
                <Button
                  onClick={handleCreateBundleButtonClick}
                  style={{ width: "100%" }}
                >
                  + Create Bundle
                </Button>
              )}
            </div>
            <Table
              columns={customBundleListColumns}
              dataSource={tableData}
              pagination={false}
            />
          </>
        ) : (
          <div>
            <Result title="You can skip this step as you have selected not to create custom bundles." />
          </div>
        )
      ) : (
        <div>
          <Result title="You can skip this step as you have selected not to sell sessions." />
        </div>
      )}
      <br />
      <div>
        <Button
          type="primary"
          style={{ float: "right", marginRight: "15%" }}
          onClick={() => nextStep()}
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
  );
};

export default CreateCustomBundle;
