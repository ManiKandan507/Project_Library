import moment from "moment/moment";
import { lightenDarkenColor, toTitleCase } from "../../util";
import tinycolor from "tinycolor2";

export const timeLineChartDataConstruct = (timeLineData) => {

    const ConstructedData = Object.keys(timeLineData).map((value) => {
        return timeLineData[value].map((data) => {
            if (value === 'membership') {
                return {
                    ...data,
                    sources: value
                }
            }
            else {
                return {
                    ...data,
                    sources: data.group_name
                }
            }

        })
    }).flat(1)

    const boardDirectories = ConstructedData.filter((value) => 
    // value?.sources === 'Board of Directors' && 
    Object.keys(value).includes('designations')).map((value) => {
        return value.designations.map((data) => {
            return {
                ...data,
                sources: value?.group_name,
                group_name: data?.designation_name
            }
        })
    }).flat(1)

    const constructingDate = [...ConstructedData, ...boardDirectories].filter((value) => value !== '' && value.start_date !== '').map((data) => {
        const start_date = data?.start_date;
        const end_date = data?.end_date === '' ? moment().format('MM/DD/YYYY') : data?.end_date;

        return {
            ...data,
            sources: toTitleCase(data?.sources),
            start_date: start_date,
            end_date: end_date,
        }
    })

    const constructedTimeLineData = constructingDate.map((data) => {
        return {
            ...data,
            sources: data.sources,
            start_date: new Date(data.start_date),
            end_date: new Date(data.end_date)
        }
    })

    const constructTimeLine = constructingDate.filter((value) => value?.sources === 'Membership')

    const lastArray = constructTimeLine.length > 0 ? [{
        start_date: new Date(Math.min.apply(null, constructTimeLine.map((e) =>  new Date(e.start_date)))),
        end_date: new Date(Math.max.apply(null, constructTimeLine.map((e) =>  new Date(e.end_date)))),
        group_name: 'Membership Timeline',
        sources: constructTimeLine[0]?.sources
    }] : []

    return [...lastArray, ...constructedTimeLineData]
}

export const customColor = (primaryColor, constructedData) => {

    const tinyColor = tinycolor(`${primaryColor}`)

    const analogousColors = tinyColor.analogous();

    const complementaryColor = tinyColor.splitcomplement();

    const triad = tinyColor.triad();

    const tetrad = tinyColor.tetrad()

    const colorArray = [...triad, ...complementaryColor, ...analogousColors, ...tetrad].map((color) => {
        return lightenDarkenColor(color.toHex(), 20);
    })

    const filteredColor = [...new Set(colorArray)].filter((color) => color !== primaryColor);

    let indexvalue = 0;

    const constructData = constructedData?.map((data, i) => {
        if (i > filteredColor.length - 1) {
            indexvalue += 1
            if (indexvalue > filteredColor.length - 1) {
                indexvalue = 0
            }
        }
        else {
            indexvalue = i
        }
        
        return {
            ...data,
            color: lightenColor(`#${filteredColor[indexvalue]}`, 70),
        }
    })

    return constructData
}

const lightenColor = (color, percent) => {
    // Ensure the percent is between 0 and 100
    const validPercent = Math.min(100, Math.max(0, percent));
  
    // Parse the color into RGB components
    let r, g, b;
  
    if (color.length === 7) {
      // If the color is in hex format (e.g., #RRGGBB)
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else if (color.length === 4) {
      // If the color is in short hex format (e.g., #RGB)
      r = parseInt(color[1] + color[1], 16);
      g = parseInt(color[2] + color[2], 16);
      b = parseInt(color[3] + color[3], 16);
    } else {
      throw new Error('Invalid color format');
    }
  
    // Calculate the new RGB values
    r = Math.round(r + (255 - r) * (validPercent / 100));
    g = Math.round(g + (255 - g) * (validPercent / 100));
    b = Math.round(b + (255 - b) * (validPercent / 100));
  
    // Convert the RGB values back to hex and return the result
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  };
  