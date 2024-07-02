import axios from "axios";
const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";

const getRenewingMembersInfo = async ({ sourceHex, groupid, start_date, end_date, offset, limit, detailed,appdir }) => {
  let renewingApi = `${baseApi}?module=dues&component=corp_reports&function=corp_renewing_members&appdir=${appdir}&start_date=${start_date}&end_date=${end_date}&groupid=${groupid}`;
  if (detailed) renewingApi += `&detailed=${detailed}&offset=${offset}&limit=${limit}`
  return (await axios.get(renewingApi)).data;
};
const getNewMembersInfo = async ({ sourceHex, groupid, start_date, end_date, offset, limit, detailed,appdir }) => {
  let newMemApi = `${baseApi}?module=dues&component=corp_reports&function=corp_new_members&appdir=${appdir}&groupid=${groupid}&start_date=${start_date}&end_date=${end_date}`;
  if (detailed) newMemApi += `&detailed=${detailed}&offset=${offset}&limit=${limit}`;
  let data = await axios.get(newMemApi);
  return data.data;
};
const getExpiredMembersInfo = async ({ sourceHex, groupid, expiry_as_of, offset, limit, detailed,appdir }) => {
  let expMemberApi = `${baseApi}?module=dues&component=corp_reports&function=corp_expired_members&appdir=${appdir}&groupid=${groupid}&expiry_as_of=${expiry_as_of}`;
  if (detailed) expMemberApi += `&detailed=${detailed}&offset=${offset}&limit=${limit}`;
  let data = await axios.get(expMemberApi);
  return data.data;
};
const getCurrentMembersInfo = async ({ sourceHex, groupid, offset, limit, detailed,appdir }) => {
  let currentMemApi = `${baseApi}?module=dues&component=corp_reports&function=corp_current_members&appdir=${appdir}&groupid=${groupid}`;
  if (detailed) currentMemApi += `&detailed=${detailed}&offset=${offset}&limit=${limit}`;
  let data = await axios.get(currentMemApi);
  return data.data;
};
const getExtendedHistoryInfo = async ({ sourceHex, groupid, start_date, end_date,appdir }) => {
  const response = await axios.get(
    `${baseApi}?module=dues&component=corp_reports&function=corp_extended_history&source=${sourceHex}&groupid=${groupid}&start_date=${start_date}&end_date=${end_date}`
  );
  return response;
};
const getSalesActivityInfo = async ({ sourceHex, groupid, start_date, end_date,appdir }) => {
  let salesApi = `${baseApi}?module=dues&component=corp_reports&function=corp_sales&source=${sourceHex}&groupid=${groupid}&start_date=${start_date}&end_date=${end_date}`;
  const response = await axios.get(salesApi);
  return response;
};
const getMembersInfoByUuids = async ({ uuids, sourceHex, appdir }) => {
  let API = `${baseApi}?module=company&component=company_profile&function=FetchDetails&appdir=${appdir}`;
  const data = await axios.post(API, { uuids }, { headers: { 'Content-Type': 'application/json' } })
  return data.data;
};
const getLocationDetails = async ({ sourceHex, locationType, groupId, detailed, country, offset, limit,appdir, state }) => {
  let API = `${baseApi}?module=dues&component=corp_reports&function=corp_${locationType}&appdir=${appdir}`;
  if (groupId) API += `&groupid=${groupId}`;
  if (detailed) API += `&detailed=${detailed}`;
  if (country) API += `&country=${country}`;
  if (state) API += `&state=${state}`;
  if (limit) API += `&offset=${offset}&limit=${limit}`;
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
  getLocationDetails
};

export default ReportingAPIs;
