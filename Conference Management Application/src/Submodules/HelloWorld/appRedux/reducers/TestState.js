import {
  SUBMIT_VALUE
} from "../../constants/ActionTypes";

const INIT_STATE = {
  testValue: 'Hello World from HelloWorld submodule.'
};


export default (state = INIT_STATE, action) => {
    switch (action.type) {
      case SUBMIT_VALUE:
        return {...state, testValue: 'Updated Value'}
      default:
        return state;
    }
  }
  