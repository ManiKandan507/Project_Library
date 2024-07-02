import React from 'react'
import CommonPieChart from '../../common/CommonPieChart';

const MembersByEducationLevel = () => {
    return (
        <div>
            <div style={{ padding: "2% 5% 2% 5%" }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }} className='font-s15' >
                    MEMBERS BY EDUCATION LEVEL
                </div>
            </div>
            <CommonPieChart />
        </div>
    )
}

export default MembersByEducationLevel;