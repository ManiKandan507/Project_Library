export const getLocationDetails = async ({ source_hex, locationType, groupId, country, state, signal }) => {
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
            signal
        }
    );
    const result = await data.json();

    return result
};

const baseApi = "https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev//api";

export const getDemographicsConfig = async(appdir) => {
    let API = `${baseApi}?module=dues&component=reports&function=get_demographic_config&appdir=${appdir}&conferenceid=612`;

    const data = await fetch(API);
    const response = await data.json();
    return response
}

export const updateDemographicsConfig = async (appdir, configData) => {

    let API = `${baseApi}?module=dues&component=reports&function=set_demographic_config&appdir=${appdir}&conferenceid=612`;

    const data = await fetch(API,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "config": configData })
        })
    const response = await data.json()
    return response

}

export const getCustomFieldData = async (source_hex, groupId, customFields) => {

    const API = `${baseApi}?module=dues&component=reports&function=getMemberDetails&source=${source_hex}&groupid=${groupId}&fields=${customFields}`;

    const data =  await fetch(API)
    const response = await data.json()
    return response

}