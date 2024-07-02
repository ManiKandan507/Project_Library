import React from "react";
import { Provider } from "react-redux";
import configureStore from "./appRedux/store";
import "./App.css";
import Notifications from './components/notifications';

const store = configureStore(/* provide initial state if any */);

const App = ({staticConfig}) => {
  return (
    <Provider store={store}>
      <Notifications staticConfig={staticConfig}/>
    </Provider>
  );
}

export default App;
