import React, { useEffect, useState } from 'react';
import { Col, Row, Select, Tabs } from 'antd';
import { CANADA_VIEW, CONTINENT_VIEW, COUNTRY_VIEW, PRIMARY_LOCATION_VIEWS, SECONDARY_LOCATION_VIEWS, STATE_VIEW, USA_VIEW, MAP_VIEW, TABLE_VIEW } from '@/MembershipReporting/components/Reporting/LocationReport/constants';
import Country from './views/Country';
import Continent from './views/Continent';
import State from './views/State';
import Region from './views/Region';

const { Option } = Select;

export default function LocationMap(props) {
    const {groupsid:groups_array, appdir } = props
    const { TabPane } = Tabs;

    let membersGroupValues =groups_array.map((data)=>(data?.groupname))
    const [membersGroup, setSelectedMembersGroups] = useState(membersGroupValues)
   
    const [viewMode, setViewMode] = useState(MAP_VIEW);
    const [primaryView, setPrimaryView] = useState(COUNTRY_VIEW);
    const [secondaryView, setSecondaryView] = useState(STATE_VIEW);
    const [selectedView, setSelectedView] = useState(COUNTRY_VIEW);
    const [isSecondaryViewEnabled, setSecondaryViewEnabled] = useState(false);

    const handlePrimaryViewChange = (e) => {
        setPrimaryView(e)
        if(secondaryView !== STATE_VIEW && (e === CONTINENT_VIEW || e === COUNTRY_VIEW)){
            setSecondaryView(STATE_VIEW)
        }
    };

    const handleSecondaryViewChange = (e) => setSecondaryView(e);

    useEffect(() => {
        if (primaryView === USA_VIEW || primaryView === CANADA_VIEW) {
            setSecondaryViewEnabled(true);
            setSelectedView(`${primaryView}_${secondaryView}`);
        } else {
            setSecondaryViewEnabled(false);
            setSelectedView(primaryView);
        }
    }, [primaryView, secondaryView])

    const renderGroupSelect = () => {
        return(
            <div>
                <Select
                    mode="multiple"
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="Please select"
                    value={membersGroup}
                    onChange={(groups) => setSelectedMembersGroups(groups)}
                    className='pt-4'
                >
                    {groups_array?.map((data)=>{
                        return <Option key={data.groupid} value={data?.groupname} label={data?.groupname}>{data?.groupname}</Option>
                    })}
                </Select>
            </div>
        )
    }

    const renderHeader = () => {
        return (
            <Row gutter={16} className='mt-5'>
                <Col flex={1}>
                    <div className= "float-right">
                        <Select onChange={handlePrimaryViewChange} defaultValue={primaryView} className='mx-3' style={{ width: '150px' }}>
                            {PRIMARY_LOCATION_VIEWS.map(view => <Option key={view.value} value={view.value}>{view.label}</Option>)}
                        </Select>
                        {isSecondaryViewEnabled && <Select onChange={handleSecondaryViewChange} defaultValue={secondaryView} className='mr-5 mb-3' style={{ width: '150px' }}>
                            {SECONDARY_LOCATION_VIEWS.map(view => <Option key={view.value} value={view.value}>{view.label}</Option>)}
                        </Select>}
                    </div>
                </Col>
            </Row>
        )
    }

    return (
        <div className='ml-6 mr-6' style={{ marginBottom: "40px" }}>
            <Tabs defaultActiveKey={viewMode} onChange={setViewMode}>
                <TabPane tab="Map View" key={MAP_VIEW} />
                <TabPane tab="Table View" key={TABLE_VIEW} />
            </Tabs>
            { renderGroupSelect() }
            { renderHeader() }
            {selectedView === COUNTRY_VIEW && 
                <Country {...props} viewMode={viewMode} selectedView={selectedView} membersGroup={membersGroup} /> }
            {selectedView === CONTINENT_VIEW && 
                <Continent {...props} viewMode={viewMode} selectedView={selectedView} membersGroup={membersGroup}/> }
            {(selectedView === 'CANADA_STATE_VIEW'|| selectedView === 'USA_STATE_VIEW') &&
                <State {...props} viewMode={viewMode} selectedView={selectedView} membersGroup={membersGroup}/> }
            {(selectedView === 'CANADA_REGION_VIEW'|| selectedView === 'USA_REGION_VIEW') &&
                <Region {...props} viewMode={viewMode} selectedView={selectedView} membersGroup={membersGroup}/> }
        </div>
    );
}