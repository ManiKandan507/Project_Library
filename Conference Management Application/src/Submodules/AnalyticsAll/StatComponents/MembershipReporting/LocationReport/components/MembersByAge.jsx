import React from 'react'
import { ResponsivePie } from '@nivo/pie';
import CommonPieChart from '../../common/CommonPieChart';

const MembersByAge = () => {

    return (
        <div>
            <div style={{ padding: "2% 5% 2% 5%" }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }} className='font-s15' >
                    MEMBERS BY AGE
                </div>
            </div>
            <CommonPieChart />
        </div>
    )
}

export default MembersByAge;