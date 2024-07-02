/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Spin, Select, Alert, message } from "antd";
import {
  requestStores,
  requestCreateProductsCSV,
} from "../../appRedux/actions/CSVProcessor";
import "./custom.css";
import * as XLSX from "xlsx";
import {
  UploadOutlined,
  DownloadOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import Dragger from "antd/lib/upload/Dragger";
import { isEmpty } from "lodash";
import ResultPage from "./ResultPage";
const { Option } = Select;

const MainPage = props => {
  const dispatch = useDispatch();

  const [storeSelectList, setStoreSelectList] = useState(<Select></Select>);

  const [processingCSVFile, setProcessingCSVFile] = useState(false);
  const [selectedStore, setSelectedStore] = useState({});
  const [showResult, setShowResult] = useState(false);
  const stateProcessCSV = useSelector(state => state.csv_processor);
  const storeList = useSelector(state => state.csv_processor.stores);
  const stores_fetched = useSelector(
    state => state.csv_processor.stores_fetched
  );
  // resultStatus values:
  // 1 => All products successfully created Response: { success: 1, data: { productIDs:[], nonExistentURLs:[{},{}] }, executionDuration: duration };
  // 2 => XLSX records have missing fields { success: 0, message: 'Please fix the errors and upload again', data: { error_records: [{}] } };
  // 3 => Failed due to server error { success: 0, message: 'Failed to create products', data: { failedRecords, nonExistentURLs:[{},{}] } };
  const [resultStatus, setResultStatus] = useState("");
  const [uploadResultDetails, setUploadResultDetails] = useState({});
  useEffect(() => {
    if (storeList.length > 0) {
      let finalList = [];
      storeList.forEach(store => {
        finalList.push(
          <Option value={store.StoreID}> {store.Eventname} </Option>
        );
      });

      setStoreSelectList(finalList);
    }
  }, [storeList]);

  useEffect(() => {
    if (!stores_fetched) {
      //Request store List
      dispatch(requestStores(props.sourceHex));
    }
  });

  useEffect(() => {
    if (stateProcessCSV.process_completed) {
      setProcessingCSVFile(false);

      if (stateProcessCSV.result.success == 1) {
        // Products created
        setUploadResultDetails({
          nonExistentURLs: stateProcessCSV.result.data?.nonExistentURLs,
          nonExistentFeatureImages:
            stateProcessCSV.result.data?.nonExistentFeatureImages ?? [],
        });
        setResultStatus(1);
      } else if (stateProcessCSV.result.success == 0) {
        // Failed to create products

        if (stateProcessCSV.result.data?.error_records) {
          setUploadResultDetails({
            error_records: stateProcessCSV.result.data?.error_records,
            message: stateProcessCSV.result.message,
          });
          setResultStatus(2);
        } else if (
          stateProcessCSV.result.data?.failedRecords ||
          stateProcessCSV.result.data?.nonExistentURLs
        ) {
          setUploadResultDetails({
            failedRecords: stateProcessCSV.result.data?.failedRecords ?? [],
            nonExistentURLs: stateProcessCSV.result.data?.nonExistentURLs ?? [],
            nonExistentFeatureImages:
              stateProcessCSV.result.data?.nonExistentFeatureImages ?? [],
            message: stateProcessCSV.result.message,
          });
          setResultStatus(3);
        } else {
          setUploadResultDetails({
            failedRecords: [],
            nonExistentURLs: [],
            nonExistentFeatureImages: [],
            message: stateProcessCSV.result.message,
          });
          setResultStatus(3);
        }
      }
      setShowResult(stateProcessCSV.process_completed);
    }
  }, [stateProcessCSV.process_completed]);

  const handleStoreMenuClick = value => {
    if (value) {
      for (let storeitr = 0; storeitr < storeList.length; storeitr++) {
        if (storeList[storeitr].StoreID === value) {
          setSelectedStore(storeList[storeitr]);
          break;
        }
      }
    }
  };

  const handleUploadCSV = files => {
    if (files.fileList.length === 0) {
      message.error("Please select file");
      return true;
    } else if (files.fileList.length > 1) {
      message.error("Maximum 1 file can be selected");
      return false;
    }

    const key = `${props.appdir}/companies/files/${(Math.random() + 1)
      .toString(36)
      .substring(7)}_${files.fileList[0].name}`;
    setProcessingCSVFile(true);
    dispatch(
      requestCreateProductsCSV({
        sourceHex: props.sourceHex,
        storeID: selectedStore.StoreID,
        confID: selectedStore.ConfID,
        file: files,
        key: key,
        "Content-Type": "application/*",
      })
    );
  };

  const handleCloseResult = () => {
    setShowResult(false);
  };

  const handleErrorDownload = () => {
    const headerErrorCSV = [
      "error_message",
      "product_id",
      "parent_product_id",
      "product_label",
      "product_category",
      "default_price",
      "alt_price_1_GroupIDs",
      "alt_price_1",
      "alt_price_2_GroupIDs",
      "alt_price_2",
      "alt_price_3_GroupIDs",
      "alt_price_3",
      "external_id",
      "accounting_code",
      "publication_date",
      "product_description",
      "author_block",
      "feature_image",
      "resource_file_1",
      "resource_file_2",
      "resource_file_3",
      "tags",
    ];
    if (resultStatus == 1) {
      //Success : XLSX with 1 sheet from nonExistentURLs
      const workSheet = XLSX.utils.json_to_sheet(
        uploadResultDetails.nonExistentURLs,
        {
          header: ["product_id", "product_label", "URL"],
        }
      );
      const workSheetFeatureURL = XLSX.utils.json_to_sheet(
        uploadResultDetails.nonExistentFeatureImages,
        {
          header: ["product_id", "product_label", "URL"],
        }
      );
      const workBook = {
        Sheets: {
          NonExistentURLs: workSheet,
          InvalidFeatureImages: workSheetFeatureURL,
        },
        SheetNames: ["NonExistentURLs", "InvalidFeatureImages"],
      };
      // Push to browser
      XLSX.writeFile(workBook, `unknownURLs.xlsx`);
    } else if (resultStatus == 2) {
      // Error: XLSX with 1 sheet from error_records

      const workSheet = XLSX.utils.json_to_sheet(
        uploadResultDetails.error_records,
        {
          header: headerErrorCSV,
        }
      );

      const workBook = {
        Sheets: { data: workSheet },
        SheetNames: ["data"],
      };
      // Push to browser

      XLSX.writeFile(workBook, "missing_fields.xlsx");
    } else if (resultStatus == 3) {
      // Error: 2 sheets - failedRecords, nonExistentURLs
      const workSheetURL = XLSX.utils.json_to_sheet(
        uploadResultDetails.nonExistentURLs,
        {
          header: ["product_id", "product_label", "URL"],
        }
      );
      const workSheetFeatureURL = XLSX.utils.json_to_sheet(
        uploadResultDetails.nonExistentFeatureImages,
        {
          header: ["product_id", "product_label", "URL"],
        }
      );

      const workSheetFailedRecords = XLSX.utils.json_to_sheet(
        uploadResultDetails.failedRecords,
        {
          header: headerErrorCSV,
        }
      );

      const workBook = {
        Sheets: {
          NonExistentURLs: workSheetURL,
          failedRecords: workSheetFailedRecords,
          InvalidFeatureImages: workSheetFeatureURL,
        },
        SheetNames: [
          "failedRecords",
          "NonExistentURLs",
          "InvalidFeatureImages",
        ],
      };
      // Push to browser
      XLSX.writeFile(workBook, `failedRecords.xlsx`);
    }
  };

  if (showResult) {
    return (
      <div>
        <ResultPage
          onReupload={handleCloseResult}
          handleErrorDownload={handleErrorDownload}
          resultStatus={resultStatus}
          errorMessage={uploadResultDetails.message ?? ""}
          showErrorDownload={
            (resultStatus == 1 &&
              uploadResultDetails?.nonExistentURLs?.length > 0) ||
            (resultStatus == 2 &&
              uploadResultDetails?.error_records?.length > 0) ||
            (resultStatus == 3 &&
              (uploadResultDetails?.failedRecords?.length > 0 ||
                uploadResultDetails?.nonExistentURLs?.length > 0 ||
                uploadResultDetails?.nonExistentFeatureImages?.length > 0))
              ? true
              : false
          }
        />
      </div>
    );
  }

  return stores_fetched ? (
    <div>
      <br />
      {storeList.length === 0 ? (
        <Alert
          message="No Stores Found"
          description={
            <div>
              Create a store
              <a
                href={`https://www.xcdsystem.com/${props.appdir}/admin/conference/index.cfm?NewConf=1&store=1`}
                target="_blank"
                rel="noreferrer"
              >
                {` here`}
              </a>
            </div>
          }
          type="error"
          showIcon
          style={{ marginRight: "3%", marginLeft: "3%" }}
        />
      ) : (
        <>
          {stateProcessCSV.process_completed &&
          stateProcessCSV.result.success === 1 ? (
            <>
              <Alert type="info" message="Products successfully created" />
            </>
          ) : (
            <></>
          )}
          <br />
          <div style={{ alignItems: "center", justifyItems: "center" }}>
            <>
              <p>Select Store:{"   "}</p>

              <Select
                placeholder="Select Store"
                onChange={handleStoreMenuClick}
                style={{ width: "30%" }}
              >
                {storeSelectList}
              </Select>
            </>

            <div style={{ textAlign: "end" }}>
              <Button
                type="link"
                icon={<DownloadOutlined />}
                href="https://www.google.com"
                target="_blank"
              >
                Download Template
              </Button>
            </div>

            <Dragger
              name="csv_xlsx_upload"
              accept=".csv,.xlsx"
              maxCount={1}
              multiple={false}
              defaultFileList={[]}
              style={{ maxHeight: "70%" }}
              disabled={
                isEmpty(selectedStore) ||
                (stateProcessCSV.process_completed &&
                  stateProcessCSV.result.success === 1)
              }
              beforeUpload={file => {
                const fileExtension = file.name.split(".").pop().toLowerCase();
                if (isEmpty(selectedStore)) {
                  message.error("Select Store");
                }
                if (fileExtension !== "csv" && fileExtension !== "xlsx") {
                  message.error(`${file.name} is not a supported file`);
                }
                return false;
              }}
              onChange={handleUploadCSV}
              showUploadList={{ showRemoveIcon: false }}
            >
              <div
                style={{
                  alignContent: "center",
                  alignSelf: "center",
                  fontSize: "4vh",
                }}
              >
                {processingCSVFile ? (
                  <div>
                    <LoadingOutlined /> Processing File
                  </div>
                ) : (
                  <div>
                    <UploadOutlined />
                    <br />
                    Click or drag file to this area to upload
                  </div>
                )}
              </div>
            </Dragger>
          </div>
        </>
      )}
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

export default MainPage;
