import axios from "axios";
import _ from "lodash";
const baseApi =
  "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";
  // "http://localhost:8080/api";

const getConferences = async sourceHex => {
  const response = await axios.get(
    `${baseApi}?module=client&component=event&function=fetch_conferences&source=${sourceHex}`
  );
  return response;
};

const getStores = async sourceHex => {
  const response = await axios.get(
    `${baseApi}?module=ecommerce&component=stores&function=getAllStores&source=${sourceHex}`
  );
  return response;
};

const getSessionTypes = async (sourceHex, uuid, conferenceId) => {
  const response = await axios.get(
    `https://xcdsystem.com/masterapp_summer2012/controllers/program/api/index.cfm/?source=${sourceHex}&uuid=${uuid}&method=get_config&conferenceid=${conferenceId}`
  );
  return response;
};

const getAllSessions = async (sourceHex, uuid, conferenceId) => {
  const response = await axios.get(
    `https://xcdsystem.com/masterapp_summer2012/controllers/program/api/index.cfm/?source=${sourceHex}&uuid=${uuid}&method=get_all_sessions&conferenceid=${conferenceId}`
  );
  return response;
};

const getAllSessionsDetails = async (sourceHex, uuid, conferenceId) => {
  try {
    let finalResponse = [];
    const response = await axios.get(
      `https://pe97nxhj35.execute-api.us-east-2.amazonaws.com/dev2/session/${sourceHex}/${conferenceId}`
    );

    if (response.data.json) {
      finalResponse = await axios.get(response.data.json);
    }
    return finalResponse;
  } catch (error) {
    return { success: 0 };
  }
};

const getContactGroups = async appdir => {
  const response = await axios.get(
    `${baseApi}?appdir=${appdir}&module=directory&component=member_directory&function=contact_groups`
  );
  return response;
};

