import apis from "../api";
import { toFrontendDirectory } from "../../helpers";

let initialState = {};
for (const api of apis) {
  initialState = {
    ...initialState,
    [api.id]: api.initialValue,
    [`${api.id}_STATUS`]: "IDLE",
  };
}

export default (state = initialState, { type, payload }) => {
  for (const api of apis) {
    switch (type) {
      case `LOADING-${api.id}`:
        return {
          ...state,
          [`${api.id}_STATUS`]: "LOADING",
        };
      case `RECEIVE-${api.id}`:
        return {
          ...state,
          [api.id]: api.reducer(state, payload),
          [`${api.id}_STATUS`]: "SUCCESS",
        };
      default:
        continue;
    }
  }

  switch (type) {
    case "RECEIVE-UPDATE-DIRECTORY": {
      if (!payload.success) {
        console.error(payload.message);
        return { ...state };
      }
      const directory = toFrontendDirectory(payload.directory);
      const index = state.DIRECTORIES.findIndex(dir => dir.id === directory.id);
      const directories = [...state.DIRECTORIES];
      directories[index] = directory;
      return { ...state, DIRECTORIES: directories };
    }
    case "RECEIVE-ADD-DIRECTORY": {
      if (!payload.success) {
        console.error(payload.message);
        return { ...state };
      }
      const directory = toFrontendDirectory(payload.directory);
      return { ...state, DIRECTORIES: [...state.DIRECTORIES, directory] };
    }
    case "RECEIVE-REMOVE-DIRECTORY": {
      if (!payload.success) {
        console.error(payload.message);
        return { ...state };
      }
      const directories = payload.directories.map(toFrontendDirectory);
      return { ...state, DIRECTORIES: directories };
    }
    default:
      return state;
  }
};
