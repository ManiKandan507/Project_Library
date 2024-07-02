import React, { createContext, useEffect, useReducer } from "react";
import Reducer from "./Reducer";

const initialState = {
    donationCategory: [],
    donationTypes: [],
    selectedDonationCategory: [],
    filteredCategory: [],
    donationCategoryData: [],
    selectedDonation: [],
    orderCategory: [],
    setShowCategoryFilter: false,
    showMore: false,
    config: {}
}

const GlobalContext = createContext(initialState);
export default GlobalContext;

export const GlobalProvider = (props) => {

    const { children, donationCategory, staticConfig } = props

    const [state, dispatch] = useReducer(Reducer, initialState);

    const setConfig = () => {
        dispatch({
            type: 'STATIC_CONFIG',
            payload: staticConfig
        })
    }

    const setDonationCategory = () => {
        dispatch({
            type: 'CATEGORY_IDS',
            payload: donationCategory
        })
    }

    const setDonationTypes = () => {
        const donationTypes = donationCategory.map((value) => value.donation_name)
        dispatch({
            type: 'DONATION_TYPES',
            payload: donationTypes
        })
    }

    const setSelectedDonationTypes = (updatedCategory) => {
        dispatch({
            type: 'SET_SELECTED_CATEGORY_IDS',
            payload: updatedCategory
        })
    }

    const setFilteredCategory = (filteredValue) => {
        dispatch({
            type: 'SET_FILTERED_CATEGORY',
            payload: filteredValue
        })
    }

    const setDonationCategoryData = (categoryData) => {
        dispatch({
            type: 'SET_DONATION_CATEGORY_DATA',
            payload: categoryData
        })
    }

    const setSelectedDonation = (selectedDonation) => {
        dispatch({
            type: "SELECTED_DONATION",
            payload: selectedDonation
        })
    }

    const setOrderCategory = (orderCategory) => {
        dispatch({
            type: 'ORDER_CATEGORY',
            payload: orderCategory
        })
    }

    const setShowCategoryFilter = (showFilter) => {
        dispatch({
            type: 'SHOW_CATEGORY_FILTER',
            payload: showFilter
        })
    }

    const setShowMore = (showMore) => {
        dispatch({
            type: 'SET_SHOW_MORE',
            payload: showMore
        })
    }

    useEffect(() => {
        if (donationCategory?.length > 0) {
            setDonationCategory()
            setDonationTypes()
        }
        if (Object.keys(staticConfig).length > 0) {
            setConfig()
        }
    }, [donationCategory])

    return (<GlobalContext.Provider value={{
        ...state,
        setSelectedDonationTypes,
        setFilteredCategory,
        setDonationCategoryData,
        setSelectedDonation,
        setOrderCategory,
        setShowCategoryFilter,
        setShowMore,
    }}>
        {children}
    </GlobalContext.Provider>);

}