import React from 'react'
import { TrendChartWidget } from '@/CorporateMembershipReportingV2/TrendChartWidget';

const Trend = (props) => {
    return (
        <div className='ml-6 mr-6'>
            <TrendChartWidget {...props} />
        </div>
    )
}

export default Trend