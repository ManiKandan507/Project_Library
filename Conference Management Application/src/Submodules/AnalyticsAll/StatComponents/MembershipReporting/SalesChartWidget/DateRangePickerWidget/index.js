import React, { useState } from "react";
import DateRangePicker from "./DateRangepicker";
import SingleMonthMultiYear from "./SingleMonthMultiYear";
import MultiYearRangePicker from "./MultiYearRangePicker";
import SwitchableDatePicker from "./SwitchableDatePicker";

const DateRangePickerWidget = ({ showByConfig, dateFormat, configDates, compareMode, minimumYear, timeGroupBy, props, membershipType }) => {

    return (
        <div>
            {(dateFormat === 'single_month_multi_year' &&
                //  compareMode && 
                showByConfig && timeGroupBy.includes('MONTH')) &&
                <>
                    <SingleMonthMultiYear
                        minimumYear={minimumYear}
                        dateFormat={dateFormat}
                        configDates={configDates}
                        membershipType={membershipType}
                    />
                </>
            }
            {(dateFormat === 'date_picker_with_range' && showByConfig) &&
                <>
                    <SwitchableDatePicker
                        props={props}
                    // minimumYear={minimumYear}
                    // dateFormat={dateFormat}
                    // configDates={configDates}
                    />
                </>
            }
            {((compareMode === false && dateFormat != 'single_month_multi_year') || dateFormat === 'date_range') && <>
                <DateRangePicker
                    props={props}
                />
            </>}
            {(compareMode && dateFormat === 'multi_year' && showByConfig) &&
                <>
                    <MultiYearRangePicker
                        minimumYear={minimumYear}
                        configDates={configDates}
                    />
                </>
            }
        </div>
    )
}
export default DateRangePickerWidget