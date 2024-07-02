import { Button, Col, List, Row, message } from "antd"
import Modal from "./Modal"
import { useState } from "react"
import { useSelector } from "react-redux"
import TestModeToggle from "../../TestModeToggle"

const extractTextFromHTML = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    return doc.body.textContent || "";
}

const Summary = ({ actionConfig, actionKey }) => {
    const [modalOpen, setModalOpen] = useState(false)
    const {to, subject} = actionConfig.parameters
    const label = useSelector(s => s.configContext.actionTypes[actionConfig.type])

    const [messageApi, contextHolder] = message.useMessage();
    const handleCloseModal = (success) => {
        if (success) messageApi.info("Action Updated!")
        setModalOpen(false)
    }

    // Resolved from draft in onboarding, or in listeners repository.
    const listenerid = actionConfig.key.split("-").length == 1 ? "" : actionConfig.key.split("-")[0]
    const eventType = useSelector( listenerid == "" ? 
          s => s.onboarding.eventType 
        : s => s.eventListeners.listeners.map[listenerid].eventType
    )
    console.log("re-render")
    
    const {hotkeys, userOptions} = useSelector(s => s.configContext.eventTypes[eventType])
    
    const hotkeysRefactored = hotkeys.map( hk => {return {hint: hk.hint, name: hk.label}})

    let data = [
        {
            label: "To: ",
            value: to && to.length ? to.map(rec => userOptions[rec.function].label).join(", ") : ""
        },
        {
            label: "Subject: ",
            value: subject && subject.html ? extractTextFromHTML(subject.html) : subject ? subject : ""
        },
    ]

    return <>
        {contextHolder}
        {modalOpen && <Modal 
            modalOpen={true}
            onClose={handleCloseModal}
            actionConfig={actionConfig}
            hotkeys={hotkeysRefactored}
            userOptionsMap={userOptions}
        />}
        <List
            size="small"
            header={
                <div style={{display:"flex", justifyContent:"space-between"}}>
                    <div style={{fontWeight: "700", fontSize: "1rem", marginRight: "7px"}}>
                        {label}
                    </div>
                    <Row>
                        { actionKey && <Col style={{margin:"5px auto", display:"flex", justifyContent:"center"}}>
                            <TestModeToggle actionConfig={actionConfig} adminLabel={"Override Recipient"} actionKey={actionKey} />
                        </Col> }
                        <Col style={{margin:"auto", display:"flex", justifyContent:"center"}}>
                            <Button type="primary" size="small" onClick={() => setModalOpen(true)}>Edit</Button>
                        </Col>
                    </Row>
                </div>
            }
            bordered
            dataSource={data}
            renderItem={(item) => 
                <List.Item>
                    <div style={{  
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign:"left"
                    }}>
                        <b>{item.label}</b>
                        {item.value}
                    </div>
                </List.Item>
            }
        />
    </>
}

export default Summary