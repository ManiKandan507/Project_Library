import { combineReducers } from '@reduxjs/toolkit';
import listenerReducer from './listeners/slice';
import configReducer from './config-context/slice'
import onboardReducer from './onboarding/slice'

const rootReducer = combineReducers({
  eventListeners: listenerReducer,
  configContext: configReducer,
  onboarding: onboardReducer
});

export default rootReducer;
