import React from 'react'

const MembersByLocation = ({ RenderMap,renderButton, ...rest }) => {
    console.log('hai :>> ',);
    return (
        <div>
            <div>
                <div style={{ padding: "2% 5% 2% 5%" }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px' }} className='font-s15' >
                        MEMBERS BY LOCATION
                    </div>
                   {renderButton()}
                </div>
                {/* <div>
                    <RenderMap {...rest} />
                </div> */}
            </div>
        </div>
    )
}

export default MembersByLocation