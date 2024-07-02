import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

export const configContextSlice = createSlice({
  name: 'configContext',
  initialState,
  reducers: {
    updateConfigContext: (state, action) => {
      return action.payload; // Replace the whole object
    }
  },
});

// Export the action
export const { updateConfigContext } = configContextSlice.actions;

// Export the reducer
export default configContextSlice.reducer;