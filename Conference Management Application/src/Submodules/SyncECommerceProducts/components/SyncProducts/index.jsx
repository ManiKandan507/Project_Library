import React, { useState } from "react";

import "antd/dist/antd.css";

import "./custom.css";

import MainPage from "./MainPage";

const SyncECommerceProducts = ({ staticConfig }) => {
  return (
    <div
      className="container"
      style={{ paddingBottom: "5%", paddingLeft: "3%", paddingRight: "3%" }}
    >
      <MainPage
        sourceHex={staticConfig.source_hex}
        appdir={staticConfig.appdir}
        uuid={staticConfig.uuid}
        productID={staticConfig.productID}
      />
    </div>
  );
};

export default SyncECommerceProducts;
