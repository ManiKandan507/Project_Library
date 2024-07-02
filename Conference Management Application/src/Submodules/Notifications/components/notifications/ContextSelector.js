import React, { useEffect } from "react";

export default ({
  exhibitors,
  sessions,
  contextType,
  contextItems,
  setContextItem,
  setContextItems,
  contextItem,
  setContextType,
  setContextId,
  settings,
  showError
}) => {
  if (!sessions && !exhibitors) return null;
  let contexts = [];
  contexts = [<option value="" selected disabled>Please select</option>];
  if (exhibitors) {
    contexts.push(<option key={"Exhibitor"} value={"Exhibitor"} selected={contextType=='Exhibitor'?true:false}>Exhibitor</option>);
  }
  if (sessions) {
    contexts.push(<option key={"Session"} value={"Session"} selected={contextType=='Session'?true:false}>Session</option>);
  }
  contexts.push(<option key={"link"} value={"external_link"} selected={contextType=='external_link'?true:false}>External Link</option>);
  if(!settings?.hide_native_menu?.includes("social_lounge")){
    contexts.push(<option key={"link"} value={"lounge"} selected={contextType=='lounge'?true:false}>Networking Lounge</option>);
  }
  
  useEffect(() => {
    if (contextType == "Session") {
      setContextItems(sessions);
    } else if (contextType == "Exhibitor") {
      setContextItems(exhibitors);
    }
  }, [contextType]);

  
  const onChangeContextId = (key) => {
    setContextId(key);
    setContextItem(contextItems[key]);
  };

  let options = Object.keys(contextItems).map((key) => (
    <option key={key} value={key} selected={contextItem?.compid==key || contextItems[key]==contextItem ?true:false}>{contextItems[key]}</option>
  ));
  options.unshift(<option value="" selected disabled>Please select</option>)

  return (
    <div>
      <div>
        <select className="form-control" id="sel1" onChange={(e) => setContextType(e.target.value) }>
          {contexts}
        </select>
      </div>
      {(contextType=="Session" || contextType=="Exhibitor") &&
        <div className="row">
          <div className="mt-10">
            <label className="control-label col-sm-3">Select Entity: </label>
          </div>  
          <div className="col-sm-9">
            <select className="form-control" id="sel1" onChange={(e) => onChangeContextId(e.target.value) }>
            {options}
            </select>
            {showError && (contextType=="Exhibitor" || contextType=="Session") && !contextItem &&
              <p class="text-danger">*Please select entity</p>
            }  
          </div>
          
        </div>
      }
    </div>
  );
};
