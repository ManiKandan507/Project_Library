import React from "react";
import "./App.css";
import configureStore from "./appRedux/store";

import { Provider } from "react-redux";

import WizardPage from "../../Submodules/WizardConfToEcommerce/components/Wizard/index";

const store = configureStore(/* provide initial state if any */);

const App = ({ staticConfig }) => {
  return (
    <Provider store={store}>
        <WizardPage  staticConfig={staticConfig} />
    </Provider>
  );
};

export default App;
