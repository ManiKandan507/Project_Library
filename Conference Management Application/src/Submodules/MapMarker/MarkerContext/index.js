import { useState, useEffect, createContext } from "react";
import _isEmpty from "lodash/isEmpty";

import { requestMapConfigurations, saveMapConfigurations } from './api';

const MarkerContext = createContext({});

export default MarkerContext;

export const MarkerContextProvider = (props) => {
    const [loading, setLoading] = useState(true);
    const [appConfig, setAppConfig] = useState({});
    const [mapConfigurations, setMapConfigurations] = useState({});

    useEffect(() => {
        console.log('MarkerContextProvider', props);
        setAppConfig(props.staticConfig)
    }, [props.staticConfig]);

    useEffect(() => {
        if (!_isEmpty(appConfig)) {
            requestMapConfigurations(appConfig)
                .then(res => res.json())
                .then(response => {
                    setLoading(false);
                    if (response?.success) {
                        setMapConfigurations(response);
                    }
                })
                .catch(err => {
                    setLoading(false);
                    console.log('GetMapConfig-Error: ', err);
                })
        }
    }, [appConfig]);

    const handleSaveMapConfiguration = (mapConfig) => {
        saveMapConfigurations(appConfig, mapConfig)
            .then(response => response.json())
            .then(response => { console.log('Stored successfully'); })
            .catch(err => { console.log('SaveMapConfig-Error: ', err) })
    };

    return (
        <MarkerContext.Provider
            value={{
                loading,
                mapConfigurations,
                setAppConfig,
                setMapConfigurations,
                handleSaveMapConfiguration
            }}
        >
            {props.children}
        </MarkerContext.Provider>
    )
}
