const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";

export const getSalesActivityInfo = async (appdir, groupid, start_date, end_date) => {
    let salesInfo = await fetch(`${baseApi}?module=dues&component=reports&function=sales&appdir=${appdir}&groupid=${groupid}&start_date=${start_date}&end_date=${end_date}`);

    const response = await salesInfo.json();
    return response;
};

export const getCompareSalesInfo = async (appdir, groupid, start_date, end_date) =>{
  let compareSalesInfo = await fetch(`${baseApi}?module=dues&component=reports&function=sales_compare_to&appdir=${appdir}&groupid=${groupid}&start_date=${start_date}&end_date=${end_date}&compare_to=SAME_PERIOD_PREV_YEAR`);
  
  const response = await compareSalesInfo.json();
  return response;
}

export const getMultiYearSalesInfo = async (appdir, groupid, start_date, end_date) => {
  let multiYearSalesInfo = await fetch(`${baseApi}?module=dues&component=reports&function=sales&appdir=${appdir}&groupid=${groupid}&start_date=${start_date}&end_date=${end_date}&period=month`)

  const response = await multiYearSalesInfo.json()
  return response
}

export const getMembersInfoByUuids = async ( uuids, sourceHex ) => {
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