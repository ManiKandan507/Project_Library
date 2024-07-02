import _ from "lodash";
import { fetchError } from "../actions/common";
import moment from "moment";
import React from "react";
import fcm from './PushApi';

import {
  createPostAction,
  updatePostAction,
  setPostError,
  deletePostAction,
  fetchPostsSuccess,
} from "../actions/Post";

import {fetchSettings} from "../actions/Settings";

function encodeQueryData(data) {
  const ret = [];
  for (let d in data)
    ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
  return ret.join("&");
}

export const getSettings = (config) => async (dispatch) => {
  let url = `https://masterapp.econference.io/masterapp_summer2012/controllers/mobileapp/settings/process_v2.cfm?source=${config.source_hex}&conferenceid=${config.conferenceid}&nativeapp=true&token_fetch=xcdRanPP123`
  return fetch(url
  ).then((response) => response.json())
  .then(result => {
    dispatch(fetchSettings(result));
  })
};

const deletePostRequest = async (payload) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  var requestOptions = {
    method: "DELETE",
    redirect: "follow",
    headers: myHeaders,
    body: JSON.stringify(payload),
  };
  return fetch(
    `https://lag2r3gpz4.execute-api.us-east-2.amazonaws.com/dev/feed`,
    requestOptions
  ).then((response) => response.json());
};

const createPostRequest = async (payload) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  var requestOptions = {
    method: "POST",
    redirect: "follow",
    headers: myHeaders,
    body: JSON.stringify(payload),
  };
  return fetch(
    `https://lag2r3gpz4.execute-api.us-east-2.amazonaws.com/dev/feed`,
    requestOptions
  ).then((response) => response.json());
};

const updatePostRequest = async (payload) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  var requestOptions = {
    method: "PUT",
    redirect: "follow",
    headers: myHeaders,
    body: JSON.stringify(payload),
  };
  return fetch(
    `https://lag2r3gpz4.execute-api.us-east-2.amazonaws.com/dev/feed/${payload._id}`,
    requestOptions
  ).then((response) => response.json());
};

const fetchPostsRequest = async (feedContext) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };
  return fetch(
    `https://lag2r3gpz4.execute-api.us-east-2.amazonaws.com/dev/feed?${encodeQueryData(
      feedContext
    )}`,
    requestOptions
  ).then((response) => response.json());
};

