import React from "react";
import "./App.css";
import configureStore from "./appRedux/store";

import { Provider } from "react-redux";
import SyncECommerceProducts from "../../Submodules/SyncECommerceProducts/components/SyncProducts/index";

const store = configureStore(/* provide initial state if any */);

const App = props => {
  return (
    <Provider store={store}>
      <SyncECommerceProducts staticConfig={props.staticConfig} />
    </Provider>
  );
};

export default App;
