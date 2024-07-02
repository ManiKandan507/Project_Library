import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal as AntDModal, Button, Carousel, Drawer, Input, Popover, Select, Typography } from 'antd';
import { SubjectLineField } from '../../EmailEditor';
import EmailField from '../../EmailEditor';
import { ContentState, EditorState, convertFromHTML, convertFromRaw, convertToRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import AutoCompleteField from '../../AutoCompleteField';
import { useDispatch } from 'react-redux';
import { UPDATE_ACTION_REQUEST } from '../../../redux/features/listeners/actionTypes';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined'


const extractTextFromHTML = (htmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  return doc.body.textContent || "";
}

const getHTML = (editorState) => {
    const contentState = editorState.getCurrentContent()
    const html = stateToHTML(contentState);
    return html
}

const Modal = ({ onSubmit, modalOpen, onClose, hotkeys, userOptionsMap, actionConfig }) => {

  const dispatch = useDispatch()
  const {parameters, type, user_note, key, timestamp, testModeEnabled, testModeAdminEmail} = actionConfig
  const emailConfig = parameters
  const timestampTracker = useRef(timestamp)

  const [requestAdditionalParams, setRequestAdditionalParams] = useState(null);
  const additionalParams = useRef({});
  
  const carouselRef = useRef();
  const toInputRef = useRef();


  const [to, setTo] = useState(emailConfig ? 
    emailConfig.to.map(to => {
      let obj = {label: userOptionsMap[to.function].label, value: to.function};
      if (to.parameters) {
        obj.parameters = to.parameters;
        additionalParams.current[to.function] = {...to.parameters}
      } 
      return obj
    })
    : []
  )

  const zipAdditionalParams = (newTo) => {
    let zippedTo = [...newTo]
      .map( to => {
        let obj = {...to}
        if (additionalParams.current[to.value]) {
          obj.parameters = additionalParams.current[to.value]
        }
        return obj
      })
    setTo(zippedTo)
  }

  const [from, setFrom] = useState(emailConfig ? emailConfig.from : "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const userOptions = Object.keys(userOptionsMap)
    .map(key => {
      return {...userOptionsMap[key], value: key}
    })


  
  useEffect(() => {
    if (timestamp > timestampTracker.current) {
      timestampTracker.current = timestamp
      setIsSubmitting(false)
      onClose(true)
    } else { 
      setIsSubmitting(false)
    }

  }, [timestamp])
  
  const formIsValid = () => {
    if ( to.length == 0 || to.map(t => t.value.substring(0,3)) .includes("!em") ) {
      return false
    }
    if (getHTML(subjectEditorState).length == 0) {
      return false
    }
    if (getHTML(bodyEditorState).length == 0) {
      return false
    }
    return true
  }


  const handleSubmit = async () => {
    timestampTracker.current = timestamp
    setIsSubmitting(true)
    const newConfig = {
      type: "SendEmailNotification", user_note,
      testModeEnabled, testModeAdminEmail,
      parameters: {
        to: to.map(to => {
          let obj = {"resolvedBy": "event", "function": to.value}
          if (to.parameters) {
            obj.parameters = {...to.parameters}
          }
          return obj
        }), 
        from,
        subject: {
            html: extractTextFromHTML(getHTML(subjectEditorState)), 
            draftJS: convertToRaw(subjectEditorState.getCurrentContent())
        },
        body: {
            html: getHTML(bodyEditorState), 
            draftJS: convertToRaw(bodyEditorState.getCurrentContent())
        }
      },
    }

    if (onSubmit) {
      onSubmit(newConfig)
      return
    }
    
    dispatch({type: UPDATE_ACTION_REQUEST, payload: {actionConfig: newConfig, actionKey: key}})

  };

  const [subjectEditorState, setSubjectEditorState] = useState(() => {
    if (!emailConfig || !emailConfig.subject) {
      return EditorState.createEmpty()
    }
    if (emailConfig.subject.draftJS) {
      const blocks = convertFromRaw(emailConfig.subject.draftJS)
      return EditorState.createWithContent(blocks)
    }   
    const blocks = convertFromHTML(emailConfig.subject)
    return EditorState.createWithContent(
        ContentState.createFromBlockArray(blocks.contentBlocks, blocks.entityMap)
    )
  });

  const [bodyEditorState, setBodyEditorState] = useState(() => {
    if (!emailConfig || !emailConfig.body) {
      return EditorState.createEmpty()
    }
    if (emailConfig.body.draftJS) {
        const blocks = convertFromRaw(emailConfig.body.draftJS)
        return EditorState.createWithContent(blocks)
    }   
    const blocks = convertFromHTML(emailConfig.body)
    return EditorState.createWithContent(
        ContentState.createFromBlockArray(blocks.contentBlocks, blocks.entityMapp)
    )
  });

  const handleUpdateAdditionalParams = (key, value) => {
    if (!additionalParams.current[requestAdditionalParams.key]) {
      additionalParams.current[requestAdditionalParams.key] = {}
    }
    additionalParams.current[requestAdditionalParams.key][key] = value
  }

  const handleSubmitAdditionalParams = () => {
    let newTo = [...to];
    newTo[newTo.length - 1] = {
      ...newTo[newTo.length - 1],
      parameters: {...additionalParams.current[requestAdditionalParams.key]}
    }
    setTo(newTo)
    setRequestAdditionalParams(null);
  }

  const renderAdditionalParams = () => {
    let option = userOptionsMap[requestAdditionalParams.key];
    return (<>
      <Typography.Text strong>Additional information for {option.label}</Typography.Text><br/><br/>
      {Object.keys(option.parameters).map( key => {
        let field = option.parameters[key];
        let output = null;
        switch (field.fieldType) {
          case "multiSelect":
            output = <Select
              mode="multiple"
              allowClear
              placeholder="Select an option"
              style={{width:"100%"}}
              options={field.options}
              onChange={(value) => handleUpdateAdditionalParams(key, value)}
            >

            </Select>
            break;
        }

        return <>
          <Typography.Text strong>{field.label} </Typography.Text>
          <Popover content={field.hint}>
            <InfoCircleOutlined />
          </Popover>
          {output}
          <div style={{width: "100%", marginTop:"10px"}}>
            <Button type="primary" block ghost onClick={handleSubmitAdditionalParams}>
              Done
            </Button>
          </div>
        </>

      })}
    </>)
  }

  return (
    <AntDModal
      title={!requestAdditionalParams ? "Setup Email Notification" : `Additional Info for ${userOptionsMap[requestAdditionalParams.key].label}`}
      centered
      open={modalOpen}
      okButtonProps={{disabled: !formIsValid() || requestAdditionalParams}}
      okText={<>Submit</>}
      onOk={handleSubmit}
      onCancel={() => onClose(false)}
      confirmLoading={isSubmitting}
    >
      <div>
        <div>
          <label>To: </label>
          <AutoCompleteField
            selected={to}
            setSelected={zipAdditionalParams}
            options={userOptions}
            readOnly={isSubmitting}
            requestAdditionalParams={(key) => setRequestAdditionalParams({key, source: "to"})}
            inputRef={toInputRef}
          />
        </div>
        <div>
          <label>From: </label>
          <Input
            name="from"
            value={from}
            onChange={e => setFrom(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label>Subject: </label>
          <SubjectLineField
            editorState={subjectEditorState} 
            onChangeEditorState={(editorState) => setSubjectEditorState(editorState)} 
            hotkeys={hotkeys} 
            readOnly={isSubmitting}
          />
        </div>
        <div>
          <label>Body: </label>
          <EmailField 
            editorState={bodyEditorState} 
            onChangeEditorState={(editorState) => setBodyEditorState(editorState)} 
            hotkeys={hotkeys}
            readOnly={isSubmitting}
          />
        </div>
      </div>
      {/* Additional Parameters */}
      <Drawer open={requestAdditionalParams}>
        {requestAdditionalParams && renderAdditionalParams()}
      </Drawer>
    </AntDModal>    
  );
};

export default Modal;
