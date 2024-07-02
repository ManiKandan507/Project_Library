exports.stringToColour = str => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += ("00" + value.toString(16)).substr(-2);
  }
  return colour;
};
exports.generateRandomString = length => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
exports.IsJsonString = str => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return JSON.parse(str);
};

exports.detectProductType = configJSON => {
  const parsedConfigJSON =
    configJSON && this.IsJsonString(configJSON)
      ? this.IsJsonString(configJSON)
      : null;
  if (
    parsedConfigJSON &&
    (parsedConfigJSON.session_id || parsedConfigJSON.abid)
  ) {
    //This is session or abstract

    if (parsedConfigJSON.session_id && !parsedConfigJSON.abid) {
      //It is a Session product
      return "session";
    } else {
      //It is abstract product
      return "abstract";
    }
  } else if (
    parsedConfigJSON &&
    (parsedConfigJSON.conferenceid || parsedConfigJSON.ConferenceID)
  ) {
    // This is a conference product
    // Skip syncing the configJSON for conference product
    return "conference";
  } else if (parsedConfigJSON && parsedConfigJSON.merged) {
    // This has multiple session configs under "merged". This is a custom bundle
    return "bundle";
  } else {
    // Product has been added manually/CSV Import
    // Skip syncing as we don't have respective session/abstract ID for mongo.cfm
    return "unknown";
  }
};
