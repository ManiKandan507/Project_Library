/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Alert, Result, Steps } from "antd";
import { CloseCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import {
  requestFixFileSize,
  requestSessionAbstractConfig,
  requestUpdateProducts,
} from "../../appRedux/actions/SyncECommerceProducts";
import "./custom.css";

import { detectProductType, IsJsonString } from "../../helpers/common";
const { Step } = Steps;
const SyncProduct = props => {
  const dispatch = useDispatch();

  const main_product_details = useSelector(
    state => state.sync_products.main_product_details
  );
  const main_product_details_fetched = useSelector(
    state => state.sync_products.main_product_details_fetched
  );

  const product_descendants = useSelector(
    state => state.sync_products.product_descendants
  );
  const children_product_details_fetched = useSelector(
    state => state.sync_products.children_product_details_fetched
  );
  const children_product_details = useSelector(
    state => state.sync_products.children_product_details
  );
  const session_configs = useSelector(
    state => state.sync_products.session_configs
  );
  const abstract_configs = useSelector(
    state => state.sync_products.abstract_configs
  );
  const session_abstract_configs_fetched = useSelector(
    state => state.sync_products.session_abstract_configs_fetched
  );
  const products_updated = useSelector(
    state => state.sync_products.products_updated
  );
  const products_update_failed = useSelector(
    state => state.sync_products.products_update_failed
  );
  const [syncComplete, setSyncComplete] = useState(false);
  const [conferenceID] = useState(props.conferenceID);
  const [currentStep, setCurrentStep] = useState(0);
  const [bundleProductsMap, setBundleProductsMap] = useState({});
  const [selectedAbstractFields] = useState(() => {
    let dispatchReq = [];
    for (const key in props.abstractFields) {
      dispatchReq.push(props.abstractFields[key]);
    }
    return dispatchReq;
  });
  const [syncChildren] = useState(props.syncChildren);
  const [copyTags] = useState(props.copyTags);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [sessionProductIDs, setSessionProductIDs] = useState([]);
  const [abstractProductIDs, setAbstractProductIDs] = useState([]);
  const [sessionIDs, setSessionIDs] = useState([]);
  const [abstractIDs, setAbstractIDs] = useState([]);
  const [fetchSessionAbstractConfig, setFetchSessionAbstractConfig] =
    useState(false);
  //Step 1
  useEffect(() => {
    //Build the sessionIDs and abstractIDs from products
    if (!showError) {
      if (syncChildren) {
        console.log("Step 1");
        let tempSessionProductIDs = [];
        let tempAbstractProductIDs = [];
        let tempSessionIDs = [];
        let tempAbstractIDs = [];
        product_descendants.forEach(record => {
          if (record.productType == "session") {
            tempSessionProductIDs.push(record.productID);
            tempSessionIDs.push(record.sessionID);
          } else if (record.productType == "abstract") {
            tempAbstractProductIDs.push(record.productID);
            tempAbstractIDs.push(record.abID);
          } else if (record.productType == "bundle") {
            setBundleProductsMap({
              ...bundleProductsMap,
              [record.productID]: {
                sessionIDs: record.sessionIDs,
                description: record.description,
              },
            });
            tempSessionIDs.push(...record.sessionIDs);
            for (let count = 0; count < record.sessionIDs.length; count++) {
              //Adding productID of bundle multiple times for tracking
              tempSessionProductIDs.push(record.productID);
            }
          }
        });
        setSessionIDs([...sessionIDs, ...tempSessionIDs]);
        setSessionProductIDs([...sessionProductIDs, ...tempSessionProductIDs]);
        setAbstractIDs([...abstractIDs, ...tempAbstractIDs]);
        setAbstractProductIDs([
          ...abstractProductIDs,
          ...tempAbstractProductIDs,
        ]);
        setFetchSessionAbstractConfig(true);
      } else {
        console.log("Step 1");
        // Process the main product
        const mainProductType = detectProductType(
          main_product_details.ConfigJSON
        );
        const tempMainConfigJSON = IsJsonString(main_product_details.ConfigJSON)
          ? JSON.parse(main_product_details.ConfigJSON)
          : null;
        // retaining  the old configJSON keys for main product
        const mainConfigJSON = props.fetchChildrenProductConfig
          ? tempMainConfigJSON
            ? {
                ...tempMainConfigJSON,
                show_times: tempMainConfigJSON.show_times ?? false,
              }
            : null
          : tempMainConfigJSON;
        if (
          mainConfigJSON &&
          mainConfigJSON.hasOwnProperty("session_id") &&
          mainProductType == "session"
        ) {
          if (!sessionIDs.includes(mainConfigJSON.session_id)) {
            setSessionIDs([...sessionIDs, mainConfigJSON.session_id]);
            setSessionProductIDs([
              ...sessionProductIDs,
              main_product_details.ProductID,
            ]);
          }
          setFetchSessionAbstractConfig(true);
        } else if (
          mainConfigJSON &&
          mainConfigJSON.hasOwnProperty("abid") &&
          mainProductType == "abstract"
        ) {
          if (!abstractIDs.includes(mainConfigJSON.abid)) {
            setAbstractIDs([...abstractIDs, mainConfigJSON.abid]);
            setAbstractProductIDs([
              ...abstractProductIDs,
              main_product_details.ProductID,
            ]);
          }
          setFetchSessionAbstractConfig(true);
        } else if (
          mainConfigJSON &&
          mainConfigJSON.hasOwnProperty("merged") &&
          mainProductType == "bundle"
        ) {
          const mergedSessionIDs = mainConfigJSON.merged.map(
            config => config.session_id
          );
          setSessionIDs([...sessionIDs, ...mergedSessionIDs]);
          let dupProductIDs = [];
          for (let count = 0; count < mergedSessionIDs.length; count++) {
            //Adding productID of bundle multiple times for tracking
            dupProductIDs.push(main_product_details.ProductID);
          }
          setSessionProductIDs([...sessionProductIDs, ...dupProductIDs]);
          setBundleProductsMap({
            ...bundleProductsMap,
            [main_product_details.ProductID]: {
              sessionIDs: mergedSessionIDs,
              description: mainConfigJSON.description,
            },
          });
          setFetchSessionAbstractConfig(true);
        } else {
          setErrorMessage(
            "Cannot Sync product as this is conference product or manually imported"
          );
          setShowError(true);
        }
      }
    }
  }, [syncChildren, showError]);
  //Step 2
  useEffect(() => {
    if (fetchSessionAbstractConfig && !session_abstract_configs_fetched) {
      console.log("Step 2");
      dispatch(
        requestSessionAbstractConfig({
          sourceHex: props.sourceHex,
          body: {
            copy_tags: copyTags,
            abstract_fields: selectedAbstractFields,
          },
          sessionProductIDs,
          abstractProductIDs,
          sessionIDs,
          abstractIDs,
        })
      );
    }
  }, [fetchSessionAbstractConfig]);
  //Step 3
  useEffect(() => {
    if (session_abstract_configs_fetched && !products_updated) {
      console.log("Step 3");
      setCurrentStep(1);
      const updateProductRequest = [];

      for (const key in session_configs) {
        if (bundleProductsMap[key]) {
          //This is a bundle product
          updateProductRequest.push({
            ProductID: key,
            ConfigJSON: JSON.stringify({
              merged: Array.isArray(session_configs[key])
                ? session_configs[key]
                : [session_configs[key]],
              description: bundleProductsMap[key].description,
            }),
          });
        } else {
          const existingConfig = JSON.parse(
            props.fetchChildrenProductConfig
              ? children_product_details[key]?.ConfigJSON
              : '{}'
          );
          updateProductRequest.push({
            ProductID: key,
            ConfigJSON: props.fetchChildrenProductConfig
              ? JSON.stringify({
                  ...session_configs[key],
                  show_times: existingConfig?.show_times ?? false,
                })
              : JSON.stringify(session_configs[key]),
          });
        }
      }

      for (const key in abstract_configs) {
        const existingConfig = JSON.parse(
          props.fetchChildrenProductConfig
            ? children_product_details[key]?.ConfigJSON
            : '{}'
        );
        updateProductRequest.push({
          ProductID: key,
          ConfigJSON: props.fetchChildrenProductConfig
            ? JSON.stringify({
                ...abstract_configs[key],
                show_times: existingConfig?.show_times ?? false,
              })
            : JSON.stringify(abstract_configs[key]),
        });
      }

      dispatch(
        requestUpdateProducts({
          sourceHex: props.sourceHex,
          products: updateProductRequest,
        })
      );
    }
  }, [session_abstract_configs_fetched]);
  // Step 4
  useEffect(() => {
    console.log("Step 4");
    if (products_updated) {
      // Fix the file_size of the product files. Call the API
      dispatch(requestFixFileSize({ sourceHex: props.sourceHex }));
      setSyncComplete(true);
    } else if (products_update_failed) {
      setErrorMessage("Failed to update all products");
      setShowError(true);
    }
  }, [products_updated, products_update_failed]);
  return syncComplete ? (
    <Result status="success" title="Successfully Synced Product" />
  ) : (
    <div style={{ marginTop: "5%", marginLeft: "40%" }}>
      <Steps
        direction="vertical"
        current={currentStep}
        status={showError ? "error" : ""}
      >
        <Step
          title="Getting product details"
          subTitle="Fetching required data"
          icon={currentStep == 0 ? <LoadingOutlined /> : ""}
        />

        <Step
          title={showError ? errorMessage : "Updating products"}
          subTitle={showError ? "" : "Syncing the product with latest details"}
          status={showError ? "error" : ""}
          icon={currentStep == 1 ? showError ? "" : <LoadingOutlined /> : ""}
        />
      </Steps>
    </div>
  );
};

export default SyncProduct;
