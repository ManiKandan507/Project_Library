import React from "react";
import { Button, Result } from "antd";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
const ResultPage = ({
  onReupload,
  handleErrorDownload,
  resultStatus,
  errorMessage,
  showErrorDownload,
}) => {
  return (
    <div>
      <Result
        status={resultStatus == 1 ? "success" : "error"}
        title={
          errorMessage == "" ? "Products successfully created" : errorMessage
        }
        extra={[
          showErrorDownload ? (
            <>
              <Button
                type="link"
                icon={<DownloadOutlined />}
                onClick={handleErrorDownload}
                danger={resultStatus == 1 ? false : true}
              >
                Download{resultStatus == 1 ? "" : " error"} details
              </Button>
              {/* Show Upload again only if the no products got created */}
              {resultStatus != 1 ? (
                <Button
                  type="link"
                  icon={<UploadOutlined />}
                  onClick={onReupload}
                >
                  Upload Again
                </Button>
              ) : (
                <></>
              )}
            </>
          ) : (
            <></>
          ),
        ]}
      />
    </div>
  );
};

export default ResultPage;