const getAttendeeGroups = async (source_hex, ConferenceID) => {
  const response = await axios.get(
    `${baseApi}?source=${source_hex}&module=conference&component=attendee&function=getAttendeeRegistrationGroups&ConferenceID=${ConferenceID}`
  );
  return response;
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

const getAbstracts = async (sourceHex, sessionID) => {
  const response = await axios.get(
    `${baseApi}?module=conference&component=sessions&function=getAbstracts&SessionID=${sessionID}&source=${sourceHex}`
  );
  return { ...response, sessionID };
};

const sendSlackMessage = async message => {
  const data = new FormData();
  data.append("message", message);
  return await axios.post(
    `https://cors.econference.io/https://xcdsystem.com/chetan/postSlack.cfm`,
    data
  );
};

const getSessionAbstractConfig = async (
  sourceHex,
  model_type,
  id,
  body = {},
  includeCredits = [],
  includeEvaluation = []
) => {
  let response = [];
  for (const i of id) {
    try {
      let includeCreditEvaluation = "";
      if (model_type == "session") {
        if (includeCredits.includes(parseInt(i))) {
          includeCreditEvaluation = "&include_credits=true";
        }
        if (includeEvaluation.includes(parseInt(i))) {
          includeCreditEvaluation = includeCreditEvaluation.concat(
            "&include_evaluation=true"
          );
        }
      }
      const idResponse = await axios.post(
        `https://www.xcdsystem.com/masterapp_summer2012/controllers/mobileapp/remote_sync/mongo.cfm?source=${sourceHex}&model_type=${model_type}&model_id=${i}&product=1${includeCreditEvaluation}`,
        body
      );
      response.push(idResponse);
    } catch (error) {
      //Do nothing, skip this config
    }
  }
  return response;
};

const postAddProducts = async (sourceHex, products = [], batchID) => {
  try {
    const response = await axios.post(
      `${baseApi}?module=ecommerce&component=stores&function=addProduct&source=${sourceHex}`,
      { products }
    );
    return { products, response, batchID };
  } catch (error) {
    return { products, response: { data: { success: 0 } }, batchID };
  }
};

const postAddProductPricing = async (sourceHex, pricing = [], batchID) => {
  try {
    if (_.isEmpty(pricing)) {
      return { success: 1, FieldIDs: [], batchID };
    }
    const response = await axios.post(
      `${baseApi}?module=ecommerce&component=stores&function=addPricing&source=${sourceHex}`,
      { pricing }
    );
    return { pricing, response, batchID };
  } catch (error) {
    return { pricing, response: { data: { success: 0 } }, batchID };
  }
};

const postAddProductAccess = async (sourceHex, access = [], batchID) => {
  try {
    if (_.isEmpty(access)) {
      return { success: 1, RowIDs: [], batchID };
    }
    const response = await axios.post(
      `${baseApi}?module=ecommerce&component=stores&function=addProductAccess&source=${sourceHex}`,
      { accesses: access }
    );
    return { access, response, batchID };
  } catch (error) {
    return { access, response: { data: { success: 0 } }, batchID };
  }
};

const postAddRelation = async (sourceHex, relations = [], batchID) => {
  try {
    if (_.isEmpty(relations)) {
      return { success: 1, RowIDs: [], batchID };
    }
    const response = await axios.post(
      `${baseApi}?module=ecommerce&component=stores&function=createParentChildRelation&source=${sourceHex}`,
      { relations }
    );
    return { relations, response, batchID };
  } catch (error) {
    return { relations, response: { data: { success: 0 } }, batchID };
  }
};

const postCloneForm = async (sourceHex, appdir, evaluations = [], batchID) => {
  try {
    if (_.isEmpty(evaluations)) {
      return { success: 1, RowIDs: [], batchID };
    }
    const response = {};
    // await axios.post(
    //   "https://masterapp.econference.io/masterapp_summer2012/controllers/forms/api/clone_form.cfm",
    //   { appdir: appdir, data: evaluations }
    // );
    return { evaluations, response, batchID };
  } catch (error) {
    return { evaluations, response: { data: { success: 0 } }, batchID };
  }
};

const postPerformRollback = async (sourceHex, product_ids = []) => {
  try {
    if (_.isEmpty(product_ids)) {
      return { success: 1 };
    }
    const response = await axios.post(
      `${baseApi}?module=ecommerce&component=stores&function=wizardRollback&source=${sourceHex}`,
      { product_ids }
    );
    return response;
  } catch (error) {
    return { response: { data: { success: 0 } } };
  }
};

const getConfMenus = async (sourceHex, ConfID) => {
  const response = await axios.get(
    `${baseApi}?module=conference&component=sessions&function=getMenus&ConfID=${ConfID}&source=${sourceHex}`
  );
  return response;
};

const fetchFetchAddProductCategory = async (sourceHex, ConfID, label) => {
  const response = await axios.get(
    `${baseApi}?module=ecommerce&component=stores&function=fetchOrAddProductCategory&label=${label}&ConfID=${ConfID}&source=${sourceHex}`
  );
  return response;
};
const getCreditDetails = async (sourceHex, ConferenceID) => {
  const response = await axios.get(
    `${baseApi}?module=conference&component=sessions&function=getCreditDetails&ConferenceID=${ConferenceID}&source=${sourceHex}`
  );
  return response;
};

const getFormDetails = async (sourceHex, ConferenceID, sessionIDs) => {
  const response = await axios.post(
    `${baseApi}?module=conference&component=sessions&function=getFormDetails&source=${sourceHex}&ConferenceID=${ConferenceID}`,
    { SessionIDs: sessionIDs }
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
    url: "https://www.xcdsystem.com/masterapp_summer2012/controllers/amazonS3/sign.php",
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
  data.append("AWSAccessKeyId", "AKIAYUGOQI43MOKD6OIJ");
  data.append("policy", sign_params.policy);
  data.append("signature", sign_params.signature);
  data.append("success_action_status", "200");
  data.append("file", file.fileList[0].originFileObj);

  const config = {
    method: "post",
    url: `https://s3.amazonaws.com/${bucket}`,
    data: data,
  };

  await axios(config);

  return { url: `https://s3.amazonaws.com/${bucket}/${key}`, key: key };
};

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

const storeWizardConfig = async (sourceHex, config, conferenceid) => {
  try {
    const response = await axios.post(
      `${baseApi}?module=ecommerce&component=stores&function=storeWizardConfig&source=${sourceHex}&conferenceid=${conferenceid}`,
      { config }
    );
    return response;
  } catch (error) {
    return { response: { data: { success: 0 } } };
  }
};

const WizardAPIs = {
  getConferences,
  getStores,
  getSessionTypes,
  getAllSessions,
  getAllSessionsDetails,
  getContactGroups,
  getAbstractModules,
  getAbstractFields,
  getAbstracts,
  getSessionAbstractConfig,
  getAttendeeGroups,
  postAddProducts,
  getConfMenus,
  fetchFetchAddProductCategory,
  postAddProductPricing,
  postAddProductAccess,
  postAddRelation,
  postPerformRollback,
  getS3Signature,
  uploadTos3,
  sendSlackMessage,
  fixFileSize,
  getCreditDetails,
  getFormDetails,
  postCloneForm,
  storeWizardConfig,
};

export default WizardAPIs;
