import axios from "axios";
import _ from "lodash";
const baseApi =
  "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";
// "http://localhost:8080/api";

const getStores = async sourceHex => {
  const response = await axios.get(
    `${baseApi}?module=ecommerce&component=stores&function=getAllStores&source=${sourceHex}`
  );
  return response;
};

const getS3Signature = async (key, bucket, content_type) => {
  const nowPlusOneHr = new Date();
  nowPlusOneHr.setHours(nowPlusOneHr.getHours() + 1);

  const data = JSON.stringify({
    expiration: nowPlusOneHr,
    conditions: [
      {
        acl: "private",
      },
      {
        bucket: bucket,
      },
      {
        "Content-Type": content_type,
      },
      {
        success_action_status: "200",
      },
      {
        key: key,
      },
      {
        "x-amz-meta-qqfilename": "state.json",
      },
    ],
  });

  const axiosBody = {
    method: "post",
    headers: {
      'Content-Type': `${content_type}`
    },
    url: "https://www.xcdsystem.com/masterapp_summer2012/controllers/amazonS3/sign.cfm",
    data,
  };

  const response = await axios(axiosBody);

  return response.data;
};

const uploadTos3 = async (key, bucket, content_type, file, sign_params) => {
  const data = new FormData();
  data.append("key", key);
  data.append("Content-Type", content_type);
  data.append("acl", "private");
  data.append("x-amz-meta-qqfilename", "state.json");
  data.append("AWSAccessKeyId", "AKIAYUGOQI43J3IGQQES");
  data.append("policy", sign_params.policy);
  data.append("signature", sign_params.signature);
  data.append("success_action_status", "200");
  data.append("file", file.fileList[0].originFileObj);

  const config = {
    method: "post",
    url: `https://s3.amazonaws.com/${bucket}`,
    headers: {
      'Content-Type': `${content_type}`
    },
    data: data,
  };

  await axios(config);

  return { url: `https://s3.amazonaws.com/${bucket}/${key}`, key: key };
};

const createProductsCSV = async (sourceHex, storeID, confID, fileURL) => {
  const result = await axios(
    `${baseApi}?module=ecommerce&component=stores&function=createProductsCSV&source=${sourceHex}&storeID=${storeID}&confID=${confID}&fileURL=${fileURL}`
  );

  return result;
};

const CSVProcessorAPIs = {
  getStores,
  getS3Signature,
  uploadTos3,
  createProductsCSV,
};

export default CSVProcessorAPIs;
