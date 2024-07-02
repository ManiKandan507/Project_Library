import React from "react";
import "./Notification.css";

export default ({ title, message, linkButtonTitle, tags, type, focus }) => (
  <div className={`preview-${type}`}>
    <div className="preview_title">{type=='web' ? 'Post Preview' : 'Mobile Preview'}</div>
    <div className={`panel panel-default padding-10 bgWhite ${type}-panel ${focus?'boxFocus':''}`}>
    {type=='mobile' &&
       <h6 style={{ display: "flex", justifyContent: "flex-end" }}>0 min ago</h6>
    }
    {type=='web' &&
      <h3>{title}</h3>
    }
    {type=='mobile' &&
      <h5>{title}</h5>
    }
    <div dangerouslySetInnerHTML={{ __html: message }}></div>
      {tags && type=='web' &&
        tags.map((tag, index) => (
          <div key={index} className="preview-tag" style={{backgroundColor:index % 2 == 0 ? "#2db7f5" : "#57C52D"}}>
            {tag.toUpperCase()}
          </div>
        ))}
      {type=='web' && linkButtonTitle &&
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="button" class="btn btn-primary">
            {linkButtonTitle}
          </button>
        </div>
      }  
    </div>
  </div>
);