const scheduleNotification = (payload) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify(payload);

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("https://bm6uvz69il.execute-api.us-east-1.amazonaws.com/dev/api?module=notifications&component=mobile&function=schedule_notification", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

export const publish = (payload) => async (dispatch, getState) => {
  try {
    dispatch(setPostError(null));
    const config = payload.config;
    let postObj = payload.item;
    var raw = JSON.stringify({
      topic: `webinar_app_${config.source_hex}_${config.conferenceid}`,
      message: { ...postObj, type: "instant_notification" },
    });
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    await fetch("https://applevelsocket.econference.io/notify", requestOptions);
    dispatch(setPostError(false));
  } catch (error) {
    dispatch(setPostError(true));
  }
};




export const createPost = (payload) => async (dispatch, getState) => {
  const config = payload.config;
  try {
    dispatch(setPostError(null));
    const post = await createPostRequest({
      source_hex: config.source_hex,
      conference_id: config.conferenceid,
      post_object: payload.item,
    });
    if(payload.item.type == 'scheduled' && (payload.item.platform == 'mobile_and_web' || payload.item.platform == 'mobile' || payload.item.notificationTarget == 'all_app_users')) {
      let sendingObj = {
        'ts': payload.item.startTime,
        'feed_id': post._id,
        'payload': payload
      };
      scheduleNotification(sendingObj);
    }
    if (post.post_object?.type === "instant") {
      post["actualFireTS"] = moment(post.updatedAt).valueOf();
    }
    else{
      post["actualFireTS"] = post.post_object?.startTime;
    }
    dispatch(createPostAction(post));
    dispatch(setPostError(false));
  } catch (error) {
    dispatch(setPostError(true));
    dispatch(fetchError(error));
  }
};

export const updatePost = (payload) => async (dispatch, getState) => {
  //const config = _.get(getState(), "auth.config");
  const config = payload.config;
  try {
    dispatch(setPostError(null));
    let postObject = {
      _id: payload.item._id,
      source_hex: config.source_hex,
      conference_id: config.conferenceid,
      post_object: payload.item,
    };
    if (postObject.post_object?.type === "instant") {
      postObject["actualFireTS"] = moment(postObject.updatedAt).valueOf();
    }
    else{
      postObject["actualFireTS"] = postObject.post_object?.startTime;
    }

    if(payload.item.type == 'scheduled' && (payload.item.platform == 'mobile_and_web' || payload.item.platform == 'mobile' || payload.item.notificationTarget == 'all_app_users')) {
      let sendingObj = {
        'ts': payload.item.startTime,
        'feed_id': payload.item._id,
        'payload': payload
      };
    scheduleNotification(sendingObj);
    }
    const post = await updatePostRequest(postObject);
    dispatch(updatePostAction(postObject));
    dispatch(setPostError(false));
  } catch (error) {
    dispatch(setPostError(true));
    dispatch(fetchError(error));
  }
};

export const deletePost = (payload) => async (dispatch, getState) => {
  try {
    const post = await deletePostRequest({
      source_hex: payload.source_hex,
      conference_id: payload.conferenceid,
      _id: payload.id,
    });

    let sendingObj = {
      'ts': 999999999999,
      'feed_id': payload.id,
      'payload': {}
    };
  
    scheduleNotification(sendingObj);
    dispatch(deletePostAction(payload.id));
  } catch (error) {
    dispatch(fetchError(error));
  }
};

export const getPosts = (payload) => async (dispatch, getState) => {
  const postsContext = {
    source_hex: payload.source_hex,
    conference_id: payload.conferenceid,
  };
  try {
    const isFetched = false;
    if (!isFetched) {
      const posts = await fetchPostsRequest(postsContext);
      let postData = posts.data.map(post => {
        if (post?.post_object?.type === "instant") {
          post["actualFireTS"] = moment(post.updatedAt).valueOf();
          return {...post}
        }
        else{
          post["actualFireTS"] = post.post_object?.startTime;
          return {...post}
        }
      })
      dispatch(fetchPostsSuccess(postData));
    }
  } catch (error) {
    dispatch(fetchError(error));
  }
};

const getTopicBatches = (targetArray) => {

  var perChunk = 5 // items per chunk    
  var result = targetArray.reduce((resultArray, item, index) => { 
    const chunkIndex = Math.floor(index/perChunk);

    if(!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [] // start a new chunk
    }
    resultArray[chunkIndex].push(item);
    return resultArray
  }, [])
  return result;
}

export const pushMobileNotification = (payload) => async (dispatch, getState) => {
  const notificationObj = {
    title: payload.item.title,
    body: payload.item.shortMessage,
  };
  let serverKey = payload.config.server_key;
  let item = payload.item;
  
  try {
    if(item.notificationTarget=='app_users_by_group' || item.notificationTarget=='conference_participants_by_itinerary'){
     
      let batches = getTopicBatches(item.notificationTargetValues);
      for(let i=0; i<batches.length; i++){
        let condition='';
        for(let j=0; j<batches[i].length; j++){
          condition += `${j>0?' || ':''}'${payload.config.source_hex}_${item.notificationTarget=='app_users_by_group'?'group':'sessionid'}_${batches[i][j]}' in topics`
        }
        fcm.sendPushToTopic(serverKey, payload.topic, notificationObj, false, condition)
        .then(json => {
          //console.log(json);
        })
        .catch((err) => {
          //console.log(err);
          dispatch(fetchError(err));
        });
      }
    }
    else{
      fcm.sendPushToTopic(serverKey, payload.topic, notificationObj)
      .then(json => {
        //console.log(json);
      })
      .catch((err) => {
        //console.log(err);
        dispatch(fetchError(err));
      });
    }
    
    
  } catch (error) {
    dispatch(fetchError(error));
  }
};
