import React from 'react';
import "antd/dist/antd.css";
import 'antd/dist/antd.variable.min.css';
import "./custom.css";
import TImeLineChart from '../../StatComponents/GroupManagement/TImeLineChart';

const GroupManagementNativeDashboard = ({ staticConfig }) => {

    const { appDir, Authorization, contact_uuid, primary_color } = staticConfig

    const options = {
        method: 'GET',
        headers: {
            'Authorization': Authorization
        }
    }

    return (
        <div>
            <TImeLineChart appDir={appDir} options={options} contact_uuid={contact_uuid} primary_color={primary_color} />
        </div>
    )
}

export default GroupManagementNativeDashboard;