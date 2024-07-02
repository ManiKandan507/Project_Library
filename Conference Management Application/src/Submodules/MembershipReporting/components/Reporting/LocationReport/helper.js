import _map from "lodash/map";
import _groupBy from "lodash/groupBy";
import _sumBy from "lodash/sumBy";
import _findKey from 'lodash/findKey';
import _maxBy from "lodash/maxBy";
import _flatten from "lodash/flatten";
import { Button } from "antd";
import { CANADA_API_KEY, CANADA_REGIONS_LIST, CANADA_VIEW, CONTINENTS_BASED_COUNTRIES, CONTINENT_VIEW, COUNTRY_VIEW, REGION_VIEW, STATE_VIEW, USA_API_KEY, USA_REGIONS_LIST, USA_VIEW } from '@/MembershipReporting/components/Reporting/LocationReport/constants';
import GEO_COUNTRIES from "@/MembershipReporting/components/Reporting/LocationReport/geojsons/countries.json";
import GEO_USA from "@/MembershipReporting/components/Reporting/LocationReport/geojsons/usa-states.json";
import GEO_CANADA from "@/MembershipReporting/components/Reporting/LocationReport/geojsons/canada-states.json";
import { currencyFormatter } from '@/MembershipReporting/util';

export const hashMapCountryBasedData = (countries) => {
  let mappedCountries = countries.map(country => {
    let tempCountry = {
      ...country,
      Country: country.Country == "" ? "Unknown" : country.Country,
    }
    return ({
      ...tempCountry,
      Members: tempCountry['CountPerCountry'],
      Continent: (_findKey(CONTINENTS_BASED_COUNTRIES, (o) => o.includes(tempCountry["Country"])) ?? 'N/A'),
      key: tempCountry["Country"]
    })
  }
  ).filter(e => e.Country);
  let mappedContinents = _map(
    _groupBy(mappedCountries, 'Continent'),
    (groupArr, Continent) => {
      return ({
        Continent,
        Members: _sumBy(groupArr, 'Members'),
        Country: groupArr.map(e => e.Country),
        key: Continent
      })
    }
  )
  return ({ [COUNTRY_VIEW]: mappedCountries, [CONTINENT_VIEW]: mappedContinents })
}

export const hashMapStateBasedData = (states) => {
  let returnObj = {
    [`${USA_VIEW}_${STATE_VIEW}`]: [],
    [`${USA_VIEW}_${REGION_VIEW}`]: [],
    [`${CANADA_VIEW}_${STATE_VIEW}`]: [],
    [`${CANADA_VIEW}_${REGION_VIEW}`]: []
  };
  _map(
    _groupBy(states.map(state => ({
      ...state,
      Members: state['CountPerCountry'],
      Region: _findKey({ ...CANADA_REGIONS_LIST, ...USA_REGIONS_LIST }, (o) => o.includes(state["State"])),
      key: state['State']
    })).filter(e => e.Country && e.State && e.Region), 'Country'),
    (statesArr, Country) => {
      let resultViewKeys = { stateKey: `${USA_VIEW}_${STATE_VIEW}`, regionKey: `${USA_VIEW}_${REGION_VIEW}` }
      if (Country === CANADA_API_KEY) {
        resultViewKeys = { stateKey: `${CANADA_VIEW}_${STATE_VIEW}`, regionKey: `${CANADA_VIEW}_${REGION_VIEW}` }
      }
      returnObj[resultViewKeys.stateKey] = statesArr;
      returnObj[resultViewKeys.regionKey] = _map(
        _groupBy(statesArr, 'Region'),
        (regionArr, Region) => ({
          Region,
          Members: _sumBy(regionArr, 'Members'),
          Country: Object.keys(CANADA_REGIONS_LIST).includes(Region) ? CANADA_API_KEY : USA_API_KEY,
          State:regionArr.map((data)=>data.State),
          key: Region
        })
      )
    }
  )
  return returnObj;
};

const DownloadMemberInfo = ({ data, keyVal, text, callback }) => {
  return Number(text) > 0 ? <Button type='link' onClick={() => callback(data, keyVal)}>{currencyFormatter(text, false)}</Button> : 0
}
const getCustomRender = (callback, className) => {
  if (callback) {
    return (text, data) => <DownloadMemberInfo text={text} data={data} keyVal={'Members'} callback={callback} />
  } else {
    return text => <div className={className}><strong>{text}</strong></div>
  }
}
export const getColumnsConfig = (callback) => {
  let baseArr = {
    [COUNTRY_VIEW]: [{ key: 'Country', left: true }, { key: 'Members', render: (data) => callback(data, true, COUNTRY_VIEW) }],
    [CONTINENT_VIEW]: [{ key: 'Continent', left: true }, { key: 'Members', render: (data) => callback(data, false, CONTINENT_VIEW) }],
    [`${USA_VIEW}_${STATE_VIEW}`]: [{ key: 'Country', left: true }, { key: 'State' }, { key: 'Members', render: (data) => callback(data, false, `${USA_VIEW}_${STATE_VIEW}`) }],
    [`${USA_VIEW}_${REGION_VIEW}`]: [{ key: 'Region', left: true }, { key: 'Members', render: (data) => callback(data, false, `${USA_VIEW}_${REGION_VIEW}`) }],
    [`${CANADA_VIEW}_${STATE_VIEW}`]: [{ key: 'Country', left: true }, { key: 'State' }, { key: 'Members', render: (data) => callback(data, false, `${CANADA_VIEW}_${STATE_VIEW}`) }],
    [`${CANADA_VIEW}_${REGION_VIEW}`]: [{ key: 'Region', left: true }, { key: 'Members', render: (data) => callback(data, false, `${CANADA_VIEW}_${REGION_VIEW}`) }],
  }
  let returnObj = {};
  _map(baseArr, (childArr, viewKey) => {
    returnObj[viewKey] = childArr.map(({ key, render = false, left = false }) => ({
      label: key,
      title: <div className={left ? 'text-left' : 'text-center'}>{key}</div>,
      dataIndex: key,
      key: key,
      render: getCustomRender(render, left ? 'text-left' : 'text-center'),
    }))
  })
  return returnObj;
}

