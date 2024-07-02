import moment from 'moment';
import React, { createContext, useEffect, useReducer } from 'react';
import { calculateMonthDays, get90PriorDate, getCurrentDate } from '@/AnalyticsAll/StatComponents/util';
import Reducer from '@/MembershipReportingV2/context/Reducer';

const initialState = {
    membersGroup: [],
    selectedMemberGroups: [],
    selectedOptions: "date",
    selectedDates: [get90PriorDate(), getCurrentDate()],
    defaultDates: [moment().startOf('month').subtract(calculateMonthDays(2), "days"), moment()],
    salesSelectedDates: [],
    loading: false,
    hasCompare: false,
    isGroups: false,
    multiYearDates: [],
    isDatePickerOpen: '',
    isTouched: false,
    multiYear: [],
    dateRangeError: false,
    viewBy: '',
    primaryColor: '#1890ff',
    demographicsConfig: {},
    customFieldData :{}
};

const GlobalContext = createContext(initialState);
export default GlobalContext;

export const GlobalProvider = (props) => {
    const [state, dispatch] = useReducer(Reducer, initialState);
    const { config: { groups_array }, children } = props

    const setMemberGroups = () => {
        let selectedGroups = [];
        for (const group of groups_array) {
            selectedGroups.push(group.groupname);
        }
        dispatch({
            type: 'SET_GROUPS',
            payload: selectedGroups
        })
    }

    const setSelectedMembersGroups = (updatedGroups) => {
        dispatch({
            type: 'SET_SELECTED_MEMBER_GROUPS',
            payload: updatedGroups
        })
    }

    const setSelectedOptions = (updatedOptions) => {
        dispatch({
            type: 'SET_OPTIONS',
            payload: updatedOptions
        })
    }

    const setSelectedDates = (updatedDates) => {
        dispatch({
            type: 'SET_DATES',
            payload: updatedDates
        })
    }

    const setSalesSelectedDates = (updatedDates) => {
        dispatch({
            type: 'SET_SALES_DATES',
            payload: updatedDates
        })
    }

    const setDefaultDates = (updatedDates) => {
        dispatch({
            type: 'DEFAULT_DATES',
            payload: updatedDates
        })
    }

    const setLoading = (loading) => {
        dispatch({
            type: 'LOADING',
            payload: loading
        })
    }

    const setHasCompare = (hasCompare) => {
        dispatch({
            type: 'HAS_COMPARE',
            payload: hasCompare
        })
    }

    const setIsGroups = (isGroups) => {
        dispatch({
            type: 'IS_GROUPS',
            payload: isGroups
        })
    }

    const setMultiYearDates = (multiYearDates) => {
        dispatch({
            type: 'MULTI_YEAR_DATES',
            payload: multiYearDates
        })
    }

    const setIsDatePickerOpen = (isDatePickerOpen) => {
        dispatch({
            type: 'IS_PICKER_OPEN',
            payload: isDatePickerOpen
        })
    }

    const setIsTouched = (isTouched) => {
        dispatch({
            type: 'IS_TOUCHED',
            payload: isTouched
        })
    }
    const setViewBy = (type) => {
        dispatch({
            type: 'VIEW_BY',
            payload: type
        })
    }
    const setPrimaryColor = (type) => {
        dispatch({
            type: 'PRIMARY_COLOR',
            payload: type
        })
    }
    const setMultiYear = (multiYear) => {
        dispatch({
            type: 'MULTI_YEAR',
            payload: multiYear
        })
    }

    const setDateRangeError = (dateRangeError) => {
        dispatch({
            type: 'DATE_ERROR',
            payload: dateRangeError
        })
    }

    const setCustomFieldData = (customFieldDatas) => {
        dispatch({
            type: 'CUSTOM_FIELD_DATA',
            payload: customFieldDatas
        })
    }

    useEffect(() => {
        setMemberGroups()
    }, [])

    const setDemographicsConfig = (demographicsConfig) => {
        dispatch({
            type: 'DEMOGRAPHICS_CONFIG',
            payload: demographicsConfig
        })
    }

    return (<GlobalContext.Provider value={{
        ...state,
        setSelectedMembersGroups,
        setSelectedOptions,
        setSelectedDates,
        setDefaultDates,
        setLoading,
        setHasCompare,
        setIsGroups,
        setMultiYearDates,
        setIsDatePickerOpen,
        setIsTouched,
        setMultiYear,
        setDateRangeError,
        setViewBy,
        setPrimaryColor,
        setSalesSelectedDates,
        setDemographicsConfig,
        setCustomFieldData
    }}>
        {children}
    </GlobalContext.Provider>);
}

