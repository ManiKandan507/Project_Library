
import {
    CREATE_POST,
    PUSH_POST,
    FETCH_POSTS,
    DELETE_POST,
    UPDATE_POST,
    SAVE_POST_ERROR,
    SET_POST_ERROR
  } from "../../constants/ActionTypes";
  
  const INIT_STATE = {
    posts: [],
    fetched: false,
    saveError: null
  };


export default (state = INIT_STATE, action) => {

  switch (action.type) {
    case CREATE_POST: {
      return {
        ...state,
        posts: [...state.posts, action.post]
      }
    }

    case FETCH_POSTS: {
      return {
        ...state,
        posts: action.payload,
        fetched: true
      };
    }

    case DELETE_POST: {
      let posts = state.posts.filter(post => post._id != action.id);
      return {
        ...state,
        posts
      };
    }

    case UPDATE_POST: {
      let posts = state.posts.map(post => {
        if(post._id == action.post._id) {
          return action.post;
        }
        return post;
      })
      return {
        ...state,
        posts
      }
    }

    case SAVE_POST_ERROR: {
      return {
        ...state,
        saveError: true
      }
    }

    case SET_POST_ERROR: {
      return {
        ...state,
        saveError: action.value
      }
    }

    default:
      return state;
  }
}
