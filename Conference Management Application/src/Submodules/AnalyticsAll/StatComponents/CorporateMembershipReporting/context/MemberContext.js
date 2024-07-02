import moment from 'moment';
import React, { createContext, useReducer, useEffect } from 'react';
import { calculateMonthDays, get90PriorDate, getCurrentDate } from '@/AnalyticsAll/StatComponents/util';
import Reducer from '@/CorporateMembershipReportingV2/context/Reducer';

const initialState = {
    membersGroup:[],
    selectedMemberGroups:[],
    selectedOptions:"date",
    selectedDates:[get90PriorDate(), getCurrentDate()],
    defaultDates:[moment().startOf('month').subtract(calculateMonthDays(2), "days"), moment()],
    loading: false,
};
const GlobalContext = createContext(initialState);
export default GlobalContext;

export const GlobalProvider = (props) => {
    const [state, dispatch] = useReducer( Reducer, initialState);
    const { config: { groups_array }, children } = props

    const setMemberGroups = () => {
        let selectedGroups = [];
        for(const group of groups_array){
            selectedGroups.push(group.groupname);
        }
        dispatch({
            type:'SET_GROUPS',
            payload:selectedGroups
        })
    }

    const setSelectedMembersGroups = (updatedGroups) =>{
        dispatch({
            type:'SET_SELECTED_MEMBER_GROUPS',
            payload:updatedGroups
        })
    }

    const setSelectedOptions = (updatedOptions) => {
        dispatch({
            type:'SET_OPTIONS',
            payload:updatedOptions
        })
    }

    const setSelectedDates = (updatedDates) => {
        dispatch({
            type:'SET_DATES',
            payload:updatedDates
        })
    }
    
    const setDefaultDates = (updatedDates) =>{
        dispatch({
            type:'DEFAULT_DATES',
            payload:updatedDates
        })
    }

    const setLoading = (loading) =>{
        dispatch({
            type:'LOADING',
            payload:loading
        })
    }

    useEffect(()=>{
        setMemberGroups()
    },[])

    return (<GlobalContext.Provider value={{
        ...state,
        setSelectedMembersGroups,
        setSelectedOptions,
        setSelectedDates,
        setDefaultDates,
        setLoading,
      }}>
        {children}
    </GlobalContext.Provider>);
}

