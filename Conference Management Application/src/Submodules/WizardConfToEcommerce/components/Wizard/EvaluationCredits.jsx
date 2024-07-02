import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Spin,
  Table,
  Switch,
  Alert,
  Result,
  Form,
  Input,
  Popconfirm,
  InputNumber,
  Typography,
  Checkbox,
} from "antd";
import {
  requestNextStep,
  requestPreviousStep,
  requestGetCreditDetails,
  requestGetFormDetails,
  requestStoreCredits,
  requestStoreEvaluationSessions,
} from "../../appRedux/actions/Wizard";
import "./custom.css";
import _ from "lodash";

const EvaluationCredits = props => {
  const dispatch = useDispatch();
  const stateConfig = useSelector(state => state.wizard.config);
  const conference = stateConfig.conference;
  const stateEvaluationCredit = useSelector(
    state => state.wizard.evaluation_credits
  );
  const credit_details_fetched = useSelector(
    state => state.wizard.evaluation_credits.credit_details_fetched
  );
  const form_details_fetched = useSelector(
    state => state.wizard.evaluation_credits.form_details_fetched
  );

  const [sessionData, setSessionData] = useState([]);

  const [selectedCredits, setSelectedCredits] = useState(() => {
    let finalSelectedCredits = [];
    stateConfig.credits.forEach(credit => {
      finalSelectedCredits.push({
        key: credit.id,
        creditname: credit.label,
        creditvalue: credit.value,
      });
    });
    return finalSelectedCredits;
  });

  const [selectedSessions, setSelectedSessions] = useState(() => {
    let finalSelectedSessions = {};
    stateConfig.evaluations.forEach(evalu => {
      finalSelectedSessions[evalu.SessionID] = evalu;
    });
    return finalSelectedSessions;
  });
  const [selectedEvaluationRowKeys, setSelectedEvaluationRowKeys] = useState(
    selectedSessions
      ? Object.keys(selectedSessions).map(record =>
          parseInt(record) ? parseInt(record) : record
        )
      : []
  );
  const [
    headerIncludeEvaluationCheckState,
    setHeaderIncludeEvaluationCheckState,
  ] = useState(() => {
    let tempIncludeEvaluCheckState = true;
    for (const key in selectedSessions) {
      if (
        selectedSessions[key].showEvaluation &&
        !selectedSessions[key].includeEvaluation
      ) {
        tempIncludeEvaluCheckState = false;
        break;
      }
    }

    return tempIncludeEvaluCheckState;
  });

  const [headerIncludeCreditCheckState, setHeaderIncludeCreditCheckState] =
    useState(() => {
      let tempIncludeCreditCheckState = true;
      for (const key in selectedSessions) {
        if (
          selectedSessions[key].showCredits &&
          !selectedSessions[key].includeCredit
        ) {
          tempIncludeCreditCheckState = false;
          break;
        }
      }

      return tempIncludeCreditCheckState;
    });

  const [
    headerIncludeEvaluationIntermediateState,
    setHeaderIncludeEvaluationIntermediateState,
  ] = useState(() => {
    let tempCheckedEvalCount = 0;
    let tempUncheckedEvalCount = 0;
    for (const key in selectedSessions) {
      if (
        selectedSessions[key].showEvaluation &&
        !selectedSessions[key].includeEvaluation
      ) {
        tempUncheckedEvalCount += 1;
      } else {
        tempCheckedEvalCount += 1;
      }
    }
    if (tempCheckedEvalCount > 0 && tempUncheckedEvalCount > 0) {
      return true;
    } else {
      return false;
    }
  });

  const [
    headerIncludeCreditIntermediateState,
    setHeaderIncludeCreditIntermediateState,
  ] = useState(() => {
    let tempCheckedCreditCount = 0;
    let tempUncheckedCreditCount = 0;
    for (const key in selectedSessions) {
      if (
        selectedSessions[key].showCredits &&
        !selectedSessions[key].includeCredit
      ) {
        tempUncheckedCreditCount += 1;
      } else {
        tempCheckedCreditCount += 1;
      }
    }

    if (tempCheckedCreditCount > 0 && tempUncheckedCreditCount > 0) {
      return true;
    } else {
      return false;
    }
  });

  const [selectedCreditRowKeys, setSelectedCreditRowKeys] = useState(
    selectedCredits.map(record => record.key)
  );

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    const inputNode = inputType === "number" ? <InputNumber /> : <Input />;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  const [creditForm] = Form.useForm();
  const [creditData, setCreditData] = useState([]);
  const [creditEditingKey, setCreditEditingKey] = useState("");

  const isCreditEditing = record => record.key === creditEditingKey;

  const editCreditRecord = record => {
    creditForm.setFieldsValue({
      creditname: "",
      creditvalue: "",
      ...record,
    });
    setCreditEditingKey(record.key);
  };

  const cancelCreditRecord = () => {
    setCreditEditingKey("");
  };
  const [switchStates, setSwitchStates] = useState({});
  const saveCreditRecord = async key => {
    try {
      const row = await creditForm.validateFields();
      const newData = [...creditData];
      const index = newData.findIndex(item => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setCreditData(newData);
        setSelectedCredits(newData);
        setCreditEditingKey("");
      } else {
        newData.push(row);
        setCreditData(newData);
        setSelectedCredits(newData);
        setCreditEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const creditsColumns = [
    // {
    //   title: "Credit Value",
    //   dataIndex: "creditvalue",
    //   width: "10%",
    //   editable: false,
    // },
    {
      title: "Credit Name",
      dataIndex: "creditname",
      width: "70%",
      editable: true,
    },
    {
      title: "Action",
      dataIndex: "operation",
      render: (_, record) => {
        if (selectedCredits.map(credit => credit.key).includes(record.key)) {
          const editable = isCreditEditing(record);
          return editable ? (
            <span>
              <Typography.Link
                onClick={() => saveCreditRecord(record.key)}
                style={{
                  marginRight: 8,
                }}
              >
                Save
              </Typography.Link>
              <Popconfirm
                title="Sure to cancel?"
                onConfirm={cancelCreditRecord}
              >
                <a>Cancel</a>
              </Popconfirm>
            </span>
          ) : (
            <Typography.Link
              disabled={creditEditingKey !== ""}
              onClick={() => editCreditRecord(record)}
            >
              Edit
            </Typography.Link>
          );
        }
        return <>Select to edit</>;
      },
    },
  ];
  const mergedCreditsColumns = creditsColumns.map(col => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: record => ({
        record,
        inputType: "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isCreditEditing(record),
      }),
    };
  });

  const sessionColumns = [
    {
      title: "Session Name",
      dataIndex: "session_name",
      key: "session_name",
    },
    {
      title: () => {
        return (
          <Checkbox
            key="headerIncludeEvaluationCheck"
            onChange={onSelectAllIncludeEvaluation}
            checked={headerIncludeEvaluationCheckState}
            indeterminate={headerIncludeEvaluationIntermediateState}
          >
            Include Evaluation
          </Checkbox>
        );
      },
      key: "include_evaluation",
      render: node => {
        if (node.hasOwnProperty("showEvaluation")) {
          return (
            <Switch
              key={node.key}
              checked={
                selectedSessions[node.key]
                  ? selectedSessions[node.key].includeEvaluation
                  : true
              }
              // defaultChecked={() => {
              //   setSwitchStates({
              //     ...switchStates,
              //     [node.key]: {
              //       ...switchStates[node.key],
              //       evaluation: selectedSessions[node.key]
              //         ? selectedSessions[node.key].includeEvaluation
              //         : true,
              //     },
              //   });
              //   return selectedSessions[node.key]
              //     ? selectedSessions[node.key].includeEvaluation
              //     : true;
              // }}
              disabled={selectedSessions[node.key] ? false : true}
              onChange={(text, event) =>
                onEvaluationFieldCheckChange(text, event, node)
              }
            />
          );
        }
      },
    },
    {
      title: () => {
        return (
          <Checkbox
            key="headerIncludeCreditCheck"
            onChange={onSelectAllIncludeCredit}
            checked={headerIncludeCreditCheckState}
            indeterminate={headerIncludeCreditIntermediateState}
            disabled={
              headerIncludeEvaluationCheckState
                ? false
                : headerIncludeEvaluationIntermediateState
                ? false
                : true
            }
          >
            Include Credits
          </Checkbox>
        );
      },
      key: "include_credits",
      render: node => {
        if (node.hasOwnProperty("showCredits")) {
          return (
            <Switch
              key={node.key}
              checked={
                selectedSessions[node.key]
                  ? selectedSessions[node.key].includeCredit
                  : true
              }
              // defaultChecked={() => {
              //   setSwitchStates({
              //     ...switchStates,
              //     [node.key]: {
              //       ...switchStates[node.key],
              //       credit: selectedSessions[node.key]
              //         ? selectedSessions[node.key].includeCredit
              //         : true,
              //     },
              //   });
              //   return selectedSessions[node.key]
              //     ? selectedSessions[node.key].includeCredit
              //     : true;
              // }}
              // this is dependant on evaluation value -> If evaluation is true then only allow to select credits
              disabled={
                selectedSessions[node.key]
                  ? selectedSessions[node.key].includeEvaluation
                    ? false
                    : true
                  : true
              }
              onChange={(text, event) =>
                onCreditFieldCheckChange(text, event, node)
              }
            />
          );
        }
      },
    },
  ];

  useEffect(() => {
    if (
      conference?.ConferenceID &&
      stateConfig.include_evaluation_credit === "true"
    ) {
      if (!credit_details_fetched) {
        //Request credit details
        dispatch(
          requestGetCreditDetails({
            sourceHex: props.sourceHex,
            conferenceId: conference.ConferenceID,
          })
        );
      }
      if (!form_details_fetched) {
        //Request form details
        dispatch(
          requestGetFormDetails({
            sourceHex: props.sourceHex,
            conferenceId: conference.ConferenceID,
            sessionIDs: stateConfig.session_list.map(
              session => session.SessionID
            ),
          })
        );
      }
    } else {
      console.error("Conference ID is empty ");
    }
  });

  useEffect(() => {
    if (stateEvaluationCredit.credit_details.length > 0) {
      let tempCreditRecord = [];
      let id = 0;
      //If any of the record already been edited, use the new name
      stateEvaluationCredit.credit_details.forEach(credit => {
        let tempCreditName = credit.CreditName;
        selectedCredits.forEach(cre => {
          if (cre.creditvalue == credit.CreditValueNumSelect) {
            tempCreditName = cre.creditname;
          }
        });
        tempCreditRecord.push({
          key: id++,
          creditname: tempCreditName,
          creditvalue: credit.CreditValueNumSelect,
        });
      });
      setCreditData(tempCreditRecord);

      if (selectedCredits.length == 0 && !stateEvaluationCredit.visited) {
        setSelectedCredits(tempCreditRecord);
        setSelectedCreditRowKeys(tempCreditRecord.map(credit => credit.key));
      }
    }
  }, [stateEvaluationCredit.credit_details]);

  useEffect(() => {
    let tempIncludeEvaluCheckState = true;
    let tempCheckedEvalCount = 0;
    let tempUncheckedEvalCount = 0;
    for (const key in selectedSessions) {
      if (
        selectedSessions[key].showEvaluation &&
        !selectedSessions[key].includeEvaluation
      ) {
        tempIncludeEvaluCheckState = false;
        tempUncheckedEvalCount += 1;
      } else {
        tempCheckedEvalCount += 1;
      }
    }

    setHeaderIncludeEvaluationCheckState(tempIncludeEvaluCheckState);
    if (tempCheckedEvalCount > 0 && tempUncheckedEvalCount > 0) {
      setHeaderIncludeEvaluationIntermediateState(true);
    } else {
      setHeaderIncludeEvaluationIntermediateState(false);
    }

    let tempIncludeCreditCheckState = true;
    let tempCheckedCreditCount = 0;
    let tempUncheckedCreditCount = 0;
    for (const key in selectedSessions) {
      if (
        selectedSessions[key].showCredits &&
        !selectedSessions[key].includeCredit
      ) {
        tempIncludeCreditCheckState = false;
        tempUncheckedCreditCount += 1;
      } else {
        tempCheckedCreditCount += 1;
      }
    }

    setHeaderIncludeCreditCheckState(tempIncludeCreditCheckState);
    if (tempCheckedCreditCount > 0 && tempUncheckedCreditCount > 0) {
      setHeaderIncludeCreditIntermediateState(true);
    } else {
      setHeaderIncludeCreditIntermediateState(false);
    }
  }, [selectedSessions]);

  useEffect(() => {
    if (stateEvaluationCredit.form_details.length > 0) {
      let tempFormRecords = [];

      stateEvaluationCredit.form_details.forEach(form => {
        let tempSessionName = "";
        stateConfig.session_list.forEach(session => {
          if (session.SessionID == form.SessionID) {
            tempSessionName = session.SessionName;
          }
        });
        tempFormRecords.push({
          key: form.SessionID,
          session_name: tempSessionName,
          showEvaluation: form.RelatedFormID > 0 ? true : false,
          showCredits: form.CreditValue1 > 0 ? true : false,
          includeEvaluation: selectedSessions[
            parseInt(form.SessionID)
          ]?.hasOwnProperty("includeEvaluation")
            ? selectedSessions[parseInt(form.SessionID)].includeEvaluation
            : true,
          includeCredit: selectedSessions[
            parseInt(form.SessionID)
          ]?.hasOwnProperty("includeCredit")
            ? selectedSessions[parseInt(form.SessionID)].includeCredit
            : true,
        });
      });

      setSessionData(tempFormRecords);

      if (_.isEmpty(selectedSessions) && !stateEvaluationCredit.visited) {
        let tempSelectedSession = {};
        tempFormRecords.forEach(record => {
          tempSelectedSession[record.key] = record;
        });
        setSelectedSessions(tempSelectedSession);
      }
    }
  }, [stateEvaluationCredit.form_details]);

  const onSelectAllIncludeEvaluation = e => {
    let tempSelectedSession = {};
    for (let key in selectedSessions) {
      tempSelectedSession[key] = {
        ...selectedSessions[key],
        includeEvaluation: selectedSessions[key].showEvaluation
          ? e.target.checked
          : selectedSessions[key].includeEvaluation,
      };
    }

    setSelectedSessions(tempSelectedSession);
  };

  const onSelectAllIncludeCredit = e => {
    let tempSelectedSession = {};
    for (let key in selectedSessions) {
      tempSelectedSession[key] = {
        ...selectedSessions[key],
        includeCredit: selectedSessions[key].showCredits
          ? e.target.checked
          : selectedSessions[key].includeCredit,
      };
    }

    setSelectedSessions(tempSelectedSession);
  };

  const onEvaluationFieldCheckChange = (text, event, node) => {
    if (selectedSessions[node.key]) {
      setSelectedSessions({
        ...selectedSessions,
        [node.key]: {
          ...selectedSessions[node.key],
          includeEvaluation: text,
        },
      });
      setSwitchStates({
        ...switchStates,
        [node.key]: {
          ...switchStates[node.key],
          evaluation: text,
        },
      });
    } else {
      console.error("Evaluation switched clicked for unselected row");
    }
  };
  const onCreditFieldCheckChange = (text, event, node) => {
    if (selectedSessions[node.key]) {
      setSelectedSessions({
        ...selectedSessions,
        [node.key]: {
          ...selectedSessions[node.key],
          includeCredit: text,
        },
      });
      setSwitchStates({
        ...switchStates,
        [node.key]: {
          ...switchStates[node.key],
          credit: text,
        },
      });
    } else {
      console.error("Credit switched clicked for unselected row");
    }
  };

  const nextStep = () => {
    let creditDispatchReq = [];
    let evaluationDispatchReq = [];

    for (const key in selectedCredits) {
      creditDispatchReq.push({
        id: selectedCredits[key].key,
        label: selectedCredits[key].creditname,
        value: selectedCredits[key].creditvalue,
      });
    }
    for (const key in selectedSessions) {
      evaluationDispatchReq.push({
        SessionID: key,
        showEvaluation: selectedSessions[key]?.showEvaluation,
        includeEvaluation: selectedSessions[key]?.includeEvaluation ?? false,
        showCredits: selectedSessions[key]?.showCredits,
        includeCredit: selectedSessions[key]?.includeCredit ?? false,
      });
    }
    dispatch(requestStoreCredits(creditDispatchReq));
    dispatch(requestStoreEvaluationSessions(evaluationDispatchReq));
    dispatch(requestNextStep());
  };
  const previousStep = () => {
    dispatch(requestPreviousStep());
  };

  const creditRowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      let tempCreditSelected = [];
      selectedRows.forEach(row => {
        tempCreditSelected.push(row);
      });
      setSelectedCredits(tempCreditSelected);
      setSelectedCreditRowKeys(tempCreditSelected.map(credit => credit.key));
    },
    selectedRowKeys: selectedCreditRowKeys,
  };

  const sessionRowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      let tempSessions = {};
      selectedRows.forEach(row => {
        if (selectedSessions[row.key]) {
          tempSessions[row.key] = {
            ...row,
            includeEvaluation: selectedSessions[row.key].includeEvaluation,
            includeCredit: selectedSessions[row.key].includeCredit,
          };
        } else {
          tempSessions[row.key] = {
            ...row,
            includeEvaluation: switchStates[row.key]?.evaluation ?? false,
            includeCredit: switchStates[row.key]?.credit ?? false,
          };
        }
      });
      setSelectedSessions(tempSessions);

      setSelectedEvaluationRowKeys(
        tempSessions
          ? Object.keys(tempSessions).map(record =>
              parseInt(record) ? parseInt(record) : record
            )
          : []
      );
    },
    selectedRowKeys: selectedEvaluationRowKeys,
  };

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        padding: "2%",
      }}
    >
      {stateConfig.include_evaluation_credit === "true" ? (
        form_details_fetched && credit_details_fetched ? (
          <>
            <div>
              <Form form={creditForm} component={false}>
                <Table
                  title={() => {
                    return (
                      <Alert
                        banner
                        message="Select credits to include in store"
                      ></Alert>
                    );
                  }}
                  components={{
                    body: {
                      cell: EditableCell,
                    },
                  }}
                  size={"small"}
                  showHeader={false}
                  style={{ width: "30%" }}
                  rowSelection={creditRowSelection}
                  dataSource={creditData}
                  columns={mergedCreditsColumns}
                  rowClassName="editable-row"
                  pagination={false}
                />
              </Form>
            </div>
            <br />
            <Table
              // rowSelection={{ ...sessionRowSelection, checkStrictly: false }}
              dataSource={sessionData}
              columns={sessionColumns}
            />
          </>
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
        )
      ) : (
        <div>
          <Result title="You can skip this step as you have selected not to include evaluations and credits." />
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

export default EvaluationCredits;
