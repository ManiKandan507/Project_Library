import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import AddEditNotification from "./AddEditNotification";
import "./Notification.css";
import Scheduled from "./Scheduled";
import { getPosts,  publish, createPost, deletePost, pushMobileNotification, updatePost, getSettings } from "../../appRedux/effects";
import { fetchExhibitorsRequest, fetchSessions } from "../../appRedux/actions";
import { bindActionCreators } from "redux";

const Notifications = (props) => {
  const [config, setConfig] = useState(false);
  const [activeTab, setActiveTab] = useState('new_post');
  const [previousTab, setPreviousTab] = useState();
  const [editPost, setEditPost] = useState();
  const [exhibitors, setExhibitors] = useState();
  const [session, setSession] = useState({});
  const [settings, setSettings] = useState();

  useEffect(() => {
    if(props.staticConfig){
      let payload = {
        source_hex: props.staticConfig.source_hex,
        conferenceid: props.staticConfig.conferenceid,
      }
       props.getSettings(payload);
    }
  }, []);

  useEffect(() => {
    if(props.settings){
      let notification_config = {};
      notification_config["appdir"] = props.settings.appdir;
      notification_config["conferenceid"] = props.settings.conferenceid;
      notification_config["source_hex"] = props.settings.source_hex;
      notification_config["timezone"] = props.settings.timezone;
      notification_config["appslug"] = props.settings.appslug;
      notification_config["server_key"] = props.settings.FCMServerKey;
      notification_config["hasMobileApp"] = props.settings.included_apps?.mobile_app?true:false;
      notification_config["hasWebApp"] = props.settings.included_apps?.virtual_app?true:false;
      notification_config["isV4App"] = props.settings.hasV4Notifications ? true : false;
      setConfig(notification_config);
    }
  },[props.settings])

  useEffect(() => {
    if(config){
      let payload = {
        source_hex: config.source_hex,
        conferenceid: config.conferenceid,
      }
      props.getPosts(payload);
      props.fetchExhibitorsRequest(config);
      props.fetchSessions(config);
    }
  }, [config]);

  useEffect(() => {
    if(props.exhibitors?.fetched){
      props.exhibitors.exhibitors?.length>0?setExhibitors(props.exhibitors.exhibitors):setExhibitors([]);
    }
  },[props.exhibitors])

  useEffect(() => {
    if(props.session?.loaded){
      setSession(props.session);
    }
  },[props.session])

  const onEdit = (post) => {
    //console.log(post)
    setPreviousTab(activeTab)
    setEditPost(post);
    setActiveTab('new_post');
  }

  const cancelupdate = () => {
    setActiveTab(previousTab);
    setEditPost();
    setPreviousTab();
  }

  useEffect(() => {},[session])

  return (
    <div className="app-container">
      {exhibitors && (session.loaded) &&
        <div>
          <div className="btn-group btn-justified">
            <button 
              type="button" 
              className={activeTab == "new_post" ? "btn btn-default active" : "btn btn-default" } 
              value="new_post" 
              onClick={(e) => setActiveTab(e.target.value)}
            >
             {editPost ? 'Update Post' : 'New Post'}
            </button>
            <button 
              type="button" 
              className={activeTab == "scheduled" ? "btn btn-default active" : "btn btn-default" } 
              value="scheduled" 
              onClick={(e) => { setEditPost(); setActiveTab(e.target.value) }}
            >
              Scheduled
            </button>
            <button 
              type="button" 
              className={activeTab == "past" ? "btn btn-default active" : "btn btn-default" } 
              value="past" 
              onClick={(e) => { setEditPost(); setActiveTab(e.target.value) }}
            >
              Past
            </button>
          </div>
          {activeTab=='new_post' &&
            <AddEditNotification 
              config={config} 
              editPost={editPost} 
              exhibitor={exhibitors} 
              session={session}
              publishPost={props.publish}
              createPost={editPost?props.updatePost:props.createPost}
              cancelupdate={cancelupdate}
              pushMobileNotification={props.pushMobileNotification}
              settings={props.settings}
            />
          }
          {activeTab=='scheduled' &&
            <Scheduled 
              config={config} 
              type="scheduled" 
              onEdit={onEdit}
              publishPost={props.publish}
              deletePost={props.deletePost}
            />
          }
          {activeTab=='past' &&
            <Scheduled 
              config={config} 
              type="past" 
              onEdit={onEdit}
              deletePost={props.deletePost}
            />
          }
        </div>
      }
      {(!exhibitors || !(session.loaded)) &&
        <div className="loader">
          <i className="busy"></i>
        </div>
      }
      
    </div>
      
  );
}


const mapStateToProps = (state) => {
  return {
    posts: state.post.posts,
    exhibitors: state.exhibitors,
    session: state.session,
    settings: state.settings?.settings
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
		Object.assign({
			fetchExhibitorsRequest,
      getPosts,
      fetchSessions,
      publish,
      createPost,
      deletePost,
      pushMobileNotification,
      updatePost,
      getSettings
		}),
		dispatch
	)
  }

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
