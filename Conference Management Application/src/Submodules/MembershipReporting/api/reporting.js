import axios from "axios";
const baseApi =
  // "http://localhost:8080/api"; 
  "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";


const getRenewingMembersInfo = async ({ sourceHex, groupid, start_date, end_date, offset, limit, detailed }) => {
  let renewingApi = `${baseApi}?module=dues&component=reports&function=renewing_members&source=${sourceHex}&groupid=${groupid}&start_date=${start_date}&end_date=${end_date}`;
  if (detailed) {
    renewingApi += `&detailed=${detailed}&offset=${offset}&limit=${limit}`
  }
  const data = await fetch(
    renewingApi,
    {
      method: "GET",
    }
  );
  const dataJson = await data.json();
  return dataJson;
};

const getNewMembersInfo = async ({ sourceHex, groupid, start_date, end_date, offset, limit, detailed }) => {
  let newMemApi = `${baseApi}?module=dues&component=reports&function=new_members&source=${sourceHex}&groupid=${groupid}&start_date=${start_date}&end_date=${end_date}`;
  if (detailed) {
    newMemApi += `&detailed=${detailed}&offset=${offset}&limit=${limit}`
  }
  const data = await fetch(
    newMemApi,
    {
      method: "GET",
    }
  );
  const dataJson = await data.json();
  return dataJson;
};

const getExpiredMembersInfo = async ({ sourceHex, groupid, expiry_as_of, offset, limit, detailed }) => {
  let expMemberApi = `${baseApi}?module=dues&component=reports&function=expired_members&source=${sourceHex}&groupid=${groupid}&expiry_as_of=${expiry_as_of}`;
  if (detailed) {
    expMemberApi += `&detailed=${detailed}&offset=${offset}&limit=${limit}`
  }
  const data = await fetch(
    expMemberApi,
    {
      method: "GET",
    }
  );
  const dataJson = await data.json();
  return dataJson;
};

const getCurrentMembersInfo = async ({ sourceHex, groupid, as_of, offset, limit, detailed }) => {
  let currentMemApi = `${baseApi}?module=dues&component=reports&function=current_members&source=${sourceHex}&groupid=${groupid}&as_of=${as_of}`;
  if (detailed) {
    currentMemApi += `&detailed=${detailed}&offset=${offset}&limit=${limit}`
  }
  const data = await fetch(
    currentMemApi,
    {
      method: "GET",
    }
  );
  const dataJson = await data.json();
  return dataJson;
};

const getExtendedHistoryInfo = async (
  sourceHex,
  groupid,
  start_date,
  end_date
) => {
  const response = await axios.get(
    `${baseApi}?module=dues&component=reports&function=extended_history&source=${sourceHex}&groupid=${groupid}&start_date=${start_date}&end_date=${end_date} `
  );
  return response;
};

const getMemberTransitionInfo = async (
  sourceHex,
  groupid,
  start_date,
  end_date
) => {
  const response = await axios.get(
    `${baseApi}?module=dues&component=reports&function=member_transition&source=${sourceHex}&groupid=${groupid}&start_date=${start_date}&end_date=${end_date} `
  );
  return response;
};

const getSalesActivityInfo = async ({ sourceHex, groupid, start_date, end_date }) => {
  let salesApi = `${baseApi}?module=dues&component=reports&function=sales&source=${sourceHex}&groupid=${groupid}&start_date=${start_date}&end_date=${end_date}`;
  const response = await axios.get(
    salesApi
  );
  return response;
};

const getMembersInfoByUuids = async ({ uuids, sourceHex }) => {
  let API = `${baseApi}?module=contact&component=contacts&function=FetchDetails&source=${sourceHex}`;
  const data = await fetch(API,
    {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uuids })
    }
  );
  const dataJson = await data.json();
  return dataJson;
};

const getLocationDetails = async ({ sourceHex, locationType, groupId, detailed, country, offset, limit, state }) => {
  let API = `${baseApi}?module=dues&component=reports&function=${locationType}&source=${sourceHex}`;
  if (groupId) {
    API += `groupid=${groupId}`
  }
  if (detailed) {
    API += `&detailed=${detailed}`
  }
  if (country) {
    API += `&country=${country}`
  }
  if (state) {
    API += `&state=${state}`
  }
  if (limit) {
    API += `&offset=${offset}&limit=${limit}`
  }

  const response = await axios.get(API);
  return response;
};
const ReportingAPIs = {
  getCurrentMembersInfo,
  getRenewingMembersInfo,
  getNewMembersInfo,
  getExpiredMembersInfo,
  getExtendedHistoryInfo,
  getSalesActivityInfo,
  getMembersInfoByUuids,
  getLocationDetails,
  getMemberTransitionInfo
};

export default ReportingAPIs;
