import React from "react";
import { Spin } from "antd";

const CommonSpinner = props => {
  const { loading, children } = props;
  return <Spin spinning={loading} tip="Loading..." >{children}</Spin>;
};

export default CommonSpinner;
