import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Spin, Table, Switch, Alert } from "antd";
import {
  requestNextStep,
  requestPreviousStep,
  requestAbstractModules,
  requestAbstractFields,
  requestStoreAbstractFields,
} from "../../appRedux/actions/Wizard";
import "./custom.css";
import _ from "lodash";

const AbstractFields = props => {
  const dispatch = useDispatch();
  const stateConfig = useSelector(state => state.wizard.config);
  const conference = stateConfig.conference;

  const abstract_modules_fetched = useSelector(
    state => state.wizard.abstract_fields.abstract_modules_fetched
  );
  const abstract_fields_fetched = useSelector(
    state => state.wizard.abstract_fields.abstract_fields_fetched
  );

  const [selectedFields, setSelectedFields] = useState(() => {
    let finalSelectedFields = {};
    stateConfig.abstract_fields.forEach(record => {
      finalSelectedFields[record.fieldid] = record;
    });
    return finalSelectedFields;
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState(
    selectedFields
      ? Object.keys(selectedFields).map(record =>
          parseInt(record) ? parseInt(record) : record
        )
      : []
  );

  const abstractModules = useSelector(
    state => state.wizard.abstract_fields.abstract_modules
  );
  const abstractFields = useSelector(
    state => state.wizard.abstract_fields.abstract_fields
  );

  const [treeData, setTreeData] = useState([]);
  const headerDescription = (
    <p>
      Please select the fields that you want to display in your LMS.
      <br />
      Click the checkbox on the left to display the fields in the platform
      <br />
      Toggle the button under Display Label if you want the field label to be
      shown above the field.
    </p>
  );
  const columns = [
    {
      title: "Submission Field",
      dataIndex: "fieldModuleName",
      key: "fieldModuleName",
      render: node => {
        const modules = abstractModules.map(module => module.Eventname);
        return modules.includes(node) ? <strong>{node}</strong> : node;
      },
    },
    {
      title: "Display Label",
      key: "displayLabel",
      render: node => {
        if (node.hasOwnProperty("displayLabel")) {
          return (
            <Switch
              key={node.key}
              defaultChecked={() => {
                return selectedFields[node.key]
                  ? selectedFields[node.key].displayLabel
                  : node.displayLabel;
              }}
              disabled={selectedFields[node.key] ? false : true}
              onChange={(text, event) => onFieldCheckChange(text, event, node)}
            />
          );
        }
      },
    },
  ];

  useEffect(() => {
    if (conference.ConferenceID) {
      if (!abstract_modules_fetched) {
        //Request abstract Modules
        dispatch(
          requestAbstractModules({
            sourceHex: props.sourceHex,
            conferenceId: conference.ConferenceID,
          })
        );
      }
    } else {
      console.error("Conference ID is empty ");
    }
  });

  useEffect(() => {
    if (!abstract_fields_fetched && abstract_modules_fetched) {
      //Request abstract fields
      let confIds = abstractModules.map(module => module.ConfID);

      dispatch(
        requestAbstractFields({
          sourceHex: props.sourceHex,
          confIds: confIds,
        })
      );
    }
  }, [abstract_modules_fetched]);

  useEffect(() => {
    if (abstract_fields_fetched && abstract_modules_fetched) {
      if (abstractModules.length > 0 && abstractFields.length > 0) {
        let intermediateTree = [];
        let finalTree = [];
        let defaultSelectedRowKeys = [];
        let defaultSelectedFields = {};
        let nodeMap = {};

        //Creating the root nodes
        abstractModules.forEach(module => {
          intermediateTree.push({
            fieldModuleName: module.Eventname,
            key: `module-${module.ConfID}`,
          });
          nodeMap[module.ConfID] = [];
        });

        //Creating the leaf nodes
        abstractFields.forEach(field => {
          if (field.Field_definition == "Title") {
            return false;
          }
          const displayLabelValue = selectedFields[field.FieldID]
            ? selectedFields[field.FieldID["displayLabel"]]
            : //Taking the default value from API
            field.PublicProgramFieldLabelDisplay == 0
            ? false
            : true;
          nodeMap[field.ConfID].push({
            fieldModuleName: field.Fieldlabel,
            displayLabel: displayLabelValue,
            key: field.FieldID,
          });
          if (
            field.Public_field === 1 ||
            field.Public_AfterPresented === 1 ||
            field.Public_WithAccess === 1 ||
            field.Public_WithAccessAfterPresented === 1
          ) {
            //These will be used only for initial load to set the values according to the API
            defaultSelectedFields[field.FieldID] = {
              fieldid: field.FieldID,
              displayLabel: displayLabelValue,
            };
            defaultSelectedRowKeys.push(field.FieldID);
          }
        });
        if (_.isEmpty(selectedFields)) {
          //Show default checked fields as this is the initial load of the page
          setSelectedFields(defaultSelectedFields);
          setSelectedRowKeys(defaultSelectedRowKeys);
        }
        intermediateTree.forEach(node => {
          finalTree.push({
            fieldModuleName: node.fieldModuleName,
            key: node.key,
            children: nodeMap[node.key.split("module-")[1]],
          });
        });

        setTreeData(finalTree);
      }
    }
  }, [abstractModules, abstractFields]);

  const nextStep = () => {
    let dispatchReq = [];
    for (const key in selectedFields) {
      dispatchReq.push(selectedFields[key]);
    }
    dispatch(requestStoreAbstractFields(dispatchReq));
    dispatch(requestNextStep());
  };
  const previousStep = () => {
    dispatch(requestPreviousStep());
  };

  const onFieldCheckChange = (text, event, node) => {
    //This node will not have the modules row event as switch is not visible for module row records
    // This event will not get triggered for unchecked records
    // let newObject = {};
    // newObject[node["key"]] = { fieldid: node.key, displayLabel: text };

    if (selectedFields[node.key]) {
      setSelectedFields({
        ...selectedFields,
        [node.key]: {
          ...selectedFields[node.key],
          displayLabel: text,
        },
      });
    } else {
      console.error("Display Label switched clicked for unselected row");
    }
  };

  // rowSelection objects indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      let finalSelected = {};
      selectedRows.forEach(row => {
        //Exclude the abstract module nodes
        if (String(row.key).includes("module-")) return;
        //Retaining the switch state when the row is selected/unselected
        if (selectedFields[row.key]) {
          finalSelected[row.key] = {
            fieldid: row.key,
            displayLabel: selectedFields[row.key].displayLabel,
          };
        } else {
          finalSelected[row.key] = {
            fieldid: row.key,
            displayLabel: row?.displayLabel,
          };
        }

        setSelectedRowKeys(
          Object.keys(finalSelected).map(record =>
            parseInt(record) ? parseInt(record) : record
          )
        );
        setSelectedFields(finalSelected);
      });
    },
    selectedRowKeys: selectedRowKeys,
  };

  return abstract_modules_fetched && abstract_fields_fetched ? (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "2%",
      }}
    >
      <div>
        <Alert message={headerDescription} type="info" showIcon />
        <br />
      </div>
      <div>
        <Table
          columns={columns}
          rowSelection={{ ...rowSelection, checkStrictly: false }}
          dataSource={treeData}
        />
      </div>
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

export default AbstractFields;
