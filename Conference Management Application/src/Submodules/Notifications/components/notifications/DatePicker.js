import React, { useState, useEffect } from "react";
import DateRangePicker from './ReactPicker';

import moment from 'moment';

const DatePicker = (props) => {

  const myRef = React.useRef();

  useEffect(() => {
      props.startTime ? myRef.current.setStartDate(props.startTime) : myRef.current.setStartDate(moment());
      props.endTime ? myRef.current.setEndDate(props.endTime) : myRef.current.setEndDate(moment().endOf('hour'));
      
  }, [props.type]);

  const handleEvent = (event, picker) => {
    props.setStartTime(picker.startDate);
  }
  const handleCallback = (start, end, label) => {
    if(start){
      props.setStartTime(start);
    }
    if(end){
      props.setEndTime(end);
    }
  }

  return(
    <div>
      <DateRangePicker
          ref={myRef}
          key={props.type}
          initialSettings={{ 
            timePicker:true, 
            singleDatePicker:props.type=='emphimeral'?false:true, 
            locale: {
              format: 'MM/DD/YYYY hh:mm A',
            }
          }}
          onEvent={handleEvent} onCallback={handleCallback}
        >
          <input type="text" className="form-control" />
        </DateRangePicker>
    </div>
  )
}

export default DatePicker;