import { usePlacesWidget } from "react-google-autocomplete";

const AutoComplete = ({ getLocation }) => {

    const { ref } = usePlacesWidget({
        //TODO: should we move this to environment file?
        apiKey: process.env.REACT_APP_MAP_API_KEY,
        onPlaceSelected: (place) => getLocation(place),
        options: {
            types: ["geocode", "establishment"],
            fields: ["address_components", "geometry", "icon", "name"],
        }
    });

    return (
        <>
            <input type='text' className='controls' ref={ref} style={{ width: '50%' }} />
        </>
    )
}

export default AutoComplete;