import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Col, message, Row, Select, Spin, Steps } from 'antd';
import Modal from '../components/actions/SendEmailNotification/Modal';
import Actions from "../components/actions"
import { useDispatch, useSelector } from 'react-redux';
import Title from 'antd/es/typography/Title';
import useDelayedActionTimer from '../hooks/useDelayedActionTimer';
import { ADD_ACTION, SAVE_LISTENER_START, UPDATE_EVENT_TYPE } from '../redux/features/onboarding/actionTypes';
import { RESET_LISTENERS } from '../redux/features/listeners/actionTypes';
import { resetListeners } from '../redux/features/listeners/slice';
import { addAction, updateEventType } from '../redux/features/onboarding/slice';


const NewListenerScreen = () => {
  const labels = useSelector(state => state.configContext.labels.onboard);

  const steps = [
    {
        title: labels.step1,
        content: (props) => <Page1 {...props} />,
    },
    {
        title: labels.step2,
        content: (props) => <Page2 {...props} />,
    },
    {
        title: labels.step3,
        content: (props) => <Page3 {...props} />,
    },
    {
        title: 'Save',
        content: (props) => <Page4 {...props} />
    }
  ];
    
  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
  }));


  const [formValues, setFormValues] = useState({
    eventType: "",
    actions: [],
    conditions: {}
  })
  const [validated, setValidated] = useState(false)

  const [current, setCurrent] = useState(0);
  
  const next = () => {
    setCurrent(current + 1);
    setValidated(false)
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const contentStyle = {
    textAlign: 'center',
    border: `1px dashed #FFFFFF`,
    height: "100%",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center"
  };

  const StepDisplay = steps[current].content;

  return (
    <>
      <div style={{margin: "8px"}}>
        <Row>
            <Col sm={8} md={8} lg={6} style={{display:"flex", flexDirection:"column", justifyContent:"space-between", alignItems:"center", paddingLeft:"5px", width: "100%"}}>
                <Steps current={current} items={items} direction={"vertical"} style={{marginTop:"15%"}}  />
                <div style={{ marginTop: 24, display:"flex", justifyContent:"space-around" }}>
                    {current > 0 && (
                        <Button style={{ margin: '0 8px', }} onClick={() => prev()}>
                            Previous
                        </Button>
                    )}
                    {current < steps.length - 1 && (
                        <Button type="primary" disabled={!validated} onClick={() => next()}>
                            Next
                        </Button>
                    )}
                    {current === steps.length - 1 && (
                        <Button type="primary" disabled={!validated} onClick={() => message.success('Processing complete!')}>
                            Done
                        </Button>
                    )}
                    
                </div>
            </Col>
            <Col sm={16} md={16} lg={18}>
                <div style={contentStyle}>
                    <StepDisplay setValidated={setValidated} />
                </div>
            </Col>
        </Row>
      </div>
    </>
  );
};

const remapOptions = (eventTypes) => 
    Object.entries(eventTypes).map(([type, {label}], _) => {
        return {
            label: label, 
            value: type
        }
    })

const Page1 = ({setValidated}) => {
    const eventTypes = useSelector(s => s.configContext.eventTypes)
    const eventType = useSelector(s => s.onboarding.eventType)
    const dispatch = useDispatch()

    const onChange = (value) => dispatch(updateEventType(value))

    const validate = () => setValidated(eventType && eventType.length > 0)

    useDelayedActionTimer(validate, 250, [eventType]) // Debounce Validation

    const renderOption = ({label, value}) => <div key={value} style={{display:"flex", justifyContent:"center"}}>{label}</div>

    const options = useMemo(() => remapOptions(eventTypes), [eventTypes])

    return <div style={{display:"flex", flexDirection:"column"}}>
        <div>
            <Select
                placeholder="Event Type"
                onChange={onChange}
                options={options}
                size="large"
                style={{minWidth:"300px"}}
                optionRender={renderOption}
                value={eventType}
            />
        </div>
    </div>
}

