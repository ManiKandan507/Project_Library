import {all, call, fork, put, select, takeEvery, takeLatest} from "redux-saga/effects";
import {GET_ALL_SESSION} from '../../constants/ActionTypes';
import {fetchSesssionsSuccess} from '../actions/Session';

const moment = require("moment-timezone");

let base_api = "https://pe97nxhj35.execute-api.us-east-2.amazonaws.com/dev2/";

const getSessions = async (config) => {
    let key = `${config.source_hex}_${config.conferenceid}_sessions`;
    let localSessions = null;

    if(process.env.NODE_ENV === "development" && process.env.REACT_APP_ENABLE_CACHE === "true") {
        localSessions = localStorage.getItem(key);
    }

    if(!localSessions) {

        var requestOptions = {
          method: 'GET',
          headers: {
            Origin: window.location.origin,
          },
          redirect: 'follow',
          mode: 'cors'
        };
        let apiPostFix = '';
        if(config.cacheDelta) {
            apiPostFix = `?cacheDelta=${config.cacheDelta}`;
        }
        let sessionFetchURL = `https://o37bexji28.execute-api.us-east-2.amazonaws.com/dev3/sessionlight/${config.source_hex}/${config.conferenceid}`;
        let tmp_session = await fetch(sessionFetchURL, requestOptions).then(response => response.json());
        tmp_session =  await fetch(tmp_session.json.replace("xcdtransport2.s3.amazonaws.com", "dk5g91ae1kz5.cloudfront.net"), requestOptions).then(response => response.json());
        if (typeof localStorage !== 'undefined') {
            if(process.env.NODE_ENV === "development" && process.env.REACT_APP_ENABLE_CACHE === "true") {
                localStorage.setItem(key, JSON.stringify(tmp_session));
            }

        }
        return tmp_session;
    } else {
        return  JSON.parse(localSessions);
    }
}

export const createHashKeyForFavorite = (obj) => {
    let entity_id;
    if(obj.type == "abstract") {
        entity_id = obj.ab_id
    } else if(obj.type == "session"){
        entity_id = obj.session_id
    } else if(obj.type == "program") {
        entity_id = obj.program_id
    }
    return `${obj.type}_${entity_id}`;
  }


function* generateObjectSet(objects) {
    let objectSet = {};
    objectSet = {...yield generateSessionHM(objects)};
    
    return objectSet;
}


function* generateSessionHM(objects) {
    let sessionHM = {};
    objects.map(obj => {
         let new_obj = obj;
        sessionHM[new_obj._id] = new_obj;
    });
    return {sessions: sessionHM};
}


function patchSessions(sessions, config) {
   let hashMap = {};
   let newSessions = sessions.map((obj) => {
       if(config.abstract_strip_html) {
           if(obj.title) {
                obj.title = obj.title.replace(/<(?!\s*\/?(i)\b)[^>]+>/ig,"");
           }
           if(obj.description) {
                obj.description = obj.description.replace(/<(?!\s*\/?(i)\b)[^>]+>/ig,"");
           }
       }

       if(sessions.filter((obj2)=>obj2.session_id === obj.session_id && obj2.type === "session").length == 0 && obj.type === "abstract") {
           obj.type = "session";
       }
       if(obj.live_config_object && obj.live_config_object.access_day_only) {
           let parent = sessions.find((obj2) => obj2.type === "session" && obj2.session_id == obj.session_id);
           if(parent) {
               obj.parent_start = parent.start_time_unix;
           }
       }

       hashMap[`${obj["type"]}_${obj["type"] === "session" ? obj["session_id"] : obj["type"] === "abstract" ? obj["ab_id"] : obj["program_id"]}`] = obj["_id"];

       return obj;
   });
   return {
       "hashMap": hashMap,
       "sessions": sessions
    };
}

const getSessionsWithItinerary = async (config) => {
    let url = `https://fiofx1j22g.execute-api.us-east-2.amazonaws.com/test2/favorite?source_hex=${config.source_hex}&conference_id=${config.conferenceid}&entity_type=session`;
    
    let tmp_itineraries = await fetch(url).then(response => response.json());
    if(tmp_itineraries.data){
        const uniqueSessionIds = [...new Set( tmp_itineraries.data.map(obj => obj._id.entity_id)) ];
        return uniqueSessionIds;
    }
    return ([]);
}

function* itineraryIdsHM(ids, sessions) {
    let hm = {};
    if(ids?.length>0){
        ids.map((id)=>{
            let session = sessions.filter(session => id.includes(session.session_id) && session.type=="session")[0];
            if(session){
                hm[session.session_id] = session;
            }
        });
    }
    return hm;
}

function* generateTargetSet(itinerary, groups, config) {
    let objectSet = {};
    objectSet['itinerary'] = itinerary;
    objectSet['groups'] = groups;
    return objectSet;
}

const getUserGroups = async (config) => {
    let url = `https://masterapp.econference.io/masterapp_summer2012/apiv2/index.cfm?source=${config.source_hex}&module=client&component=groups&function=see_customer_groups`;
    let tmp_groups = await fetch(url).then(response => response.json());
    return (tmp_groups);
}

function* groupIdsHM(groups, sessions) {
    let hm = {};
    if(groups?.length>0){
        groups.map((group)=>{
            hm[group.group_id] = group;
        });
    }
    return hm;
}

function* fetchSessionRequest(action) {
    try {
        let result = yield getSessions(action.config);
        result = yield patchSessions(result, action.config);
        result  = result["sessions"];

        const itineraryIds = yield getSessionsWithItinerary(action.config);
        const itineraryIdHM = yield itineraryIdsHM(itineraryIds, result);

        const groupIds = yield getUserGroups(action.config);
        const groupIdHM = yield groupIdsHM(groupIds, result);

        const objectSet = {...yield generateObjectSet(result), ...yield generateTargetSet(itineraryIdHM, groupIdHM, action.config)};
        
        yield put(fetchSesssionsSuccess(objectSet));

    } catch (error) {
        console.log(error);
        yield put(fetchSesssionsSuccess([]));
    }
  }


export function* actionWatcher() {
    yield takeLatest(GET_ALL_SESSION, fetchSessionRequest);
}


export default function* rootSaga() {
    yield all([fork(actionWatcher)]);
}
