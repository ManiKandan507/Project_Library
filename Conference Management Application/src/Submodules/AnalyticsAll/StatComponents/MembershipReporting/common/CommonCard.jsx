import React from "react";
import { Card } from "antd";

const CommonCard = props =>{
    const {children, className} = props
    return <Card style={{boxShadow: "5px 8px 24px 5px rgba(208, 216, 243, 3.6)"}} className={className}>{children}</Card>
}
export default CommonCard;