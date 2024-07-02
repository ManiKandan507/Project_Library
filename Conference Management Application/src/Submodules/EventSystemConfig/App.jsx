import { useEffect, useRef, useState } from 'react';
import { Button, ConfigProvider, Divider, Spin } from 'antd';
import {
  CheckCircleTwoTone,
  SyncOutlined,
  PlusOutlined,
  LeftOutlined
} from '@ant-design/icons';

import { useDispatch, useSelector } from 'react-redux';
import { RELOAD_LISTENERS_REQUEST } from './redux/features/listeners/actionTypes.js';
import { CONFIG_CONTEXT_REQUEST } from './redux/features/config-context/actionTypes.js';
import ConfigurationScreen from './route/ConfigurationScreen.jsx';
import NewListenerScreen from './route/NewListenerScreen.jsx';


import { CSSTransition } from 'react-transition-group';

import "./App.css"


const centerSpinner = {
  display:"flex", justifyContent:"center", alignItems: "center", 
  flexDirection:"column", height:"100%", width:"50%", padding:"25%"
}

const routes = {
  ROUTE_ONBOARD: "onboardListener",
  ROUTE_CONFIGURE: "configureListeners"
}

const App = () => {
  const dispatch = useDispatch()
  const [route, setRoute] = useState(routes.ROUTE_CONFIGURE)
  const nodeRef1 = useRef()
  const nodeRef2 = useRef()
  const loading = useRef(false);
  const firstLoad = useRef(true);

  const typesList = useSelector(state => state.eventListeners.listeners.typesList)
  const eventTypes = useSelector(state => state.configContext.eventTypes)

  const styles = useSelector(state => state.configContext.styles) 

  useEffect(() => {
    if (!typesList && !loading.current) {
      loading.current = true
      setRoute(routes.ROUTE_CONFIGURE)
      if (!typesList)  dispatch({type: RELOAD_LISTENERS_REQUEST})
      if (!eventTypes) dispatch({type: CONFIG_CONTEXT_REQUEST})
    }
  }, [typesList])

  const loadingLabel = firstLoad.current ? "Loading" : "Reloading"

  if (!typesList || !eventTypes) {
    console.log("Load State: ")
    console.log(typesList, eventTypes)
    return (
      <div style={centerSpinner}>
        <Spin style={{marginBottom: "30px"}} />
        <div style={{marginBottom: "7px"}}>
          {loadingLabel} Listeners {!typesList ? <SyncOutlined spin /> : <CheckCircleTwoTone twoToneColor="#52c41a" />}
        </div>
        <div>
          Loading Config {!eventTypes ? <SyncOutlined spin /> : <CheckCircleTwoTone twoToneColor="#52c41a" />}
        </div>
      </div>
    )
  }

  // If we make it here, loading is done.
  loading.current = false;
  firstLoad.current = false;


  // ConfigProvider.config({
  //   theme: {
  //     components: {
  //       Collapse: {
  //         colorTextHeading: "#FFFFFFFF",
  //         headerBg:styles && styles.primary,
  //         colorBorder: "#00000044"
  //       }
  //     },
  //     token: {
  //       colorPrimary: styles && styles.primary,
  //     },
  //     primaryColor: "#FFF"
  //   }
  // })



  // if (styles) {
  //   document.documentElement.style.setProperty("--ant-primary-color", styles.primary)
  // }
  




  return (
    <>
        <Navigation route={route} setRoute={setRoute} />
        <Divider style={{margin: "8px 0"}}/>
        <CSSTransition
          nodeRef={nodeRef1}
          in={route == routes.ROUTE_ONBOARD}
          timeout={300}
          classNames="fade"
          unmountOnExit
        >
          <div ref={nodeRef1} >
            <NewListenerScreen />
          </div>
        </CSSTransition>
        <CSSTransition
          nodeRef={nodeRef2}
          in={route == routes.ROUTE_CONFIGURE}
          timeout={300}
          classNames="fade"
          unmountOnExit
        >   
          <div ref={nodeRef2} > 
            <ConfigurationScreen />
          </div>
        </CSSTransition>
    </>
  );
};


const Navigation = ({route, setRoute}) => {

  const backToConfigurationLabel = useSelector(state => state.configContext.labels.onboard.backToConfiguration);
  const addActionLabel = useSelector(state => state.configContext.labels.action.singular);

  const getRouteSetup = () => {
    switch(route) {
      case routes.ROUTE_ONBOARD:
        return [LeftOutlined, "flex-start", backToConfigurationLabel, routes.ROUTE_CONFIGURE]
      case routes.ROUTE_CONFIGURE:
        return [PlusOutlined, "flex-end", `Add ${addActionLabel}`, routes.ROUTE_ONBOARD]
      default:
        return [LeftOutlined, "flex-start", backToConfigurationLabel, routes.ROUTE_CONFIGURE]
    }
  }

  const [Icon, flexJustify, label, newRoute] = getRouteSetup()
  
  return (
    <div style={{display: "flex", justifyContent: flexJustify, margin: "7px 10px"}}>
      <Button 
        type="primary"
        onClick={() => setRoute(newRoute)}
      >
        <Icon/>{label}
      </Button>
    </div>

  )
}

export default App
