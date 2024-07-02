const API_URL = 'https://www.xcdsystem.com/masterapp_summer2012/controllers/mobileapp/api/index.cfm';

export const requestMapConfigurations = (appConfig) => {
    return fetch(`${API_URL}?source=${appConfig.source}&uuid=${appConfig.uuid}&conferenceid=${appConfig.conferenceid}&method=get_map_config`)
};

export const saveMapConfigurations = (appConfig, payload) => {
    return fetch(`${API_URL}?source=${appConfig.source}&appdir=${appConfig.appdir}&uuid=${appConfig.uuid}&conferenceid=${appConfig.conferenceid}&method=save_map_config`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      },
    })
};
