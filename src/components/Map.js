import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.gridlayer.googlemutant';

// Custom icons for different types of markers
const metroIcon = new L.Icon({
  iconUrl: '/metro.png',
  iconSize: [30, 30],
  iconAnchor: [12, 12],
  popupAnchor: [0, -10],
});

const hospitalIcon = new L.Icon({
  iconUrl: '/hospital.png',
  iconSize: [30, 30],
  iconAnchor: [12, 12],
  popupAnchor: [0, -10],
});

const schoolIcon = new L.Icon({
  iconUrl: '/education.png',
  iconSize: [30, 30],
  iconAnchor: [12, 12],
  popupAnchor: [0, -10],
});

const projectIcon = new L.Icon({
  iconUrl: '/location-pin.png',
  iconSize: [30, 30],
  iconAnchor: [12, 12],
  popupAnchor: [0, -10],
});

const AdditionalMarkers = ({ markers }) => (
  markers.map(marker => (
    <Marker key={marker.key} position={marker.position} icon={marker.icon}>
      <Popup>{marker.popupContent}</Popup>
    </Marker>
  ))
);

const ZoomToProject = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 12);
    }
  }, [position, map]);
  return null;
};

export function Map() {
  const defaultPosition = [12.9927655, 77.8060448];
  const [projects, setProjects] = useState([]);
  const [metroData, setMetroData] = useState(null);
  const [showMetro, setShowMetro] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [additionalMarkers, setAdditionalMarkers] = useState([]);

  useEffect(() => {
    fetch('/updated_file_with_nearby_json.json')
      .then(response => response.json())
      .then(data => {
        console.log('Projects data:', data);
        setProjects(data);
      })
      .catch(error => {
        console.error('Error fetching JSON data:', error);
      });

    fetch('/metro-lines-stations.geojson')
      .then(response => response.json())
      .then(data => {
        setMetroData(data);
      })
      .catch(error => {
        console.error('Error fetching GeoJSON data:', error);
      });
  }, []);

  const handleMarkerClick = (project) => {
    console.log('Selected project:', project);
    setSelectedProject(project);
    const additionalMarkersData = [];

    const processNearbyLocations = (locations, type, icon) => {
      if (locations && Array.isArray(locations)) {
        locations.forEach((location, index) => {
          const [name, distance, coordinates] = Array.isArray(location) ? location : [location.name, location.distance, [location.coordinates.latitude, location.coordinates.longitude]];
          if (Array.isArray(coordinates) && coordinates.length === 2) {
            const [latitude, longitude] = coordinates;
            if (!isNaN(latitude) && !isNaN(longitude)) {
              additionalMarkersData.push({
                key: `${type}-${index}`,
                position: [latitude, longitude],
                icon: icon,
                popupContent: `${name} (${distance} km)`,
              });
            } else {
              console.warn(`Invalid ${type} coordinates for ${name}`);
            }
          } else {
            console.warn(`Coordinates object missing for ${type}: ${name}`);
          }
        });
      } else {
        console.warn(`Nearest ${type} data missing or not an array.`);
      }
    };

    processNearbyLocations(project.nearest_metros, 'metro', metroIcon);
    processNearbyLocations(project.nearest_hospitals, 'hospital', hospitalIcon);
    processNearbyLocations(project.nearest_schools, 'school', schoolIcon);

    setAdditionalMarkers(additionalMarkersData);
  };

  const handleResetClick = () => {
    setSelectedProject(null);
    setAdditionalMarkers([]);
  };

  return (
    <section className="map">
      <div className="container">
        <MapContainer style={{ height: '60vh', width: '100%' }} center={defaultPosition} zoom={12} scrollWheelZoom={true}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}"
            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
          />
          {!selectedProject && projects.map((project, index) => (
            <Marker
              key={`project-${index}`}
              position={[project.Latitude, project.Longitude]}
              icon={projectIcon}
              eventHandlers={{ click: () => handleMarkerClick(project) }}
            >
              <Popup>{project['Project Name']}</Popup>
            </Marker>
          ))}
          {selectedProject && (
            <>
              <ZoomToProject position={[selectedProject.Latitude, selectedProject.Longitude]} />
              <Marker key={`selected-project`} icon={projectIcon} position={[selectedProject.Latitude, selectedProject.Longitude]}>
                <Popup>{selectedProject['Project Name']}</Popup>
              </Marker>
              <AdditionalMarkers markers={additionalMarkers} />
            </>
          )}
          {showMetro && metroData && <GeoJSON data={metroData} />}
        </MapContainer>
        {selectedProject && (
          <button onClick={handleResetClick} style={{ marginTop: '10px' }}>
            Reset to Project Markers
          </button>
        )}
      </div>
    </section>
  );
}
