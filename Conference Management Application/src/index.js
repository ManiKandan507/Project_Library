import "./index.css";

import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import './Submodules/AnalyticsAll/NativeDashboards/ProductsAnalytics/assets/fonts/AvenirFont/AvenirLTStd-Roman.otf'
import './Submodules/AnalyticsAll/NativeDashboards/ProductsAnalytics/assets/fonts/AvenirFont/AvenirLTStd-Book.otf'
import './Submodules/AnalyticsAll/NativeDashboards/ProductsAnalytics/assets/fonts/AvenirFont/AvenirLTStd-Black.otf'

// Register a submodule.
const AppRegisters = {
  HelloWorld: React.lazy(() => import("./Submodules/HelloWorld/App")),
  JoinMailingList: React.lazy(() => import("./Submodules/JoinMailingList/App")),

  MembershipReporting: React.lazy(() =>
    import("./Submodules/MembershipReporting/App")
  ),
  ECommerceAnalytics: React.lazy(() =>
    import("./Submodules/ECommerceAnalytics/App")
  ),
  CorporateMembershipReporting: React.lazy(() =>
    import("./Submodules/CorporateMembershipReporting/App")
  ),
  Notifications: React.lazy(() => import("./Submodules/Notifications/App")),
  DirectoryAdmin: React.lazy(() => import("./Submodules/DirectoryAdmin/App")),

  MapMarker: React.lazy(() => import("./Submodules/MapMarker/App")),
  WizardConfToEcommerce: React.lazy(() =>
    import("./Submodules/WizardConfToEcommerce/App")
  ),
  ECommerceProductsFromCSV: React.lazy(() =>
    import("./Submodules/ECommerceProductsFromCSV/App")
  ),
  SyncECommerceProducts: React.lazy(() =>
    import("./Submodules/SyncECommerceProducts/App")
  ),
  AnalyticsAll: React.lazy(() =>
    import("./Submodules/AnalyticsAll/App")
  ),
  EventSystemConfig: React.lazy( () => 
    import("./Submodules/EventSystemConfig/Main")  
  )
};

const submodule = document
  .getElementById("root")
  .getAttribute("data-submodule");
const SubmoduleComponent = AppRegisters[submodule || "HelloWorld"];
const staticConfig = JSON.parse(
  document.getElementById("masterreact-config").textContent
);

ReactDOM.render(
  <React.StrictMode>
    <div data-iframe-height>
      <Suspense
        fallback={
          <main style={{ display: "flex", minHeight: "100vh" }}>
            <h4 style={{ margin: "auto", paddingBottom: "2em" }}>
              Please wait...
            </h4>
          </main>
        }
      >
        <SubmoduleComponent staticConfig={staticConfig} />
      </Suspense>
    </div>
  </React.StrictMode>,
  document.getElementById("root")
);
