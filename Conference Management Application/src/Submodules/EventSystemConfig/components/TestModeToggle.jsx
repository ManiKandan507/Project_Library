import { Input, Popconfirm, Popover, Switch, message } from "antd"
import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { updateActionTestingConfigRequest } from "../redux/features/listeners/slice";

function isValidEmail(email) {
    const regexPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regexPattern.test(email);
}

const TestModeToggle = ({children, actionConfig, adminLabel, onChange, actionKey}) => {

    const dispatch = useDispatch()

    const defaultAdmin = useSelector(st => st.eventListeners.testModeAdminEmail)
    const testModeTimestamp = useSelector(st => st.eventListeners.testModeTimestamp)
    const popRef = useRef();
    const isFocused = useSelector(st => st.eventListeners.testModeActionKey) === actionKey

    const [invalidInput, setInvalidInput] = useState(false)

    const timestampRef = useRef(testModeTimestamp)
    const [testMode, setTestMode] = useState(actionConfig.testModeEnabled)
    const [testModeLocked, setTestModeLocked] = useState(false)
    const [confirmAdmin, setConfirmAdmin] = useState(false)
    const [admin, setAdmin] = useState(actionConfig.testModeAdminEmail || defaultAdmin)
    // When testModeTimestamp gets updated, check if the config has changed.
    // If not, the requested update has failed.
    useEffect(() => {
        if (timestampRef.current < testModeTimestamp) {
            timestampRef.current = testModeTimestamp
            if (isFocused) {
                if ( actionConfig.testModeEnabled !== testMode ) {
                    message.error(`Error ${testMode ? "enabling" : "disabling"} test mode.`)
                    setTestMode(actionConfig.testModeEnabled)
                    setAdmin(actionConfig.testModeAdminEmail || defaultAdmin)
                    setConfirmAdmin(false)
                } else {
                    setConfirmAdmin(false)
                    setTestModeLocked(false)
                    message.success("Test mode has been " + (testMode ? "enabled!" : "disabled!"))
                }
                setTestModeLocked(false)
            }
        }
    }, [testModeTimestamp])
    
    
    const handleToggle = (newTestValue) => {
        if (newTestValue) {
            if (!admin || admin === "") setAdmin(defaultAdmin)
            setTestMode(newTestValue)
            setInvalidInput(false)
            setConfirmAdmin(true)
        } else {
            setTestMode(false)
            setInvalidInput(false)
            setTestModeLocked(true)
            dispatch(updateActionTestingConfigRequest({ 
                testModeEnabled: false, 
                testModeAdminEmail: admin, 
                actionKey
            }))
        }
                
    }

    const handleCancel = () => {
        setConfirmAdmin(false)
        setTestMode(false)
        setAdmin(actionConfig.adminContact || defaultAdmin)
    }

    const handleOk = () => {
        if (isValidEmail(admin)) {
            setTestModeLocked(true)
            dispatch(updateActionTestingConfigRequest({ 
                testModeEnabled: testMode, 
                testModeAdminEmail: admin, 
                actionKey
            }))
        } else {
            setInvalidInput(true)
        }        
    }

    const handleChange = (e) => {
        const { value } = e.target;
        setAdmin(value)
        if (invalidInput) setInvalidInput(false)
    }

    return <>
        <Popconfirm
            open={confirmAdmin}
            title={<>
                {adminLabel} 
                <Input 
                    status={invalidInput ? "error" : undefined}
                    value={admin} 
                    onChange={handleChange}
                />
            </>}
            okButtonProps={{ loading: testModeLocked}}
            onCancel={handleCancel}
            onConfirm={handleOk}
        >
            <Popover 
                ref={popRef} 
                title={adminLabel} 
                content={admin}
                overlayInnerStyle={{textAlign:"center"}}
            >
                <Switch 
                    checkedChildren="Testing" 
                    unCheckedChildren="Test Mode" 
                    checked={testMode} 
                    style={{marginRight:"10px"}}
                    onClick={(e) => handleToggle(e)}
                />
            </Popover>
        </Popconfirm>
    </>
}

export default TestModeToggle