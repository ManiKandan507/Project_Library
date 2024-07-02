import axios from "axios";
import _ from "lodash";
import { useState } from "react";


const baseApi =
  "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";
// "http://localhost:8080/api";

const getProductDetails = async (sourceHex, productID) => {
  try {   
    const response = await axios.get(
      `${baseApi}?module=ecommerce&component=stores&function=getProductDetails&source=${sourceHex}&productID=${productID}`
    );
    return response;
  } catch (error) {
      return { data:{ success: 0 }, productID};
  }
};
const getAbstractModules = async (sourceHex, conferenceId) => {
  const response = await axios.get(
    `${baseApi}?module=conference&component=sessions&function=getAbstractModules&ConferenceID=${conferenceId}&source=${sourceHex}`
  );
  return response;
};

const getAbstractFields = async (sourceHex, confIds) => {
  const response = await axios.get(
    `${baseApi}?module=conference&component=sessions&function=getAbstractFields&ConfIDs=${confIds}&source=${sourceHex}`
  );
  return response;
};

const getProductDescendants = async (sourceHex, productID) => {
  const response = await axios.get(
    `${baseApi}?module=ecommerce&component=stores&function=getAllDescendants&source=${sourceHex}&productID=${productID}`
  );
  return response;
};

const getSessionAbstractConfig = async (
  sourceHex,
  model_type,
  id,
  body = {}
) => {
  let response = [];
  for (const i of id) {
    try {
      const idResponse = await axios.post(
        `https://www.xcdsystem.com/masterapp_summer2012/controllers/mobileapp/remote_sync/mongo.cfm?source=${sourceHex}&model_type=${model_type}&model_id=${i}&product=1`,
        body
      );
      response.push(idResponse);
    } catch (error) {
      //Do nothing, skip this config
    }
  }
  return response;
};

const getUpdateProducts = async (sourceHex, products = []) => {
  try {
    const response = await axios.post(
      `${baseApi}?module=ecommerce&component=stores&function=updateProducts&source=${sourceHex}`,
      { products }
    );
    return response;
  } catch (error) {
    return { data:{ success: 0 }, productBatch: products};
  }
};

let loading = false;

const getWizardConfig = async (sourceHex, conferenceId) => {
  try {
    loading = true
    const response = await axios.get(`${baseApi}?module=ecommerce&component=stores&function=getWizardConfig&source=${sourceHex}&conferenceid=${conferenceId}`);
    loading = false
    return response;
  } catch (error) {
    loading = false
    return { data:{success: 0, loading: loading }};
  }
}
const fixFileSize = async sourceHex => {
  //Step 1: Get all product IDs with missing file_size
  const responseInvalidFileSize = await axios.get(
    `${baseApi}?module=ecommerce&component=stores&function=getInvalidFileSizeProducts&source=${sourceHex}`
  );
  //Step 2: Fix all products
  if (
    responseInvalidFileSize.data.success == 1 &&
    responseInvalidFileSize.data?.data?.productIDs.length > 0
  ) {
    //Call Fix File_size API
    const responseFixedFileSize = await axios.post(
      `${baseApi}?module=ecommerce&component=stores&function=fixInvalidFileSizeProducts&source=${sourceHex}`,
      { productIDs: responseInvalidFileSize.data.data?.productIDs }
    );
    return responseFixedFileSize;
  } else {
    return { success: 1 };
  }
};

const CSVProcessorAPIs = {
  getProductDetails,
  getAbstractModules,
  getAbstractFields,
  getProductDescendants,
  getSessionAbstractConfig,
  getUpdateProducts,
  getWizardConfig,
  fixFileSize
};

export default CSVProcessorAPIs;
