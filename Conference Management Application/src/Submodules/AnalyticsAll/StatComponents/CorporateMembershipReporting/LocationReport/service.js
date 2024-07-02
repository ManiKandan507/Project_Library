export const getLocationDetails = async ({ appdir, locationType, groupId, country, state, signal }) => {
    const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";

    let API = `${baseApi}?module=dues&component=corp_reports&function=corp_${locationType}&appdir=${appdir}`;
    
    if (groupId) {
        API += `&groupid=${groupId}`
    }
    if (country) {
        API += `&country=${country}`
    }
    if (state) {
        API += `&state=${state}`
    }
    const data = await fetch(
        API,
        {
            method: "GET",
            signal
        }
    );
    const result = await data.json();

    return result
};