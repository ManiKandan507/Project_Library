import React, { } from 'react';
import { Card } from "antd";
import { useDispatch } from 'react-redux';
import { RightOutlined } from '@ant-design/icons';

import { requestMenuChange } from '../../../appRedux/actions';


const CardWrapper = ({ title = '', children, activeTab = 'home', isNavigation = true, className, secondaryClass }) => {
    const dispatch = useDispatch();

    const handleNavigation = () => {
        dispatch(requestMenuChange({
            screen: activeTab,
        }))
    }

    return (
        <Card className={`card-container ${className ?? ''} ${secondaryClass ?? ''}`}>
            <div className='flex-container card-header'>
                <div>{title}</div>
                {isNavigation
                    ? <RightOutlined onClick={handleNavigation} style={{ fontSize: 20 }} />
                    : null
                }
            </div>
            {children}
        </Card>
    )
}

export default CardWrapper;