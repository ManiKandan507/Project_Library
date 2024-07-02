const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";

export const getSalesActivityInfo = async (appdir, groupid, start_date, end_date) => {
    let salesInfo = await fetch(`${baseApi}?module=dues&component=corp_reports&function=corp_sales&appdir=${appdir}&groupid=${groupid}&start_date=${start_date}&end_date=${end_date}`);

    const response = await salesInfo.json();
    return response;
};

export const getMembersInfoByUuids = async ( uuids, appdir ) => {
  let API =  `${baseApi}?module=company&component=company_profile&function=FetchDetails&appdir=${appdir}`;
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