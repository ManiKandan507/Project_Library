import React from "react";
import { Spin } from "antd";

const CommonSpinner = props => {
  const { loading, children ,className} = props;
  return <Spin spinning={loading} tip="Loading..." className={className}>{children}</Spin>;
};

export default CommonSpinner;
