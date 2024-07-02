import axios from "axios";
const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";

const getMostViewedProducts = async ({ appDir, startDate, endDate, offset, limit }) => {
  let API = `${baseApi}?module=ecommerce&component=reports&function=most_viewed_products&appdir=${appDir}&start_date=${startDate}&end_date=${endDate}&offset=${offset}&limit=${limit}`;
  const response = await axios.get(API);
  return response;
};

const getMostViewedFiles = async ({ appDir, startDate, endDate, offset, limit }) => {
  let API = `${baseApi}?module=ecommerce&component=reports&function=most_viewed_files&appdir=${appDir}&start_date=${startDate}&end_date=${endDate}&offset=${offset}&limit=${limit};`
  const response = await axios.get(API);
  return response;
};

const getActiveUsersUid = async ({ appDir, startDate, endDate, offset, limit }) => {
  let API = `${baseApi}?module=ecommerce&component=reports&function=top_users&appdir=${appDir}&start_date=${startDate}&end_date=${endDate}&offset=${offset}&limit=${limit}`;
  const response = await axios.get(API);
  return response;
};

const getActiveUsersData = async ({ appDir, startDate, endDate, constructedUids }) => {
  let API = `${baseApi}?module=ecommerce&component=reports&function=get_active_user_details&appdir=${appDir}&start_date=${startDate}&end_date=${endDate}`;
  const response = await axios({
    url: API,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      contact_uuids: constructedUids 
    }
  })
  return response;
};

const getInsightdata = async ({ appDir }) => {
  let API = `${baseApi}?module=ecommerce&component=reports&function=insights&appdir=${appDir}`
  const response = await axios.get(API);
  return response;
};

const getMonthlyActiveUserData = async ({ appDir, startDate, endDate}) => {
  let API = `${baseApi}?module=ecommerce&component=reports&function=monthly_active_users&appdir=${appDir}&start_date=${startDate}&end_date=${endDate}`
  const response = await axios.get(API);
  return response;
}

const getMonthlyBandwidthData = async ({ appDir, startDate, endDate}) => {
  let API = `${baseApi}?module=ecommerce&component=reports&function=monthly_bandwidth&appdir=${appDir}&start_date=${startDate}&end_date=${endDate}`
  const response = await axios.get(API);
  return response;
}

const getFilesStatisticsData = async ({ appDir }) => {
  let API = `${baseApi}?module=ecommerce&component=reports&function=file_insights&appdir=${appDir}`
  const response = await axios.get(API);
  return response;
}

const getMonthlyFilesViewData = async ({ appDir,startDate,endDate }) => {
  let API = `${baseApi}?module=ecommerce&component=reports&function=monthly_file_views&appdir=${appDir}&start_date=${startDate}&end_date=${endDate}`
  const response = await axios.get(API);
  return response;
}

const getProductsViewData = async ({ appDir, startDate, endDate, customer_uuid }) => {
  let API = `${baseApi}?module=ecommerce&component=reports&function=product_views_by_user&appdir=${appDir}&start_date=${startDate}&end_date=${endDate}&customer_uuid=${customer_uuid}`
  const response = await axios.get(API);
  return response;
}

const getUsersCustomerId = async ({ appDir, startDate, endDate }) => {
  let API = `${baseApi}?module=ecommerce&component=reports&function=top_users&appdir=${appDir}&start_date=${startDate}&end_date=${endDate}`;
  const response = await axios.get(API);
  return response;
}

const getUserContactDetails = async ({ sourceHex, constructedUids }) => {
  let API = `${baseApi}?module=contact&component=contacts&function=FetchDetails&source=${sourceHex}`;
  const response = await axios({
    url: API,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: { uuids: constructedUids }
  })
  return response;
};

const ReportingAPIs = {
  getMostViewedProducts,
  getActiveUsersUid,
  getActiveUsersData,
  getMostViewedFiles,
  getInsightdata,
  getMonthlyActiveUserData,
  getMonthlyBandwidthData,
  getFilesStatisticsData,
  getMonthlyFilesViewData,
  getProductsViewData,
  getUsersCustomerId,
  getUserContactDetails,
};

export default ReportingAPIs;
