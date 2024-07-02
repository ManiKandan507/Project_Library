import React from "react";
import "./App.css";
import "./assets/css/utility.min.css";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import configureStore, { history } from "./appRedux/store";

import { Provider } from "react-redux";

import ReportingPage from "./components/Reporting";

const store = configureStore(/* provide initial state if any */);

const App = ({ staticConfig }) => {
  return (
    <Provider store={store}>
        <ReportingPage  staticConfig={staticConfig} />
    </Provider>
  );
};

export default App;