export const constructSelectedItem = (data, view) => {
  switch (view) {
    case COUNTRY_VIEW: {
      return ({ value: data.Members, country: data.Country })
    }
    case CONTINENT_VIEW: {
      return ({ value: data.Members, continent: data.Continent })
    }
    case `${USA_VIEW}_${STATE_VIEW}`: {
      return ({ value: data.Members, country: data.Country, state: data.State })
    }
    case `${USA_VIEW}_${REGION_VIEW}`: {
      return ({ value: data.Members, country: data.Country, region: data.Region })
    }
    case `${CANADA_VIEW}_${STATE_VIEW}`: {
      return ({ value: data.Members, country: data.Country, state: data.State })
    }
    case `${CANADA_VIEW}_${REGION_VIEW}`: {
      return ({ value: data.Members, country: data.Country, region: data.Region })
    }
    default: {
      return ({ value: data.Members, country: data.Country })
    }
  }
}

const LEGEND_DIVISIONS = 5;
const LEGEND_COLORS = ['#79d2d2', '#53C6C6', '#39acac', '#339999', '#2d8686',]
const combineCoordinates = (geojson, key) => {
  return _map(
    _groupBy(geojson.features, (f) => f.properties[key]),
    (features, name) => ({
      type: 'Feature',
      properties: { name },
      geometry: {
        type: "MultiPolygon",
        coordinates: _flatten(features.map(f => {
          if (f.geometry.type === "Polygon") return [f.geometry.coordinates]
          return f.geometry.coordinates
        }))
      }
    })
  )
}
export const generateGeoJson = (selectedView) => {
  switch (selectedView) {
    case COUNTRY_VIEW: {
      return GEO_COUNTRIES.features
    }
    case CONTINENT_VIEW: {
      return combineCoordinates(GEO_COUNTRIES, "continent");
    }
    case `${USA_VIEW}_${STATE_VIEW}`: {
      return _flatten([GEO_COUNTRIES.features, GEO_USA.features])
    }
    case `${USA_VIEW}_${REGION_VIEW}`: {
      return _flatten([GEO_COUNTRIES.features, combineCoordinates(GEO_USA, 'region')])
    }
    case `${CANADA_VIEW}_${STATE_VIEW}`: {
      return _flatten([GEO_COUNTRIES.features, GEO_CANADA.features])
    }
    case `${CANADA_VIEW}_${REGION_VIEW}`: {
      return _flatten([GEO_COUNTRIES.features, combineCoordinates(GEO_CANADA, 'region')])
    }
    default: {
      return GEO_COUNTRIES.features
    }
  }
}

export const getLegendColorMapping = (obj) => {
  let returnObj = {};
  Object.keys(obj).forEach((key) => {
    if (!key.toLowerCase().includes('modal')) {
      let maxObj = _maxBy(obj[key], 'Members')
      let maxValue = maxObj ? maxObj['Members'] : 0;
      let resultArr = [];
      if (maxValue) {
        let incrementRange = Math.floor(maxValue / LEGEND_DIVISIONS);
        for (let i = 0; i < LEGEND_DIVISIONS; i++) {
          let from = i * incrementRange;
          let to = (i + 1) * incrementRange;
          if (i === LEGEND_DIVISIONS - 1) to = maxValue;
          resultArr.push({ from, to, color: LEGEND_COLORS[i], label: `${from}-${to}` })
        }
      }
      returnObj[key] = resultArr.length ? resultArr : [{ showLegend: false }];;
    }
  })
  return returnObj;
}

export const getShapeDataPath = (view) => {
  switch (view) {
    case COUNTRY_VIEW: { return 'Country' }
    case CONTINENT_VIEW: { return 'Continent' }
    case `${USA_VIEW}_${STATE_VIEW}`: { return 'State' }
    case `${USA_VIEW}_${REGION_VIEW}`: { return 'Region' }
    case `${CANADA_VIEW}_${STATE_VIEW}`: { return 'State' }
    case `${CANADA_VIEW}_${REGION_VIEW}`: { return 'Region' }
  }
}