const Page2 = ({setValidated}) => {
    useEffect(() => setValidated(true), [])
    return <div style={{display:"block"}}>
        <Title level={5}>Coming Soon</Title>
        <p>For now, all events of this type will trigger an action.</p>
        <i>(If you aren't sure what this means, you can ignore it for now.)</i>
    </div>
}

const actionsStyle = {
    display:"flex",
    flexDirection: "column",
    justifyContent:"space-around",
    alignItems: "center",
    width: "100%",
    maxHeight: "500px"
}

const Page3 = ({setValidated}) => {
    const closeTimeout = useRef(null)
    const dispatch = useDispatch()
    
    const {eventTypes, actionTypes} = useSelector( s => s.configContext)
    const eventType = useSelector(s => s.onboarding.eventType)
    const actions = useSelector(s => s.onboarding.actions)
    const {userOptions, hotkeys} = eventTypes[eventType]
    const hotkeysRefactored = hotkeys.map( hk => {return {hint: hk.hint, name: hk.label}})
    
    // To keep a draft
    const [tempActionConfig, setTempActionConfig] = useState(undefined)

    const validate = () => setValidated(actions && actions.length > 0)
    
    useDelayedActionTimer(validate, 250, [actions])

    const startNewAction = () => setTempActionConfig({ to: [], from: "", subject: undefined, body: undefined })

    const submitActionConfig = async (config) => {
        const newActionConfig = { ...config }
        dispatch(addAction(newActionConfig))

        return new Promise(
            (resolve) => {
                closeTimeout.current = setTimeout(() => {
                    setTempActionConfig(undefined)
                    resolve()
                }, 200)
            }
        )
    }

    return <div style={actionsStyle}>
        {tempActionConfig && <Modal
            modalOpen={true}
            onSubmit={submitActionConfig}
            onClose={() => setTempActionConfig(undefined)} 
            actionConfig={tempActionConfig}
            hotkeys={hotkeysRefactored}
            userOptionsMap={userOptions}
        />}
        <Row style={{width:"100%", marginTop: "20px"}} align={"center"} >
            {actions.map((action, index) => {
                {/* if (!Actions[action.type]) {
                    return "Action Type not found: " + action.type
                } */}
                const ActionSummary = Actions[action.type].Summary; 
                
                return <>
                <Col key={`action_${index}`} sm={16} style={{marginBottom: "30px"}}>
                    <ActionSummary 
                        actionConfig={action} 
                        label={actionTypes[action.type]} 
                        eventType={eventType}
                        index={index}
                        listenerid={index}
                    />
                </Col>
                </>
            })}
        </Row>
        <Row 
            align={actions.length == 0 ? "center" : "bottom"}
            style={{marginBottom: "20px"}}
        >
            <Button type="primary" onClick={startNewAction}>Add Action</Button>
        </Row>
    </div>
}

const Page4 = () => {
    const listenerConfig = useSelector(s => s.onboarding)
    const dispatch = useDispatch()
    const requested = useRef(false)
    const previousTimestamp = useRef(listenerConfig.timestamp);

    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (previousTimestamp.current < listenerConfig.timestamp) {
            setIsLoading(false);
            setTimeout(() => {
                // Force app reload after submitting.
                dispatch(resetListeners())
            }, 600)
        }
    }, [listenerConfig])

    useEffect(() => {
        if (!requested.current) {
            requested.current = true
            const { actions, conditions, eventType } = listenerConfig
            const actionsJSON = actions.map(({key, ...rest}) => rest)
            const cleanedConfig = {
                conditions,
                actions: actionsJSON,
                eventType
            }
            dispatch({type: SAVE_LISTENER_START, payload: cleanedConfig})
        }
    }, [])

    if (isLoading) {
        return <><Spin /><Title level={5}>Saving...</Title></>
    }
    return <>Done, Reloading</>
}


export default NewListenerScreen;