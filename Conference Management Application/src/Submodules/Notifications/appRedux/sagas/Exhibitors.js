import {all, call, fork, put, takeEvery, takeLatest} from "redux-saga/effects";
import {fetchExhibitorsSuccess} from '../actions/Exhibitors';

import {FETCH_EXHIBITORS} from '../../constants/ActionTypes';
import {fetchError} from "../actions/common";


function encodeQueryData(data) {
  const ret = [];
  for (let d in data)
    ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
  return ret.join('&');
}

const fetchExhibitorsRequest = async (feedContext) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  var requestOptions = {
      method: 'GET',
      redirect: 'follow'
  };
  return fetch(`https://masterapp.econference.io/masterapp_summer2012/apiv2/index.cfm?${encodeQueryData(feedContext)}`, requestOptions)
      .then(response => response.json());
}


const getExhibitos = async(config) => {
  const exhibitorsContext = {
      appdir: config.appdir,
      module: 'company',
      component: 'exhibitor_directory',
      function: 'list_companies',
      conferenceid: config.conferenceid
  };
  try {
    const exhibitors = await fetchExhibitorsRequest(exhibitorsContext);
    return exhibitors;
  } catch (error) {
    console.log(error)
  }
}

function* getApiData(action) {
  try {
    let data = yield (getExhibitos(action.payload));
    yield put(fetchExhibitorsSuccess(data));
  } catch (error) {
    yield put(fetchError(error));
  }
}

export function* fetchExhibitors() {
  yield takeLatest(FETCH_EXHIBITORS, getApiData);
}

export default function* rootSaga() {
  yield all([fork(fetchExhibitors)]);
}

