import { Col, Collapse, Divider, Row, Panel } from "antd"
import { useSelector } from "react-redux"
import sqlRunnerLabels from "../sqlRunnerLabels"
import Title from "antd/es/skeleton/Title"
import Actions from "../components/actions"

const ConfigurationScreen = () => {
    const typesList = useSelector(state => state.eventListeners.listeners.typesList)
    const eventTypes = useSelector(state => state.configContext.eventTypes)
    const isXCD = useSelector(state => state.configContext.isXCD)
    const styles = useSelector(state => state.configContext.styles) 

    return <Collapse style={{width:"100%"}} accordion >
        {
            typesList.map(eventType => {
                return <Collapse.Panel key={eventType} style={{backgroundColor: styles && styles.primary}} header={
                    <>
                        <b style={{color: "#FFF", fontSize:"1rem"}}>{eventTypes[eventType]["label"]} </b> 
                        {isXCD && <i> ({eventType.split("/")[1]})</i>}
                    </>
                }>
                    <ListenerUIByEventType eventType={eventType}/>
                </Collapse.Panel>
            })
        }
    </Collapse>
}
  
const ListenerUIByEventType = ({eventType}) => {
    const listenersIndex = useSelector(s => s.eventListeners.listeners.indexByType[eventType])
    return listenersIndex.map((liID, index) => <ListenerUI key={`listener_${index}`} listenerID={liID} index={index} />)
}

const ListenerUI = ({listenerID, index}) => {
    const {listenerid, conditions, actions, eventType} = useSelector(s => s.eventListeners.listeners.map[listenerID])
    const renderConditions = ({sqlRunner}) => {
        return <>
            Must pass {sqlRunner.condition == "AND" ? "all" : "one"} of the following conditions:<br/>
            <ul>
                {sqlRunner.rules.map((rule, index) => <li key={`rule_${index}`}>{sqlRunnerLabels[rule.field](rule)}</li>)}
            </ul>
        </>
    }
    
    return <>
        {index > 0 && <Divider />}
        <Row key={listenerid}>
            <Col span={24}><Title level={5} style={{marginTop: "10px"}}>Conditions</Title></Col>
            {conditions && Object.keys(conditions) > 0 && <Col span={24}>
                <div style={{overflowX:"hidden"}}>
                {renderConditions(conditions)} 
                {/* <JsonDisplay obj={}/> */}
                </div>
            </Col>}
            <Col span={24}><Title level={5} style={{marginTop: "10px"}}>Actions Triggered</Title></Col>
            <Col span={24}>
                <div>
                    <Row gutter={16} justify={"space-around"}>
                        {actions.map((actionKey, index) => <>
                            <Col key={`action_${listenerid}_${index}`} md={12} sm={12} style={{marginBottom: "30px"}}>
                                <ActionSummary
                                actionKey={actionKey}
                                />
                            </Col>
                            </>
                        )}
                    </Row> 
                </div>
            </Col>
        </Row>
    </>
}

const ActionSummary = ({actionKey}) => {
    const action = useSelector(s => s.eventListeners.listeners.actionsMap[actionKey])
    const {Summary} = Actions[action.type];
    return <Summary actionConfig={action} actionKey={actionKey} />
}

export default ConfigurationScreen