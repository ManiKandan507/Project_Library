import { useState, useEffect, useRef, useContext } from "react";
import { DeleteOutlined, EditOutlined, LoadingOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Form, Modal, Select, Input, Button, Spin } from 'antd';

import AutoComplete from "./AutoComplete";
import * as MapIcons from "./MarkersIcons/index"
import * as OptionIcons from "./OptionsIcon/index"
import homeIcon from './Icons/homeIcon.png'
import MarkerContext from "../MarkerContext";
import "./index.css";

const antIcon = (
  <LoadingOutlined
    style={{
      fontSize: 24,
    }}
    spin
  />
);

const ICON_OPTIONS = [
  {
    value: 'bar',
    label: 'Bar'
  },
  {
    value: 'cafe',
    label: 'Hotel'
  },
  {
    value: 'food',
    label: 'Food',
  },
  {
    value: 'cityHall',
    label: 'Landmark'
  },
  {
    value: 'play',
    label: 'Play',
  },
  {
    value: 'trainStation',
    label: 'Transportation'
  }
]

const { TextArea } = Input;
const confirm = Modal.confirm;

const MapContainer = (props) => {
  const mapRef = useRef(null);
  const markerRef = useRef([]);
  const [form] = Form.useForm();

  const { loading, mapConfigurations, handleSaveMapConfiguration } = useContext(MarkerContext);
  const [markers, setMarkers] = useState([]);
  const [zoom, setZoom] = useState(10);
  const [initMapView, setInitMapView] = useState(false);
  const [center, setCenter] = useState({});
  const [initialMapConfig, setInitialMapConfig] = useState({});
  const [showForm, setShowForm] = useState({ visible: false });

  const markerIcons = {
    'play': {
      'url': MapIcons.stadium,
      scaledSize: new window.google.maps.Size(40, 40),
    },
    'food': {
      'url': MapIcons.food,
      scaledSize: new window.google.maps.Size(40, 40),
    },
    'cafe': {
      'url': MapIcons.cafe,
      scaledSize: new window.google.maps.Size(37, 40),
    },
    'education': {
      'url': MapIcons.university,
      scaledSize: new window.google.maps.Size(40, 41),
    },
    'shop': {
      'url': MapIcons.groceryOrSupermarket,
      scaledSize: new window.google.maps.Size(40, 40),
    },
    'bar': {
      'url': MapIcons.bar,
      scaledSize: new window.google.maps.Size(38, 40),
    },
    'home': {
      'url': MapIcons.Home,
      scaledSize: new window.google.maps.Size(40, 40),
    },
    'airport': {
      'url': MapIcons.airport,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    'amusementPark': {
      'url': MapIcons.amusementPark,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    'atm': {
      'url': MapIcons.atm,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    'bank': {
      'url': MapIcons.bank,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    'busStation': {
      'url': MapIcons.busStation,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    'cityHall': {
      'url': MapIcons.cityHall,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    'groceryOrSupermarket': {
      'url': MapIcons.groceryOrSupermarket,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    'gym': {
      'url': MapIcons.gym,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    'hospital': {
      'url': MapIcons.hospital,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    'parking': {
      'url': MapIcons.parking,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    'trainStation': {
      'url': MapIcons.trainStation,
      scaledSize: new window.google.maps.Size(40, 40)
    }
  }

  const optionIcons = {
    'play': {
      'url': OptionIcons.stadium,
      scaledSize: new window.google.maps.Size(40, 40),
    },
    'food': {
      'url': OptionIcons.food,
      scaledSize: new window.google.maps.Size(40, 40),
    },
    'cafe': {
      'url': OptionIcons.cafe,
      scaledSize: new window.google.maps.Size(37, 40),
    },
    'education': {
      'url': OptionIcons.university,
      scaledSize: new window.google.maps.Size(40, 41),
    },
    'shop': {
      'url': OptionIcons.groceryOrSupermarket,
      scaledSize: new window.google.maps.Size(40, 40),
    },
    'bar': {
      'url': OptionIcons.bar,
      scaledSize: new window.google.maps.Size(38, 40),
    },
    'home': {
      'url': OptionIcons.Home,
      scaledSize: new window.google.maps.Size(40, 40),
    },
    'airport': {
      'url': OptionIcons.airport,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    'amusementPark': {
      'url': OptionIcons.amusementPark,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    'atm': {
      'url': OptionIcons.atm,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    'bank': {
      'url': OptionIcons.bank,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    'busStation': {
      'url': OptionIcons.busStation,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    'cityHall': {
      'url': OptionIcons.cityHall,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    'groceryOrSupermarket': {
      'url': OptionIcons.groceryOrSupermarket,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    'gym': {
      'url': OptionIcons.gym,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    'hospital': {
      'url': OptionIcons.hospital,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    'parking': {
      'url': OptionIcons.parking,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    'trainStation': {
      'url': OptionIcons.trainStation,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    'university': {
      'url': OptionIcons.university,
      scaledSize: new window.google.maps.Size(40, 40)
    }
  }

  useEffect(() => {
    if (Object.keys(mapConfigurations?.map_config?.map_default_view ?? {}).length > 0) {
      setCenter(mapConfigurations?.map_config?.map_default_view);
      setInitialMapConfig(mapConfigurations);
      if (mapConfigurations?.map_config?.markers?.length) {
        setMarkers(mapConfigurations?.map_config?.markers);
      }
      setInitMapView(true);
    }
  }, [mapConfigurations])

  useEffect(() => {
    if (initMapView && !loading) {
      initAutoComplete();
    }
  }, [initMapView, loading])

  useEffect(() => {
    let markersRefCopy = markerRef.current;
    const bounds = new window.google.maps.LatLngBounds();
    markersRefCopy.forEach((marker) => {
      marker.setMap(null);
    });
    markersRefCopy = [];
    markers.forEach(marker => {
      let currentMarker = new window.google.maps.Marker({
        map: mapRef.current,
        icon: marker.id === 1 ? markerIcons['home'] : markerIcons[marker.icon],
        title: marker.title,
        position: {
          lat: marker.latitude,
          lng: marker.longitude,
        },
      });
      currentMarker.addListener('click', (e) => {
        handleClickMarkers(marker, e)
      });
      bounds.extend(currentMarker.position);
      markersRefCopy.push(currentMarker);
    });
    markerRef.current = markersRefCopy;
    mapRef.current?.fitBounds(bounds);
    if (markers.length && mapRef.current?.getZoom() > 12) {
      mapRef.current?.setZoom(12);
    } else if (!markers.length) {
      mapRef.current?.setZoom(12);
      mapRef.current?.setCenter(center);
    }
  }, [markers, initMapView]);

  const initAutoComplete = () => {
    var map = new window.google.maps.Map(document.getElementById('map'), {
      center: center,
      zoom: zoom,
      streetViewControl: false
    });
    mapRef.current = map;

    var input = document.getElementById("pac-input");
    const searchBox = new window.google.maps.places.SearchBox(input);
    map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(input);

    map.addListener("click", (e) => {
      handleMapClick(e);
    });
    map.addListener("bounds_changed", () => {
      if (markers.length && mapRef.current?.getZoom() >= 22) {
        mapRef.current?.setZoom(12);
      }
      searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener("places_changed", () => {
      const places = searchBox.getPlaces();
      if (places.length === 0) {
        window.alert('No places found on this location');
        return;
      }

      const bounds = new window.google.maps.LatLngBounds();

      places.forEach((place) => {
        if (!place.geometry || !place.geometry.location) {
          window.alert('Returned place contains no geometry');
          return;
        }
        if (place.geometry.location) {
          setCenter(place.geometry.location?.toJSON())
        }
        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
    });
  }

  const handleEdit = (marker) => {
    setShowForm({ ...marker, visible: true });
    form.setFieldsValue({ ...marker });
  };

  const handleMapClick = (e) => {
    if (e.placeId) {
      e.stop();
      const request = {
        placeId: e.placeId,
        fields: ["name", "formatted_address", "place_id", "geometry"],
      };
      const service = new window.google.maps.places.PlacesService(mapRef.current);
      service.getDetails(request, (place, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place &&
          place.geometry &&
          place.geometry.location
        ) {
          setShowForm((prev) => ({
            ...prev, visible: true, latLng: e.latLng, title: place.name
          }))
          form.setFieldsValue({ title: place.name, description: '', icon: '' });
        }
      });
    } else {
      setShowForm((prev) => ({ ...prev, visible: true, latLng: e.latLng }));
      form.resetFields();
    }
  };

  const handleSaveMarker = (formValues) => {
    let resultMarkers = [...markers];
    if (showForm.id && markers.find(marker => marker.id === showForm.id)) {
      resultMarkers = markers.map(marker => {
        if (marker.id === showForm.id) return ({ ...marker, ...formValues })
        return marker
      });
    } else {
      const latLang = showForm?.latLng?.toJSON();
      let prevValueId = markers[markers.length - 1]?.id ?? 0;
      resultMarkers = [
        ...resultMarkers,
        {
          ...formValues,
          id: prevValueId + 1,
          latitude: latLang.lat,
          longitude: latLang.lng
        }
      ]
    }
    setMarkers(resultMarkers);
    handleSaveMapConfig({ map_config: { ...initialMapConfig.map_config, markers: resultMarkers }, });
    setShowForm({ visible: false });
  };

  const handleClickMarkers = (marker) => {
    setShowForm({ ...marker, visible: true });
    form.setFieldsValue({ ...marker });
  };

  const handleDelete = (marker) => {
    confirm({
      title: 'Confirm',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete ?',
      okText: 'YES',
      cancelText: 'NO',
      onOk: () => {
        let resultMarkers = markers.filter((v) => v.id !== marker.id)
        handleSaveMapConfig({ map_config: { ...initialMapConfig.map_config, markers: resultMarkers }, });
        setMarkers(resultMarkers);
      }
    });
  }

  const getLocation = (place) => {
    const { address_components, geometry: { location } } = place;
    let locationValue = place.name;
    const latlng = location.toJSON();
    let resultMarkers = [...markers];
    if (markers.length) {
      resultMarkers = markers.map((marker) => {
        if (marker.id === 1) {
          return ({
            id: 1,
            icon: 'home',
            title: locationValue,
            latitude: latlng.lat,
            longitude: latlng.lng
          })
        }
        return marker
      });
    } else {
      resultMarkers = [
        {
          id: 1,
          icon: 'home',
          title: locationValue,
          latitude: latlng.lat,
          longitude: latlng.lng
        }
      ];
    }
    setInitialMapConfig({ map_config: { map_default_view: latlng, markers: resultMarkers } });
    setCenter(latlng);
    setInitMapView(true);
    handleSaveMapConfig({ map_config: { map_default_view: latlng, markers: resultMarkers } });
    setMarkers(resultMarkers);
  }

  const getDistanceFromLatLonInKm = (lat2, lon2) => {
    const mapDefaultView = initialMapConfig?.map_config?.map_default_view
    if (mapDefaultView) {
      var R = 6371;
      var dLat = deg2rad(lat2 - mapDefaultView.lat);
      var dLon = deg2rad(lon2 - mapDefaultView.lng);
      var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(mapDefaultView.lat)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;
      return `${d.toFixed(2)} km`;
    }
    return 0
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

  const handleRecenter = (index) => {
    let currentMarker = markerRef.current[index];
    if (currentMarker) {
      mapRef.current.panBy(currentMarker.getPosition());
      mapRef.current.setCenter(currentMarker.getPosition());
      mapRef.current?.setZoom(12);
    }
  }

  const handleSaveMapConfig = (mapConfig) => {
    handleSaveMapConfiguration(mapConfig);
  }

  if (loading) {
    return (<div className="loading-container"><Spin indicator={antIcon} /></div>)
  }

  return (
    <main>
      <div>
        <div>
          <h2 className="header">Conference area</h2>
          <p className="subtitle">Search and find the Conference area</p>
        </div>
      </div>
      <hr
        style={{
          marginTop: "1.5em",
          marginBottom: "2em",
          backgroundColor: "#ffffff"
        }}
      />
      {!initMapView
        ? (
          <div>
            <div style={{ marginTop: '1rem' }}>
              <AutoComplete getLocation={getLocation} />
              {markers.length && markers[0]?.title ?
                <div style={{ marginTop: '1rem', width: '50%' }}>
                  <div>
                    {/* TODO: fix the language */}
                    <span style={{ fontSize: "18px", fontWeight: 'bold' }}>Current centroid</span> <span>(Search and select position will changes the centroid)</span>
                  </div>
                  <>
                    <div className='markers'
                      style={{
                        backgroundColor: '#296EAA',
                        justifyContent: 'flex-start',
                        borderTopLeftRadius: '3px',
                        borderBottomLeftRadius: '3px'
                      }}
                    >
                      <div><img src={MapIcons.initialHome} width='20' /></div>
                      <div style={{ fontWeight: 'bold', marginLeft: '0.5rem', fontSize: '18px', marginTop: '3px', color: '#ffffff' }}>{markers[0]?.title}</div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginTop: '1rem'
                      }}>
                      <Button onClick={() => setInitMapView(true)}>Cancel</Button>
                    </div>
                  </>
                </div> : null}
            </div>
          </div>
        ) : (<>
          <div className='main-container'>
            <div className="map-wrapper-container">
              <input
                id="pac-input"
                className="controls"
                type="text"
                placeholder="Search Box"
              />
              <div id="map" style={{ width: '100%', height: '100%', position: 'absolute' }}>
              </div>
            </div>
            <div className="markers-container">
              <div
                className='markers'
                style={{
                  backgroundColor: '#296EAA',
                  marginLeft: '0.3rem',
                  borderTopLeftRadius: '3px',
                  borderBottomLeftRadius: '3px'

                }}
              >
                <div className="d-flex align-center pointer" onClick={(e) => handleRecenter(0)}>
                  <div><img src={MapIcons.initialHome} width='18' /></div>
                  <div style={{ fontWeight: 'bold', marginLeft: '0.5rem', fontSize: '18px', marginTop: '3px', color: '#ffffff' }}>{markers[0]?.title}</div>
                </div>
                <div
                  style={{ cursor: 'pointer', color: '#ffffff' }}
                  onClick={() => {
                    setInitMapView(false)
                  }}
                >
                  <EditOutlined />
                </div>
              </div>
              {markers.filter((marker, index) => index !== 0 && marker.id !== 1).map((marker, index) => {
                let distance = getDistanceFromLatLonInKm(marker.latitude, marker.longitude)
                return (
                  <div key={index} className='markers' style={{ marginLeft: '0.3rem' }}>
                    <div onClick={() => handleRecenter(index + 1)}>
                      <div className="pointer title-marker">{marker.title}</div>
                      <div className="distanceAlignment">{distance} from {markers[0]?.title}</div>
                    </div>
                    <div style={{ display: 'flex' }}>
                      <div
                        className="f-1 pointer iconcolor"
                        onClick={() => { handleEdit(marker) }}>
                        {<EditOutlined />}
                      </div>
                      <div
                        onClick={() => handleDelete(marker)}
                        style={{ marginLeft: '1rem' }}
                        className="pointer iconcolor"
                      ><DeleteOutlined />
                      </div>
                    </div>
                  </div>
                )
              }
              )}
            </div>
          </div>
        </>
        )}
      <div className="modal-container">
        <Modal
          open={showForm.visible}
          header={null}
          footer={null}
          onCancel={() => setShowForm({ visible: false })}
          destroyOnClose
        >
          <div className="form-container-wrapper">
            <div className="subtitle">{`${showForm.id ? 'Edit' : 'Add'} Location:`}</div>
            <div className="form-container">
              <Form
                form={form}
                name="form"
                onFinish={handleSaveMarker}
              >
                <Form.Item
                  label='ICON'
                  name='icon'
                  rules={[{ required: true, message: 'Please Select a Option' }]}
                >
                  <Select
                    className="icon-selection"
                    options={
                      ICON_OPTIONS.map((item) => {
                        return {
                          value: item.value,
                          label: (
                            <>
                              <img src={optionIcons[item.value].url} style={{ width: 23 }} />&nbsp; {item.label}
                            </>
                          ),
                        }
                      })
                    }
                  />
                </Form.Item>
                <Form.Item
                  label='TITLE'
                  name='title'
                  rules={[{ required: true, message: 'Please Enter Location Title' }]}
                >
                  <Input
                    type="text"
                    className="modal-input"
                  />
                </Form.Item>
                <Form.Item
                  label='DESCRIPTION'
                  name='description'
                >
                  <TextArea
                    rows="4"
                    cols="50"
                  />
                </Form.Item>
                {showForm.id
                  && showForm.latitude
                  && showForm.longitude
                  ? (
                    <div className="direction-link">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${showForm.latitude},${showForm.longitude}&dir_action=navigate`}
                        target="blank"
                      >
                        Show the direction
                      </a>
                    </div>
                  ) : null
                }
                <Form.Item>
                  <Button htmlType="submit">Save</Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </Modal>
      </div>
    </main>
  );
};

export default MapContainer;
