import React from 'react'
import { TransitionChartWidget } from '@/MembershipReportingV2/TransitionChartWidget';

const Transition = (props) => {
    return (
        <div className='ml-6 mr-6'>
            <TransitionChartWidget {...props} />
        </div>
    )
}

export default Transition