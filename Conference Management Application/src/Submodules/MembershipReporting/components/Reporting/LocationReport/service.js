export const getLocationDetails = async ({ source_hex, locationType, groupId, country, state }) => {
    const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api";

    let API = `${baseApi}?module=dues&component=reports&function=${locationType}&source=${source_hex}`;

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
        }
    );
    const result = await data.json();

    return result
};