import {
  PUSH_POST,
  CREATE_POST,
  UPDATE_POST,
  DELETE_POST,
  FETCH_POSTS,
  SET_POST_ERROR,
} from "../../constants/ActionTypes";

export const createPostAction = (post) => {
  return {
    type: CREATE_POST,
    post,
  };
};

export const updatePostAction = (post) => {
  return {
    type: UPDATE_POST,
    post,
  };
};

export const setPostError = (value) => {
  return {
    type: SET_POST_ERROR,
    value,
  };
};

export const deletePostAction = (id) => {
  return {
    type: DELETE_POST,
    id,
  };
};

export const fetchPostsSuccess = (payload) => {
  return {
    type: FETCH_POSTS,
    payload,
  };
};
