import React from "react";
import "./App.css";
import configureStore from "./appRedux/store";

import { Provider } from "react-redux";

import CSVProcessorPage from "../../Submodules/ECommerceProductsFromCSV/components/CSVProcessor/index";

const store = configureStore(/* provide initial state if any */);

const App = ({ staticConfig }) => {
  return (
    <Provider store={store}>
        <CSVProcessorPage  staticConfig={staticConfig} />
    </Provider>
  );
};

export default App;
