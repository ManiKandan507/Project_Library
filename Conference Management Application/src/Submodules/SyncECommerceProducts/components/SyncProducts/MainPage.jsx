/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Spin,
  Alert,
  Radio,
  Table,
  Switch,
  Form,
  message,
  Descriptions,
} from "antd";
import {
  requestProductDetails,
  requestAbstractFields,
  requestAbstractModules,
  requestProductDescendants,
  requestToWizardConfig,
  requestMainProductDetails,
} from "../../appRedux/actions/SyncECommerceProducts";
import "./custom.css";
import _, { isEmpty } from "lodash";
import SyncProduct from "./SyncProduct";
import { detectProductType } from "../../helpers/common";
import { LoadingOutlined } from "@ant-design/icons";

const MainPage = props => {
  const dispatch = useDispatch();
  const [conferenceForm] = Form.useForm();
  const main_product_details_fetched = useSelector(
    state => state.sync_products.main_product_details_fetched
  );
  const [processSync, setProcessSync] = useState(false);
  const main_product_details = useSelector(
    state => state.sync_products.main_product_details
  );
  const children_product_details_fetched = useSelector(
    state => state.sync_products.children_product_details_fetched
  );
  const children_product_details = useSelector(
    state => state.sync_products.children_product_details
  );
  const [showChildrenProductProgress, setShowChildrenProductProgress] =
    useState(false);
  const abstract_modules_fetched = useSelector(
    state => state.sync_products.abstract_modules_fetched
  );
  const abstract_fields_fetched = useSelector(
    state => state.sync_products.abstract_fields_fetched
  );
  const product_descendants = useSelector(
    state => state.sync_products.product_descendants
  );
  const product_descendants_fetched = useSelector(
    state => state.sync_products.product_descendants_fetched
  );
  //Flag to control the fetching of the children product config for config keys retention
  const [fetchChildrenProductConfig, setFetchChildrenProductConfig] = useState(false);
  const wizard_config_fetched = useSelector(
    state => state.sync_products.wizard_config_fetched
  );

  const wizard_config = useSelector(state => state.sync_products.wizard_config);

  const is_wizard_loading = useSelector(
    state => state.sync_products.wizard_config_loading
  );
  const [syncableChildren, setSyncableChildren] = useState(0);
  const [conferenceID, setConferenceID] = useState(null);

  const [selectedFields, setSelectedFields] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const abstractModules = useSelector(
    state => state.sync_products.abstract_modules
  );
  const abstractFields = useSelector(
    state => state.sync_products.abstract_fields
  );
  const [treeData, setTreeData] = useState([]);

  const [syncChildren, setSyncChildren] = useState(false);
  const [copyTags, setCopyTags] = useState(true);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
              // defaultChecked={() => {
              //   return selectedFields[node.key]
              //     ? selectedFields[node.key].displayLabel
              //     : node.displayLabel;
              // }}
              defaultChecked={() => {
                return wizard_config?.config?.abstract_fields?.length
                  ? wizard_config?.config.abstract_fields.some(
                      field => field.displayLabel && node.key === field.fieldid
                    )
                  : selectedFields[node.key]
                  ? selectedFields[node.key].displayLabel
                  : node.displayLabel;
              }}
              // disabled={selectedFields[node.key] ? false : true}
              disabled={
                wizard_config?.config?.abstract_fields?.length
                  ? wizard_config?.config.abstract_fields.some(
                      field => field.displayLabel && node.key === field.fieldid
                    )
                    ? false
                    : true
                  : selectedFields[node.key]
                  ? false
                  : true
              }
              onChange={(text, event) => onFieldCheckChange(text, event, node)}
            />
          );
        }
      },
    },
  ];

  useEffect(() => {
    if (wizard_config?.config?.abstract_tag === "true") {
      conferenceForm.setFieldValue(
        "copy_tags",
        wizard_config?.config?.abstract_tag
      );
    }
  }, [wizard_config?.config?.abstract_tag]);

  useEffect(() => {
    if (props.productID) {
      if (!main_product_details_fetched) {
        dispatch(
          requestMainProductDetails({
            sourceHex: props.sourceHex,
            productID: props.productID,
          })
        );
      }
    } else {
      setErrorMessage("Cannot find the Product ID");
      setShowError(true);
    }
  }, []);

  useEffect(() => {
    if (syncChildren && !product_descendants_fetched) {
      dispatch(
        requestProductDescendants({
          sourceHex: props.sourceHex,
          productID: props.productID,
        })
      );
    }
  }, [syncChildren]);

  useEffect(() => {
    if (fetchChildrenProductConfig && syncChildren && product_descendants.length > 0) {
      //request all product descendants details
      const allDescendants = product_descendants.map(p => p.productID);
      setShowChildrenProductProgress(true);
      dispatch(
        requestProductDetails({
          sourceHex: props.sourceHex,
          productIDs: allDescendants,
        })
      );
    }
  }, [syncChildren, product_descendants]);

  useEffect(() => {
    if (fetchChildrenProductConfig && 
      (children_product_details_fetched ||
      !isEmpty(children_product_details))
    ) {
      setShowChildrenProductProgress(false);
    }
  }, [children_product_details, children_product_details_fetched]);
  useEffect(() => {
    if (product_descendants.length > 0) {
      let count = 0;
      product_descendants.forEach(record => {
        if (
          // record.productID != props.productID &&
          record.productType != "unknown"
        ) {
          count += 1;
        }
      });
      setSyncableChildren(count);
    }
  }, [product_descendants]);

  useEffect(() => {
    if (main_product_details_fetched) {
      if (!isEmpty(main_product_details)) {
        if (!abstract_modules_fetched) {
          let confID = "";
          const productType = detectProductType(
            main_product_details.ConfigJSON
          );
          if (productType == "unknown") {
            setErrorMessage(
              "Can't Sync product as it has been manually imported"
            );
            setShowError(true);
            return;
          }
          const configJSON = JSON.parse(main_product_details.ConfigJSON);
          if (configJSON.conferenceid || configJSON.ConferenceID) {
            setConferenceID(configJSON.conferenceid ?? configJSON.ConferenceID);
            confID = configJSON.conferenceid ?? configJSON.ConferenceID;
          } else if (
            configJSON.merged &&
            (configJSON.merged[0].conferenceid ||
              configJSON.merged[0].ConferenceID)
          ) {
            //This is a bundle and it. The "merged" array will have session's configs it is made of
            setConferenceID(
              configJSON.merged[0].conferenceid ??
              configJSON.merged[0].ConferenceID
            );
            confID =
              configJSON.merged[0].conferenceid ??
              configJSON.merged[0].ConferenceID;
          } else {
            setErrorMessage("Can't find Conference details in product");
            setShowError(true);
            return;
          }
          //Request abstract Modules
          dispatch(
            requestAbstractModules({
              sourceHex: props.sourceHex,
              conferenceId: confID,
            })
          );
        }
      } else {
        setErrorMessage("Can't find product details");
        setShowError(true);
      }
    }
  }, [main_product_details_fetched]);

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
    if (!isEmpty(main_product_details) && !wizard_config_fetched) {
      // const configJSON = JSON?.parse(main_product_details?.ConfigJSON);

      dispatch(
        requestToWizardConfig({
          sourceHex: props.sourceHex,
          conferenceId: main_product_details.ConferenceID,
        })
      );
    }
  }, [main_product_details_fetched, wizard_config_fetched]);

  useEffect(() => {
    if (
      abstract_fields_fetched &&
      abstract_modules_fetched &&
      wizard_config_fetched
    ) {
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
          if (wizard_config?.config?.abstract_fields?.length) {
            if (
              wizard_config.config.abstract_fields.some(
                data => data.fieldid === field?.FieldID
              )
            ) {
              defaultSelectedRowKeys.push(field);
            }
          } else if (
            field.Public_field === 1 ||
            field.Public_AfterPresented === 1 ||
            field.Public_WithAccess === 1 ||
            field.Public_WithAccessAfterPresented === 1
          ) {
            defaultSelectedRowKeys.push(field);
          }
        });

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
            // defaultSelectedRowKeys.push(field.FieldID);
          }
        });
        if (_.isEmpty(selectedFields)) {
          //Show default checked fields as this is the initial load of the page
          setSelectedFields(defaultSelectedFields);
          setSelectedRowKeys(defaultSelectedRowKeys?.map(item => item.FieldID));
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
  }, [abstractModules, abstractFields, wizard_config, wizard_config_fetched]);

  const abstractTagChangeHandler = e => {
    if (e) {
      setCopyTags(e.target.value === "true" ? true : false);
    }
  };

  const syncChildrenChangeHandler = e => {
    if (e) {
      setSyncChildren(e.target.value === "true" ? true : false);
    }
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

  const onProcessSyncClickHandler = () => {
    if (syncChildren && !product_descendants_fetched) {
      message.error("Wait till the children details get loaded");
      return;
    }
    if (syncChildren && syncableChildren == 0) {
      message.error("Cannot sync product as these are manually imported");
      return;
    }
    if (
      !syncChildren &&
      detectProductType(main_product_details.ConfigJSON) == "conference"
    ) {
      message.error(
        "Cannot sync Conference product as there's nothing to sync."
      );
      return;
    }
    if (fetchChildrenProductConfig && syncChildren && !children_product_details_fetched) {
      message.error(
        "Please wait till the children details get loaded before syncing"
      );
      return;
    }
    setProcessSync(true);
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
  return processSync ? (
    <SyncProduct
      sourceHex={props.sourceHex}
      appdir={props.appdir}
      uuid={props.uuid}
      productID={props.productID}
      copyTags={copyTags}
      syncChildren={syncChildren}
      abstractFields={selectedFields}
      conferenceID={conferenceID}
      fetchChildrenProductConfig={fetchChildrenProductConfig}
    ></SyncProduct>
  ) : (
    <>
      <br />
      {showError ? (
        <>
          <Alert
            message={errorMessage}
            type="error"
            showIcon
            style={{ marginRight: "5%", marginLeft: "5%" }}
          />
        </>
      ) : (
        <></>
      )}

      {showChildrenProductProgress ? (
        <>
          <Alert
            message={"Loading children product details (may take few minutes)..."}
            type="info"
            showIcon
            icon={<LoadingOutlined />}
            style={{ marginRight: "1%", marginLeft: "1%" }}
          />
        </>
      ) : (
        <></>
      )}

      {abstract_modules_fetched && abstract_fields_fetched ? (
        <div>
          <br />

          <Descriptions title="Product Details" bordered column={2}>
            <Descriptions.Item label="Name" span={2}>
              {main_product_details_fetched
                ? main_product_details.ProductLabel
                : ""}
            </Descriptions.Item>
            {syncChildren && product_descendants_fetched ? (
              <>
                <Descriptions.Item label="Total Children (Including Self)">
                  {product_descendants.length}
                </Descriptions.Item>

                <Descriptions.Item label="Syncable Children">
                  {syncableChildren}
                </Descriptions.Item>
              </>
            ) : (
              <></>
            )}
          </Descriptions>
          <br />
          {/* {syncChildren ? (
            <>
              <Row gutter={16} style={{ justifyContent: "center" }}>
                <Col span={4}>
                  <Tooltip title="Includes the selected product in count">
                    <Statistic
                      title="Total Children"
                      value={product_descendants.length}
                      loading={!product_descendants_fetched}
                    ></Statistic>
                  </Tooltip>
                </Col>
                <Col span={4}>
                  <Tooltip title="Includes the selected product in count">
                    <Statistic
                      title="Syncable Children"
                      value={syncableChildren}
                      loading={!product_descendants_fetched}
                    ></Statistic>
                  </Tooltip>
                </Col>
              </Row>
              <br />
            </>
          ) : (
            <></>
          )} */}

          <div style={{ alignItems: "center", justifyItems: "center" }}>
            <Form
              form={conferenceForm}
              name="conferenceForm"
              layout="horizontal"
              labelCol={{ span: 10 }}
              wrapperCol={{ span: 8, push: 1 }}
            >
              <Form.Item
                name="copy_tags"
                label="Do you want to copy over the session & abstract tags to the product?"
                rules={[{ required: true }]}
              >
                <Radio.Group
                  onChange={abstractTagChangeHandler}
                  defaultValue={copyTags ? "true" : "false"}
                >
                  <Radio.Button value="true">Yes</Radio.Button>
                  <Radio.Button value="false">No</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="sync_children"
                label=" Do you want to sync products' children?"
                rules={[{ required: true }]}
              >
                <Radio.Group
                  onChange={syncChildrenChangeHandler}
                  defaultValue={syncChildren ? "true" : "false"}
                >
                  <Radio.Button value="true">Yes</Radio.Button>
                  <Radio.Button value="false">No</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Form>
          </div>

          <Alert
            message="Please select the fields that you want to display in your LMS. Click the checkbox in the table on the left to display the fields in the platform. Toggle the button under Display Label if you want the field label to be
            shown above the field."
            banner
            style={{ marginTop: "2%", width: "100%" }}
          />
          <div className="wizard-table">
            <Table
              columns={columns}
              rowSelection={{ ...rowSelection, checkStrictly: false }}
              dataSource={treeData}
              loading={is_wizard_loading}
            />
          </div>
          <div
            style={{
              textAlign: "center",
            }}
          >
            <Button
              type="primary"
              disabled={is_wizard_loading}
              onClick={() => onProcessSyncClickHandler()}
            >
              Start Sync
            </Button>
          </div>
        </div>
      ) : !showError ? (
        <Spin
          size="large"
          style={{
            marginTop: "5%",
            marginLeft: "50%",
          }}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default MainPage;
