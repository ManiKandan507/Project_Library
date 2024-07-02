// DEV
// const BASE_URL = 'http://localhost/masterapp_summer2012/event_system/front-end/api.cfm';
// PROD
const BASE_URL = "https://xcdsystem.com/masterapp_summer2012/event_system/front-end/api.cfm"


function createQueryString(params) {
  return Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

async function makeRequest(method, data, queryObj = {}) {
  const queryString = createQueryString(queryObj);
  const url = `${BASE_URL}?method=${method}${queryString ? `&${queryString}` : ''}`;

  const fetchOptions = {
    method: 'GET',
  };

  if (data !== undefined) {
    fetchOptions.headers = { 'Content-Type': 'application/json' };
    fetchOptions.body = JSON.stringify(data);
    fetchOptions.method = 'POST';
  }

  let response = await fetch(url, fetchOptions);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  response = await response.json()

  if (!response.success) {
    throw new Error(`API error`)
  }

  return response.data
}

export async function updateAction(actionConfig, queryObj) {
  const method = 'updateAction';
  return makeRequest(method, actionConfig, queryObj);
}

export async function updateConditions(listenerId, newConditions, queryObj) {
  const method = 'updateConditions';
  return makeRequest(method, { listenerId, newConditions }, queryObj);
}

export async function updateEventType(listenerId, newEventType, queryObj) {
  const method = 'updateEventType';
  return makeRequest(method, { listenerId, newEventType }, queryObj);
}

export async function reloadListeners() {
  const method = 'reloadListeners';
  const queryObj = {appSlug: window.appSlug};
  return makeRequest(method, undefined, queryObj);
}

export async function fetchConfigContext() {
  const method = 'getConfigContext';
  const queryObj = {appSlug: window.appSlug};
  return makeRequest(method, undefined, queryObj);
}

export async function submitListener(listenerConfig) {
  const method = "addListener"
  const queryObj = {appSlug: window.appSlug}
  return makeRequest(method, listenerConfig, queryObj)
}


export async function updateActionTestingConfig({testModeEnabled, testModeAdminEmail, actionKey}) {
  const method = "updateActionTestingConfig"
  const queryObj = { appSlug: window.appSlug, actionKey }
  const body = { testModeEnabled, testModeAdminEmail }
  return makeRequest(method, body, queryObj)
}