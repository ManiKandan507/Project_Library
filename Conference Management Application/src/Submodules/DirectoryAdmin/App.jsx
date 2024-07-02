import {
  Route,
  Switch,
  Redirect,
  HashRouter as Router,
} from "react-router-dom";
import { Provider } from "react-redux";

import { ConnectedRouter } from "connected-react-router";
import configureStore, { history } from "./store";
import { setAppDir, setXcdHostedURL } from "./store/actions/directory";

import MainPage from "./MainPage";
import DirectoryPage from "./DirectoryPage";
import GenerateDirectoryPage from "./GenerateDirectoryPage";
import "semantic-ui-css/semantic.min.css";
import "antd/dist/antd.css";

import "./index.css";
import "./assets/css/utility.min.css";

const store = configureStore();

const App = ({ staticConfig }) => {
  store.dispatch(setAppDir(staticConfig.appdir));
  store.dispatch(setXcdHostedURL(staticConfig.xcd_hosted_url));

  return (
    <main className="app">
      <Provider store={store}>
        <Router>
          <ConnectedRouter history={history}>
            <Switch>
              <Route
                path="/directory/:directoryUuid"
                component={DirectoryPage}
              />
              <Route path="/generate" component={GenerateDirectoryPage} />
              <Route path="/main" component={MainPage} />
              <Redirect from="/" to="/main"></Redirect>
            </Switch>
          </ConnectedRouter>
        </Router>
      </Provider>
    </main>
  );
};

export default App;
