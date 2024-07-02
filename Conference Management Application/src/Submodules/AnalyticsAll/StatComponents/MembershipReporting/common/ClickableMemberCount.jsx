import React from 'react'
import { Col, Row } from 'antd';
import { ReactComponent as OpenInNewIcon } from "@/AnalyticsAll/NativeDashboards/MembershipReporting/assets/icons/OpenInNew.svg";

const ClickableMemberCount = ({memberType, handleClick,memberCount,color, className}) => {
  return (
    <Row className='mt-3'>
        <Col className='title' style={{ fontWeight: 100 }} >{memberType} : <a onClick={handleClick} className={`count-icon primary-color ${className}`} >{memberCount}</a></Col>
        <Col><OpenInNewIcon className='primary-color' style={{height:'65%', paddingTop:'12%'}} /></Col>
    </Row>
  )
}
export default ClickableMemberCount