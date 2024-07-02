import React from 'react'
import { TrendChartWidget } from '@/MembershipReportingV2/TrendChartWidget';

const Trend = (props) => {
    return (
        <div className='ml-6 mr-6'>
            <TrendChartWidget {...props} />
        </div>
    )
}

export default Trend