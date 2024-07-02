import MapContainer from "./MapContainer";
import { MarkerContextProvider } from "./MarkerContext";

import "antd/dist/antd.css";
import "./index.css";

const App = ({ staticConfig }) => {
  return (
    <MarkerContextProvider staticConfig={staticConfig}>
      <main className="app">
        <MapContainer staticConfig={staticConfig} />
      </main>
    </MarkerContextProvider>
  );
};

export default App;
