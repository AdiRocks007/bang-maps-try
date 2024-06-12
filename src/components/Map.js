import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Select from 'react-select';
import 'leaflet/dist/leaflet.css';
import './Map.css'; // Make sure to import the CSS file

const defaultCenter = { lat: 12.9927655, lng: 77.8060448 };

const mapContainerStyle = {
  height: '70vh',
  width: '100%',
};

const options = [
  { value: 'metro', label: 'Metros' },
  { value: 'school', label: 'Schools' },
  { value: 'hospital', label: 'Hospitals' },
];

const customIcons = {
  metro: new L.Icon({
    iconUrl: '/metro.png',
    iconSize: [40, 40],
  }),
  school: new L.Icon({
    iconUrl: '/education.png',
    iconSize: [40, 40],
  }),
  hospital: new L.Icon({
    iconUrl: '/hospital.png',
    iconSize: [40, 40],
  }),
  project: new L.Icon({
    iconUrl: '/location-pin.png', // Make sure to have this icon in the public directory
    iconSize: [40, 40],
  }),
};

const Map = () => {
  const [projects, setProjects] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [metroData, setMetroData] = useState([]);
  const [schoolData, setSchoolData] = useState([]);
  const [hospitalData, setHospitalData] = useState([]);
  const [markers, setMarkers] = useState([]);

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

    fetch('/metros.json')
      .then(response => response.json())
      .then(data => setMetroData(data))
      .catch(error => console.error('Error fetching metros data:', error));

    fetch('/schools.json')
      .then(response => response.json())
      .then(data => setSchoolData(data))
      .catch(error => console.error('Error fetching schools data:', error));

    fetch('/hospitals.json')
      .then(response => response.json())
      .then(data => setHospitalData(data))
      .catch(error => console.error('Error fetching hospitals data:', error));
  }, []);

  const handleAmenityChange = (selectedOptions) => {
    const options = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedOptions(options);

    const newMarkers = [];
    options.forEach(option => {
      if (option === 'metro') {
        metroData.forEach(metro => newMarkers.push({ ...metro, type: 'metro' }));
      } else if (option === 'school') {
        schoolData.forEach(school => newMarkers.push({ ...school, type: 'school' }));
      } else if (option === 'hospital') {
        hospitalData.forEach(hospital => newMarkers.push({ ...hospital, type: 'hospital' }));
      }
    });
    setMarkers(newMarkers);
  };

  return (
    <section className="map" style={{ width: '80%' }}>
      <div className="container" style={{ height: '100%', width: '100%' }}>
        <div className="select-container">
          <Select
            options={options}
            isMulti
            onChange={handleAmenityChange}
            placeholder="Select amenities"
          />
        </div>
        <MapContainer
          center={defaultCenter}
          zoom={12}
          style={mapContainerStyle}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {projects.map((project, index) => (
            <Marker
              key={`project-${index}`}
              position={[project.Latitude, project.Longitude]}
              icon={customIcons.project}
            >
              <Popup>{project['Project Name']}</Popup>
            </Marker>
          ))}
          {markers.map((marker, index) => (
            <Marker
              key={`marker-${index}`}
              position={[marker.coordinates.latitude, marker.coordinates.longitude]}
              icon={customIcons[marker.type]}
            >
              <Popup>{marker.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
};

export default Map;
