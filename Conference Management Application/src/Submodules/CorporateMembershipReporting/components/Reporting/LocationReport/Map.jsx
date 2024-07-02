import React from "react";
import { MapsComponent, Inject, LayersDirective, LayerDirective, Zoom, MapsTooltip, Selection, Highlight, Legend, DataLabel } from '@syncfusion/ej2-react-maps';
import { generateGeoJson, getShapeDataPath } from "./helper";
import {ErrorBoundary, ErrorFallback} from './errorBoundary'
import { REGION_VIEW, STATE_VIEW } from "../../../constants";
export default class Map extends React.PureComponent {
  render() {
    const { mapRef, locationsInfo, colormapping, selectedView, handleMapClick } = this.props;
    let dataKey = getShapeDataPath(selectedView);
    const countKey = 'Members';
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <MapsComponent
          ref={m => mapRef.current = m}
          id="maps"
          zoomSettings={{
            enable: true,
            pinchZooming: true,
            toolbars: ['ZoomIn', 'ZoomOut'],
          }}
          height={`${window.innerHeight - 120}px`}
          shapeSelected={(e)=>handleMapClick(e,selectedView.includes("REGION_VIEW")? REGION_VIEW: STATE_VIEW)}
          legendSettings={{
            visible: true,
            mode: 'Interactive',
            position: 'Bottom',
            height: '10',
            width: '350',
            // position: 'Right',
            // height: '400',
            // width: '10',
            alignment: 'Center',
            labelDisplayMode: 'Trim',
            textStyle: {
              color: '#757575'
            }
          }}
          enablePersistence={true}
        >
          <Inject services={[DataLabel, MapsTooltip, Zoom, Selection, Highlight, Legend]} />
          <LayersDirective>
            <LayerDirective
              shapeData={{
                type: "FeatureCollection",
                features: generateGeoJson(selectedView)
              }}
              shapePropertyPath={'name'}
              shapeDataPath={dataKey}
              dataSource={locationsInfo[selectedView]}
              tooltipSettings={{
                visible: true,
                valuePath: dataKey,
                template: `<div id="tooltemplate" class="pa-2">
              <div><center>\${${dataKey}}</center></div>
              <hr class="my-1"/><div><center>
                  <span style="color: #cccccc">Count : </span><span>\${${countKey}}</span>
              </center></div></div>`
              }}
              highlightSettings={{
                enable: true,
                fill: '#A3B0D0'
              }}
              shapeSettings={{
                colorValuePath: 'Members',
                colorMapping: colormapping[selectedView]
              }}
            >
            </LayerDirective>
          </LayersDirective>
        </MapsComponent>
      </ErrorBoundary>
    )
  }
}