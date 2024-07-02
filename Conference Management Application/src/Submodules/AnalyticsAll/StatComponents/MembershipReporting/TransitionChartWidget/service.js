export const getMembersInfoByUuids = async (uuids, sourceHex) => {
    const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";
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