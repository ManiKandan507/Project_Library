import { createSlice, current } from '@reduxjs/toolkit';

const initialState = {
  listeners: {}, // Assuming your state structure includes a listeners object
  loading: false,
  testModeAdminEmail: null,
  testModeTimestamp: Date.now(),
  testModeActionKey: null
};

const preProcessListeners = (listeners) => {
  
  const actionsMap = {}
  const map = listeners.reduce((acc, listener) => {
    acc[listener.listenerid] = {
      eventType: listener.eventtype,
      conditions: listener.conditionsjson,
      actions: listener.actionsjson.map((action) => {
        actionsMap[action.key] = {...action, timestamp: Date.now()}
        return action.key
      })
    }
    return acc
  }, {})

  const typesList = []
  const indexByType = listeners.reduce((acc, li) => {
    if (!acc[li.eventtype]) {
      acc[li.eventtype] = []
      typesList.push(li.eventtype)
    }
    acc[li.eventtype].push(li.listenerid)
    return acc
  }, {})
  
  typesList.sort((a,b) => a.localeCompare(b))

  const result = {map, indexByType, typesList, actionsMap}

  return result

}

export const listenerSlice = createSlice({
  name: 'eventListeners',
  initialState,
  reducers: {
    // Handle successful update of an individual action
    actionUpdateSuccess: (state, action) => {
      const { actionKey, newActionConfig } = action.payload;
      state.listeners.actionsMap[actionKey] = {...newActionConfig, timestamp: Date.now(), key: actionKey}
    },
    // Handle successful update of the whole conditions object
    conditionsUpdateSuccess: (state, action) => {
      const { listenerId, newConditions } = action.payload;
      if (state.listeners[listenerId]) {
        state.listeners[listenerId].conditions = newConditions;
      }
    },
    // Handle successful update of the event type
    eventTypeUpdateSuccess: (state, action) => {
      const { listenerId, newEventType } = action.payload;
      if (state.listeners[listenerId]) {
        state.listeners[listenerId].eventType = newEventType;
      }
    },
    // Handle successful reload of the entire set of listeners
    listenersReloadSuccess: (state, action) => {
      state.listeners = preProcessListeners(action.payload);
      for (const [actionKey, action] of Object.entries(state.listeners.actionsMap)) {
        if (action.testModeAdminEmail) {
          state.listeners.testModeAdminEmail = action.testModeAdminEmail
          break;
        }
      }
    },

    // For reloading listeners
    resetListeners: (state) => {
      state.listeners = {};
    },

    setLoading: (state, action) => {
      state.loading = action.payload
    },

    updateActionTestingConfigRequest: (state, {payload}) => {
      state.testModeActionKey = payload.actionKey
      if (payload.enabled) {
        state.testModeAdminEmail = payload.testModeAdminEmail
      }
    },

    actionTestingConfigUpdateResponse: (state, { payload: {success, testModeEnabled, testModeAdminEmail, actionKey}}) => {
      if (success) {
        // Update the action properties
        state.listeners.actionsMap[actionKey] = {
          ...state.listeners.actionsMap[actionKey],
          testModeEnabled,
          testModeAdminEmail
        }
      }
      // Tells the interface that the result has been received (success or fail)
      state.testModeTimestamp = Date.now()
      state.testModeAdminEmail = testModeAdminEmail
    }
  },
});

// Export actions
export const { actionUpdateSuccess, conditionsUpdateSuccess, eventTypeUpdateSuccess, listenersReloadSuccess, resetListeners, setLoading, actionTestingConfigUpdateResponse, updateActionTestingConfigRequest } = listenerSlice.actions;

// Export reducer
export default listenerSlice.reducer;