import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Sidebar } from './Sidebar/sidebar';

// Custom icons
const metroIcon = new L.Icon({
  iconUrl: '/metro.png',
  iconSize: [25, 25],
  iconAnchor: [12, 12],
  popupAnchor: [0, -10],
});

const airportIcon = new L.Icon({
  iconUrl: '/airport.png',
  iconSize: [25, 25],
  iconAnchor: [12, 12],
  popupAnchor: [0, -10],
});

export function Map() {
  const defaultPosition = [12.9927655, 77.8060448];
  const [markers, setMarkers] = useState([]);
  const [metroData, setMetroData] = useState(null);
  const [showMetro, setShowMetro] = useState(false);
  const [showStrr, setShowStrr] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [nearestDetails, setNearestDetails] = useState({
    airport: {},
    hospital: {},
    school: {}
  });

  useEffect(() => {
    fetch('/Project Master - Updated.csv')
      .then(response => response.text())
      .then(data => {
        const rows = data.split('\n');
        const header = rows[0].split(',').map(header => header.trim().toLowerCase());
        const latitudeIndex = header.indexOf('latitude');
        const longitudeIndex = header.indexOf('longitude');
        const nameIndex = header.indexOf('project name');

        if (latitudeIndex !== -1 && longitudeIndex !== -1 && nameIndex !== -1) {
          const markersData = [];
          rows.slice(1, 501).forEach((row, index) => {
            const columns = row.split(',');
            if (columns.length > latitudeIndex && columns.length > longitudeIndex && columns.length > nameIndex &&
              columns[latitudeIndex].trim() && columns[longitudeIndex].trim() && columns[nameIndex].trim()) {
              const latitude = parseFloat(columns[latitudeIndex].trim());
              const longitude = parseFloat(columns[longitudeIndex].trim());

              if (!isNaN(latitude) && !isNaN(longitude)) {
                markersData.push({ latitude, longitude, name: columns[nameIndex].trim() });
              } else {
                console.warn(`Invalid coordinates at row ${index + 1}: Latitude or longitude is not a valid number.`);
              }
            } else {
              console.warn(`Invalid coordinates at row ${index + 1}: Latitude, longitude, or name is missing.`);
            }
          });
          setMarkers(markersData);
        } else {
          console.error('Latitude, longitude, or project name column not found in CSV.');
        }
      })
      .catch(error => {
        console.error('Error fetching CSV data:', error);
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

  const metroStyle = {
    color: 'magenta',
    weight: 5,
  };

  const fetchNearestPlaces = async (project) => {
    const places = ['airport', 'hospital', 'school'];
    const nearestDetails = {};

    for (const place of places) {
      try {
        const response = await fetch(`http://localhost:5000/api/places?type=${place}&lat=${project.latitude}&lng=${project.longitude}`);
        const data = await response.json();
        nearestDetails[place] = {
          name: data.results[0]?.name || 'Not found',
          distance: calculateDistance(project.latitude, project.longitude, data.results[0]?.geometry.location.lat || 0, data.results[0]?.geometry.location.lng || 0)
        };
      } catch (error) {
        nearestDetails[place] = {
          name: 'Error fetching data',
          distance: 0
        };
        console.error(`Error fetching ${place} data:`, error);
      }
    }

    setNearestDetails(nearestDetails);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleMarkerClick = async (project) => {
    setSelectedProject(project);
    await fetchNearestPlaces(project);
  };

  return (
    <section className='map-component'>
      <div className='map-filters'>
        <button onClick={() => setShowMetro(!showMetro)}>
          {showMetro ? 'Hide Metro Routes' : 'Show Metro Routes'}
        </button>
        <button onClick={() => setShowStrr(!showStrr)}>
          {showStrr ? 'Hide STRR Road' : 'Show STRR Road'}
        </button>
      </div>
      <div className='map'>
        <MapContainer style={{ height: '60vh', width: '100%' }} center={defaultPosition} zoom={12} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((marker, index) => (
            <Marker key={index} position={[marker.latitude, marker.longitude]} icon={L.icon({
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            })} eventHandlers={{ click: () => handleMarkerClick(marker) }}>
              <Popup>{marker.name}</Popup>
            </Marker>
          ))}
          {showMetro && metroData && (
            <GeoJSON
              data={metroData}
              style={metroStyle}
              pointToLayer={(feature, latlng) => {
                if (feature.geometry.type === 'Point') {
                  return L.marker(latlng, { icon: metroIcon });
                }
                return L.circleMarker(latlng);
              }}
            />
          )}
          {showStrr && (
            <GeoJSON data={{
              "type": "Feature",
              "properties": {},
              "geometry": {
                "type": "Polygon",
                "coordinates": [
                  [
                    [77.3872, 12.8010],
                    [77.4538, 12.9433],
                    [77.5672, 12.9460],
                    [77.5436, 13.2944],
                    [77.7110, 13.2507],
                    [77.7095, 13.0905],
                    [77.9826, 13.0943],
                    [78.0186, 13.0052],
                    [77.9005, 12.8110],
                    [77.9202, 12.7783],
                    [77.6916, 12.6964],
                    [77.3872, 12.8010]
                  ]
                ]
              }
            }} style={{ color: 'blue', weight: 5 }} />
          )}
        </MapContainer>
      </div>
      <Sidebar
        isOpen={!!selectedProject}
        project={selectedProject}
        airport={nearestDetails.airport}
        hospital={nearestDetails.hospital}
        school={nearestDetails.school}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
