import React, { useState, useEffect } from "react";
import "./Notification.css";
import RichTextEditor from "./RichTextEditor";
import DatePicker from "./DatePicker";
import TagInput from "./TagInput";
import ShowPreview from "./ShowPreview";
import ContextSelector from "./ContextSelector";
import moment from "moment-timezone";
import TargetSelector from "./TargetSelector";
import {  message as MessageAnt, Alert  } from 'antd';

const AddEditNotification = (props) => {
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [shortMessage, setShortMessage] = useState('');
  const [formValues, setFormValues] = useState('');
  const [tags, setTags] = useState([]);
  const [showPreview, setShowPreview] = useState(true);
  const [linkButtonTitle, setLinkButtonTitle] = useState();
  const [platform, setPlatform] = useState();
  const [type, setType] = useState('');
  const [isSticky, setSticky] = useState(false);
  const [schedule, setSchedule] = useState('');
  const [notificationTarget, setNotificationTarget] = useState("all_app_users");
  const [startTime, setStartTime] = useState(false);
  const [endTime, setEndTime] = useState();
  const [actions, setActions] = useState([]);
  const [showError, setShowError] = useState(false);
  const [notificationTargetValues, setNotificationTargetValues] = useState([]);
  const [linkButtonURL, setLinkButtonURL] = useState();
  const [inFocusBox, setInFocusBox] = useState();

  const [sessions, setSessions] = useState();
  const [exhibitors, setExhibitors] = useState();
  const [exhibitorsHash, setExhibitorsHash] = useState();
  const [itineraries, setItineraries] = useState();
  const [groups, setGroups] = useState();

  const dateformat = "YYYY-MM-DD HH:mm A";

  useEffect(() => {
    let sessionsObj;
    if (props.session?.program?.sessions) {
      let allsessions = props.session.program.sessions;
      sessionsObj = {};
      Object.keys(allsessions)
        .filter((key) => allsessions[key].type === "session")
        .map((key) => {
          sessionsObj[key] = allsessions[key].title;
        });
      setSessions(sessionsObj);
    }
    let exhibitorsObj;
    let exhibitorsHashObj = {};
    if (props.exhibitor) {
      exhibitorsObj = {};
      let allExhibitors = props.exhibitor;
      allExhibitors.map((exhib) => {
        exhibitorsObj[exhib["compid"]] = exhib.companyname;
        exhibitorsHashObj[exhib["compid"]] = exhib;
      });
      setExhibitors(exhibitorsObj);
      setExhibitorsHash(exhibitorsHashObj);
    }
    let itinerariesObj;
    if (props.session?.program?.sessions) {
      let allitineraries = props.session.program.itinerary;
      itinerariesObj = {};
      Object.keys(allitineraries)
        .map((key) => {
          itinerariesObj[key] = allitineraries[key].title;
        });
      setItineraries(itinerariesObj)  
    }
    let groupsObj;
    if (props.session?.program?.sessions) {
      let allgroups = props.session.program.groups;
      groupsObj = {};
      Object.keys(allgroups)
        .map((key) => {
          groupsObj[key] = allgroups[key].group_name;
        });
      setGroups(groupsObj);
    }
  }, [props.session]);
  

  const [contextType, setContextType] = useState();
  const [contextId, setContextId] = useState();
  let contextItemIdInitial = null;
  let contextItemsInitial = {};
  if (contextType == "Session" && props.editPost?.post_object.contextId) {
    contextItemIdInitial = sessions[props.editPost?.post_object.contextId];
    contextItemsInitial = sessions;
  } else if (contextType == "Exhibitor" && props.editPost?.post_object.contextId) {
    contextItemIdInitial = exhibitorsHash[props.editPost?.post_object.contextId];
    contextItemsInitial = exhibitors;
  }
  const [contextItem, setContextItem] = useState(contextItemIdInitial);
  const [contextItems, setContextItems] = useState(contextItemsInitial);
  
  useEffect(() => {
    if(props.config && !props.config.hasMobileApp){
      setPlatform('web')
    }
  }, [props.config, props.settings]);
  useEffect(() => {
    if(props.editPost && exhibitorsHash){
      props.editPost?.post_object.platform ? setPlatform(props.editPost?.post_object.platform) : setPlatform();
     
      props.editPost?.post_object.type ? setSchedule(props.editPost?.post_object.type) : setSchedule();
      props.editPost?.post_object.type != 'instant' ? setStartTime(props.editPost?.post_object.startTime) : setStartTime();
      props.editPost?.post_object.type == 'emphimeral' ? setEndTime(props.editPost?.post_object.endTime) : setEndTime();
      props.editPost?.post_object.title ? setTitle(props.editPost?.post_object.title) : setTitle();
      props.editPost?.post_object.message ? setMessage(props.editPost?.post_object.message) : setMessage();
      props.editPost?.post_object.shortMessage ? setShortMessage(props.editPost?.post_object.shortMessage) : setShortMessage();
      props.editPost.post_object ? props.editPost.post_object?.notificationTarget ? setNotificationTarget(props.editPost?.post_object.notificationTarget) : setNotificationTarget('all_app_users'):setNotificationTarget('all_app_users');
      props.editPost?.post_object?.notificationTargetValues ? setNotificationTargetValues(props.editPost?.post_object.notificationTargetValues) : setNotificationTargetValues();
      props.editPost?.post_object.linkButtonTitle ? setLinkButtonTitle(props.editPost?.post_object.linkButtonTitle) : setLinkButtonTitle();
      props.editPost?.post_object.contextId ? setContextId(props.editPost?.post_object.contextId) : setContextId();
      props.editPost?.post_object.contextType ? setContextType(props.editPost?.post_object.contextType) : setContextType();
      props.editPost?.post_object?.linkButtonURL ? setLinkButtonURL(props.editPost?.post_object.linkButtonURL) : setLinkButtonURL('')
      let contextItemIdInitial = null;
      let contextItemsInitial = {};
      if (props.editPost?.post_object.contextType == "Session" && props.editPost?.post_object.contextId) {
        contextItemIdInitial = sessions[props.editPost?.post_object.contextId];
        contextItemsInitial = sessions;
      } else if (props.editPost?.post_object.contextType == "Exhibitor" && props.editPost?.post_object.contextId) {
        contextItemIdInitial = exhibitorsHash[props.editPost?.post_object.contextId];
        contextItemsInitial = exhibitors;
      }
      setContextItem(contextItemIdInitial);
      setContextItems(contextItemsInitial)
    }
    props.editPost?.post_object.tags ? setTags(props.editPost?.post_object.tags) : setTags();
    if(props.editPost?.post_object.actions){
      props.editPost?.post_object.actions.includes("lobby") && props.editPost?.post_object.actions.includes("live")?setType('push_and_post'):props.editPost?.post_object.actions.includes("lobby")?setType("post"):setType("push");
    }
    props.editPost?.post_object.startTime ? setStartTime( moment(
          moment(props.editPost?.post_object.startTime)
            .tz(props.config.timezone)
            .format(dateformat),
          dateformat
        ))
      : setStartTime()
    props.editPost?.post_object.endTime ? setEndTime(moment(
        moment(props.editPost?.post_object.endTime)
          .tz(props.config.timezone)
          .format(dateformat),
        dateformat
      ))
    : setEndTime()  
  }, [props.editPost, exhibitorsHash]);

  useEffect(() => {},[contextItem, groups, itineraries])

  useEffect(() => {
    let action_types;
    if(type=='push_and_post'){
      action_types = ["lobby", "live"];
    }
    else if(type=='post'){
      action_types = ["lobby"];
    }
    else if(type=='push'){
      action_types = ["live"];
    }
    setActions(action_types)
  },[type]);

  const clearForm = () => {
    setPlatform();
    setType();
    setSchedule();
    setStartTime();
    setEndTime();
    setTitle();
    setMessage();
    setShortMessage();
    setNotificationTarget('all_app_users');
    setContextType();
    setContextId();
    setNotificationTargetValues([]);
  }

  const timeStampForTimeZone = (time) => moment.tz(time.format(), dateformat, props.config.timezone).valueOf();

  const validateForm = () => {
    if(!title || 
      (contextType && ((contextType!='lounge' && !linkButtonTitle) || (contextType=='external_link' && !linkButtonURL))) ||
      ((contextType=="Exhibitor" || contextType=="Session") && !contextItem) ||
      (schedule == 'scheduled' && !startTime)
      ){
      setShowError(true);
      return false;
    }
    else{
      setShowError(false);
      return true;
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    let validated = validateForm();
    if(validated){
        let contextInfo;
      if (contextType == "Session") {
        let sessionInfo = props.session.program?.sessions[contextId]?props.session.program.sessions[contextId]:{};
        contextInfo = {
          type: sessionInfo.type,
          session_id: sessionInfo.session_id,
          ab_id: sessionInfo.ab_id,
          program_id: sessionInfo.program_id,
        };
      } else {
        contextInfo = exhibitorsHash[contextId];
      }
      let shortMessage_clean = shortMessage?.replace(/"/g, '\'').replace(new RegExp('\r?\n','g'), '').replace(/[“”‘’]/g,'\'');
      let message_clean = message?.replace(/"/g, '\'').replace(new RegExp('\r?\n','g'), '').replace(/[“”‘’]/g,'\'');
      let topic;
      if(props.config?.isV4App){
        topic = notificationTarget=="all_app_users"?`~topics~${props.config.appslug}`:notificationTarget=='conference_participants'?`~topics~${props.config.source_hex}_conference`:''
      }
      else{
        topic = notificationTarget=="all_app_users"?`/topics/${props.config.appslug}`:notificationTarget=='conference_participants'?`/topics/${props.config.source_hex}_conference`:''
      }
      let payload = {
        item: {
          _id: props.editPost?._id,
          title,
          message: message_clean,
          type: schedule,
          startTime: startTime && timeStampForTimeZone(startTime),
          endTime: endTime && schedule=='emphimeral' && timeStampForTimeZone(endTime),
          actions,
          contextInfo,
          tags,
          contextType,
          isSticky,
          contextId,
          linkButtonTitle,
          platform,
          shortMessage:shortMessage_clean,
          notificationTarget,
          notificationTargetValues,
          linkButtonURL
        },
        config: props.config,
        topic: topic
      };

      if((platform == 'mobile_and_web' || platform == 'web') && (notificationTarget!='app_users_by_group' && notificationTarget!='conference_participants_by_itinerary')){
        if (schedule == "instant") {
          if (actions.find((ele) => ele == "live")) props.publishPost(payload);
          if (actions.find((ele) => ele == "lobby")) props.createPost(payload);
        } else {
          props.createPost(payload);
        }
      }
      if(platform == 'mobile_and_web' || platform == 'mobile'){
        if (actions.find((ele) => ele == "live") && schedule == "instant"){ 
          props.pushMobileNotification(payload); 
          if(actions.length == 1) props.createPost(payload); 
        }
        if (actions.find((ele) => ele == "lobby") && platform == 'mobile') props.createPost(payload);
        if (actions.find((ele) => ele == "live") && actions.length==1 && schedule != "instant" && platform == 'mobile') props.createPost(payload);

        if(schedule == "scheduled" && notificationTarget == "all_app_users") {
          console.log('Going to make MySQL queuing call');
          console.log(payload);
        }

      }

      MessageAnt.success(schedule=='instant' ? 'Notification Sent': 'Notification Scheduled');
      clearForm();

    }
  }

  const onFocusBox = (value, type) => {
    if(type=='focus'){
      setInFocusBox(value)
    }
    else if(type=='blur'){
      setInFocusBox('')
    }
  }

  const warningLanguage = {
    "push": "An active push notification (audio/vibration) will be sent to the users mobile device, but will NOT persist as an announcement in the mobile app notification tray.",
    "post": "A notification will be sent to the mobile apps notification tray and NO active push will be made to the users device.",
    "push_and_post": "An active push notification to the user's mobile device (audio/vibration) AND the announcement will persist in the mobile app notification tray."
  }

  return (
    <div className="notification_module">
      <div className="panel panel-default padding-10 col-sm-7 mt-10">
        <form className="form-horizontal notification_form" data-toggle="validator">
          <div className="form-group">
            <label className="control-label col-sm-3" for="platform">Platform:</label>
            <div className="col-sm-9 btn-group">
                <button 
                  type="button" 
                  disabled={!props.config.hasMobileApp} 
                  className={platform == "mobile_and_web" ? "btn btn-default active" : "btn btn-default" } 
                  value="mobile_and_web" 
                  onClick={(e) => setPlatform(e.target.value)}
                >
                  Mobile & Web
                </button>
                <button 
                  type="button" 
                  disabled={!props.config.hasMobileApp} 
                  className={platform == "mobile" ? "btn btn-default active" : "btn btn-default" } 
                  value="mobile" 
                  onClick={(e) => setPlatform(e.target.value)}
                >
                  Mobile Only
                </button>
                <button 
                  type="button" 
                  className={platform == "web" ? "btn btn-default active" : "btn btn-default" } 
                  value="web" 
                  onClick = {(e) => setPlatform(e.target.value)}
                >
                  Web Only
                </button>
            </div>
          </div>
          {platform &&
            <div className="form-group">
              <label className="control-label col-sm-3" for="type">Type:</label>
              <div className="col-sm-9">
                <div className="btn-group">
                  <button 
                    type="button" 
                    className={type == "push_and_post" ? "btn btn-default active" : "btn btn-default" } 
                    value="push_and_post" 
                    onClick={(e) => setType(e.target.value)}
                  >
                    Push & Post
                  </button>
                  <button 
                    type="button" 
                    className={type == "post" ? "btn btn-default active" : "btn btn-default" } 
                    value="post" 
                    onClick={(e) => setType(e.target.value)}
                  >
                    Post Only
                  </button>
                  <button 
                    type="button" 
                    className={type == "push" ? "btn btn-default active" : "btn btn-default" } 
                    value="push" 
                    onClick={(e) => setType(e.target.value)}
                  >
                    Push Only
                  </button>
                </div>
                { type &&
                   <div class="text-primary" style={{marginTop: 5}}>{warningLanguage[type]}</div>
                }
                {(type=="push_and_post" || type=="post" ) &&
                  <div className="checkbox">
                    <label>
                      <input 
                        type="checkbox" 
                        onChange={(e) => setSticky(e.target.checked)}
                      />
                       Pin to top of lobby
                    </label>
                  </div>
                }
              </div>
            </div>
          }
          {type &&
            <div className="form-group">
              <label className="control-label col-sm-3" for="schedule">Schedule:</label>
              <div className="col-sm-9 btn-group">
                <div className="btn-group mb-10">
                  <button 
                    type="button" 
                    className={schedule == "instant" ? "btn btn-default active" : "btn btn-default" } 
                    value="instant" 
                    onClick={(e) => setSchedule(e.target.value)}
                  >
                    Instant
                  </button>
                  <button 
                    type="button" 
                    className={schedule == "scheduled" ? "btn btn-default active" : "btn btn-default" } 
                    value="scheduled" 
                    onClick={(e) => setSchedule(e.target.value)}
                  >
                    Scheduled
                  </button>
                    {type != "push" &&
                      <button 
                        type="button" 
                        className={schedule == "emphimeral" ? "btn btn-default active" : "btn btn-default" } 
                        value="emphimeral" 
                        onClick={(e) => setSchedule(e.target.value)}
                      >
                        Range
                      </button>
                    }
                </div>
                {(schedule == "scheduled" || schedule == "emphimeral") &&
                  <div className="mt-10">
                    <DatePicker 
                      type={schedule} 
                      startTime={startTime} 
                      endTime={endTime} 
                      setStartTime={setStartTime} 
                      setEndTime={setEndTime}
                    />
                    {showError && !startTime &&
                      <p class="text-danger">*Please select time</p>
                    }
                    <div className="mt-10">
                      <Alert banner style={{fontWeight:'bold'}} message={`Time must be entered according to ${props.config.timezone} timezone.`} type="warning" />
                    </div>
                  </div>
                  
                }  
              </div>
            </div>
          }
          {schedule &&
            <div>
              <div className="form-group">
                <label className="control-label col-sm-3" for="title">Title:</label>
                <div className="col-sm-9">
                  <input 
                    type="textarea" 
                    className="form-control" 
                    id="title" 
                    placeholder="Enter Title" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}/>
                    {showError && !title &&
                      <p class="text-danger">*Title cannot be empty</p>
                    }
                    
                </div>
              </div>
              {platform!='web' && type!='post' &&
                <div className="form-group">
                  <label className="control-label col-sm-3" for="short_message">Short Message:</label>
                  <div className="col-sm-9">
                    <textarea 
                      className={"form-control"} 
                      rows="3" 
                      id="short_message" 
                      maxlength="178"
                      value={shortMessage} 
                      onFocus={()=>onFocusBox('short_message', 'focus')}
                      onBlur={()=>onFocusBox('short_message', 'blur')}
                      onChange={(e) => setShortMessage(e.target.value)}/>
                    <p class="text-primary">Must be less than 178 characters</p>  
                  </div>
                </div>
              }
              {!(platform=='mobile' && type=='push') &&
                <div className="form-group">
                  <label className="control-label col-sm-3" for="message">Full Message:</label>
                  <div className="col-sm-9">
                    <RichTextEditor
                      message = {message}
                      setMessage = {setMessage}
                      onFocusBox = {onFocusBox}
                    />
                  </div>
                </div>
              }
              {/* {platform!='web' && 
                <div className="form-group">
                  <label className="control-label col-sm-3" for="notificationTarget">Notification Target:</label>
                  {!sessions &&
                    <div className="row mt-10">Loading...</div>
                  }
                  {groups && itineraries &&
                  <div className="col-sm-9">
                    <div onChange={(e) => setNotificationTarget(e.target.value) }>
                      <label className="radio ml-20 fw-n">
                        <input type="radio" name="notificationTarget" value="all_app_users" checked={notificationTarget=='all_app_users'?true:false}/>
                        All App Users
                      </label>
                      <label className="radio ml-20 fw-n">
                        <input type="radio" name="notificationTarget" value="app_users_by_group" checked={notificationTarget=='app_users_by_group'?true:false}/>
                        App Users by Group
                      </label>
                      <label className="radio ml-20 fw-n">
                        <input type="radio" name="notificationTarget" value="conference_participants" checked={notificationTarget=='conference_participants'?true:false}/>
                        Conference Participants
                      </label>
                      <label className="radio ml-20 fw-n">
                        <input type="radio" name="notificationTarget" value="conference_participants_by_itinerary" checked={notificationTarget=='conference_participants_by_itinerary'?true:false}/>
                        Conference Participants by Itinerary
                      </label>
                    </div>
                    {(notificationTarget=='app_users_by_group' || notificationTarget=='conference_participants_by_itinerary') &&
                      <div class="alert alert-warning mt-10">
                        Selected option sends notification to mobile app only  
                      </div>
                    }
                    {notificationTarget && 
                    (notificationTarget == 'app_users_by_group' || notificationTarget == 'conference_participants_by_itinerary') &&
                      <div>
                        <label className="control-label" for="target_details">Target Details:</label>
                        <TargetSelector
                          itineraries = {itineraries}
                          groups = {groups}
                          notificationTarget = {notificationTarget}
                          setNotificationTargetValues = {setNotificationTargetValues}
                          notificationTargetValues = {notificationTargetValues}
                        />
                      </div>
                    }
                  </div>
                  }
                </div>
              } */}
            </div> 
          }
          {(notificationTarget && schedule) &&
            <div>
              <div className="form-group">
                <label className="control-label col-sm-3" for="link_option">Link Options:</label>
                {sessions &&
                  <div className="col-sm-9">
                    <ContextSelector
                      contextItem={contextItem}
                      setContextItem={setContextItem}
                      contextItems={contextItems}
                      setContextItems={setContextItems}
                      contextType={contextType}
                      sessions={sessions}
                      exhibitors={exhibitors}
                      setContextId={setContextId}
                      setContextType={setContextType}
                      settings = {props.settings}
                      showError={showError}
                    />
                  {contextType=="external_link" &&
                    <div className="row mt-10">
                      <label className="control-label col-sm-3" for="link_text">Link URL:</label>
                      <div className="col-sm-9">
                        <input 
                          type="textarea" 
                          className="form-control" 
                          id="link_text" 
                          value={linkButtonURL}
                          onChange={(e) => setLinkButtonURL(e.target.value)}/>

                        {showError && (contextType=="external_link" && !linkButtonURL) &&
                          <p class="text-danger">*URL cannot be empty</p>
                        }  
                      </div>
                    </div>
                  }  
                  {contextType && contextType!="lounge" &&
                    <div className="row mt-10">
                      <label className="control-label col-sm-3" for="link_text">Link Text:</label>
                      <div className="col-sm-9">
                        <input 
                          type="textarea" 
                          className="form-control" 
                          id="link_text" 
                          value={linkButtonTitle}
                          required={contextType?true:false}
                          onChange={(e) => setLinkButtonTitle(e.target.value)}/>

                        {showError && (contextType && !linkButtonTitle) &&
                          <p class="text-danger">*Title cannot be empty</p>
                        }  
                      </div>
                    </div>
                  }
                  
                </div>
              }
              {!sessions &&
                <div className="row mt-10">Loading...</div>
              }
              </div>
                <div className="form-group mt-20">
                  <label className="control-label col-sm-3" for="link_option">Optional Tags:</label>
                  <div className="col-sm-9">
                    <TagInput setTags={setTags} tags={tags}/>
                    <p class="text-primary">Type tag & hit enter</p> 
                  </div>
                </div>  
                <div className="form-group">        
                  <div className="center">
                    <button type="button" onClick = {handleSubmit} className="btn btn-primary mr-10">{props.editPost ? 'Update': 'Submit'}</button>
                    {props.editPost &&
                      <button type="button" className="btn btn-danger" onClick={() => { clearForm(); props.cancelupdate(); }}>{'Cancel'}</button>
                    }
                  </div>
                </div>
            </div>   
          }
        </form>
      </div>
      <div className="padding-10 col-sm-5">
        {showPreview && message && (
            <ShowPreview
              title={title}
              message={message}
              linkButtonTitle={linkButtonTitle}
              tags={tags}
              type="web"
              focus={inFocusBox=='message'?true:false}
            />
          )}
          {showPreview && shortMessage && (
            <ShowPreview
              title={title}
              message={shortMessage}
              linkButtonTitle={linkButtonTitle}
              tags={tags}
              type="mobile"
              focus={inFocusBox=='short_message'?true:false}
            />
          )}
      </div>
    </div>
  );
}

export default AddEditNotification;
