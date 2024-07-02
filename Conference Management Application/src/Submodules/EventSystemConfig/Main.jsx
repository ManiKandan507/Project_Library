import App from './App.jsx'
import './index.css'
import store from './redux/index.js'; // Import your configured store
import { Provider } from "react-redux";
import { ConfigProvider } from "antd"
import "./assets/css/utility.min.css";
import "antd/dist/antd.css"


const Main = ({ staticConfig }) => {
  if ( !window.appSlug ){
    window.appSlug = staticConfig.appSlug;
  }

  return (
      <Provider store={store}>
        <div style={{width:"100%", display:"flex", alignItems:"center", flexDirection:"column"}} >
          <div style={{maxWidth:"800px", width:"100%"}}>
              <App />
          </div>
        </div>
      </Provider>
  );
};

export default Main;
