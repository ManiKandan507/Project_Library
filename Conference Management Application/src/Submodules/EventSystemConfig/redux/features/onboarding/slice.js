import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conditions: {},
  actions: [],
  eventType: undefined,
  timestamp: Date.now(),
};

const listenerSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    updateConditions(state, action) {
      state.conditions = action.payload;
    },
    updateAction(state, action) {
      const { index, newAction } = action.payload;
      if (index >= 0 && index < state.actions.length) {
        state.actions[index] = newAction;
      }
    },
    addAction(state, action) {
      console.log("adding...", action.payload)
      state.actions.push({...action.payload, key: `${state.actions.length + 1}`})
    },
    updateEventType(state, action) {
      state.eventType = action.payload;
    },
    resetState(state) {
      return initialState;
    },
    resetTimestamp(state) {
      state.timestamp = Date.now();
    },
    saveListenerSuccess(state, action) {
      state.timestamp = Date.now();
      state.conditions = {};
      state.actions = [];
      state.eventType = undefined;
    },
    saveListenerFailure(state, action) {
      // state.timestamp = Date.now()
    },
  },
});

export const {
  updateConditions,
  updateAction,
  updateEventType,
  resetState,
  resetTimestamp,
  saveListenerStart,
  saveListenerSuccess,
  saveListenerFailure,
  addAction
} = listenerSlice.actions;

export default listenerSlice.reducer;
