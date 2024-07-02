export const getMembersInfoByUuids = async (uuids, appdir, start_date, end_date) => {
    const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";
    let API = `${baseApi}?module=company&component=company_profile&function=FetchDetails&appdir=${appdir}&start_date=${start_date}&end_date=${end_date}`;
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