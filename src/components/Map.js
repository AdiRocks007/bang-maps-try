import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom icon for metro stops
const metroIcon = new L.Icon({
  iconUrl: '/metro.png', // Adjust the path as needed
  iconSize: [25, 25], // Adjust the size as needed
  iconAnchor: [12, 12], // Adjust the anchor point as needed
  popupAnchor: [0, -10], // Adjust the popup anchor point as needed
});

export function Map() {
  const defaultPosition = [12.9927655, 77.8060448]; // Default position
  const [markers, setMarkers] = useState([]);
  const [metroData, setMetroData] = useState(null); // State to hold the GeoJSON data
  const [showMetro, setShowMetro] = useState(false);

  useEffect(() => {
    // Fetch data from CSV or use any other method to get your data
    fetch('/Project Master - Updated.csv') // Adjust the file path
      .then(response => response.text())
      .then(data => {
        // Parse CSV data
        const rows = data.split('\n');
        const header = rows[0].split(',').map(header => header.trim().toLowerCase()); // Trim whitespace characters and convert to lowercase

        console.log('CSV Header:', header); // Log the header to the console

        const latitudeIndex = header.indexOf('latitude');
        const longitudeIndex = header.indexOf('longitude');
        const nameIndex = header.indexOf('project name');

        if (latitudeIndex !== -1 && longitudeIndex !== -1 && nameIndex !== -1) {
          const markersData = [];
          rows.slice(1, 501).forEach((row, index) => { // Only process the first 500 entries
            const columns = row.split(',');

            // Check if latitude, longitude, and name columns are valid
            if (columns.length > latitudeIndex && columns.length > longitudeIndex && columns.length > nameIndex &&
              columns[latitudeIndex].trim() && columns[longitudeIndex].trim() && columns[nameIndex].trim()) {
              const latitude = parseFloat(columns[latitudeIndex].trim());
              const longitude = parseFloat(columns[longitudeIndex].trim());

              // Check if latitude and longitude values are valid numbers
              if (!isNaN(latitude) && !isNaN(longitude)) {
                console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
                markersData.push({ latitude, longitude, name: columns[nameIndex].trim() });
              } else {
                console.warn(`Invalid coordinates at row ${index + 1}: Latitude or longitude is not a valid number.`);
              }
            } else {
              console.warn(`Invalid coordinates at row ${index + 1}: Latitude, longitude, or name is missing.`);
            }
          });

          console.log('Markers Data:', markersData); // Log the markers data to the console
          setMarkers(markersData);
        } else {
          console.error('Latitude, longitude, or project name column not found in CSV.');
        }
      })
      .catch(error => {
        console.error('Error fetching CSV data:', error);
      });

    // Fetch metro routes GeoJSON data
    fetch('/metro-lines-stations.geojson') // Adjust the file path to your GeoJSON file
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

  return (
    <section className='map-component'>
      <button onClick={() => setShowMetro(!showMetro)}>
        {showMetro ? 'Hide Metro Routes' : 'Show Metro Routes'}
      </button>
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
            })}>
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
        </MapContainer>
      </div>
    </section>
  );
}
