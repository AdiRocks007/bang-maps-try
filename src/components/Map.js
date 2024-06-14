import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Select from 'react-select';
import 'leaflet/dist/leaflet.css';
import './Map.css'; // Make sure to import the CSS file
import ProjectPopup from '../components/Project_popup/ProjectPopup';

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
  const [imageData, setImageData] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectCenter, setProjectCenter] = useState(defaultCenter);

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

    fetch('/output_projects_with_images.json') // Assuming the image data is in this file
      .then(response => response.json())
      .then(data => setImageData(data))
      .catch(error => console.error('Error fetching images data:', error));
  }, []);

  const handleAmenityChange = (selectedOptions) => {
    const options = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedOptions(options);

    updateMarkers(selectedProject, options);
  };

  const updateMarkers = (projectId, amenities) => {
    const newMarkers = [];

    if (projectId) {
      const project = projects.find(p => p['Internal ID'] === projectId);
      amenities.forEach(option => {
        if (option === 'metro') {
          project.nearest_metros.forEach(metro => newMarkers.push({ ...metro, type: 'metro' }));
        } else if (option === 'school') {
          project.nearest_schools.forEach(school => newMarkers.push({ ...school, type: 'school' }));
        } else if (option === 'hospital') {
          project.nearest_hospitals.forEach(hospital => newMarkers.push({ ...hospital, type: 'hospital' }));
        }
      });
    } else {
      amenities.forEach(option => {
        if (option === 'metro') {
          newMarkers.push(...metroData.map(metro => ({ ...metro, type: 'metro' })));
        } else if (option === 'school') {
          newMarkers.push(...schoolData.map(school => ({ ...school, type: 'school' })));
        } else if (option === 'hospital') {
          newMarkers.push(...hospitalData.map(hospital => ({ ...hospital, type: 'hospital' })));
        }
      });
    }

    setMarkers(newMarkers);
  };

  const getProjectImages = (projectId) => {
    const projectImages = imageData.find(item => item.project_id === projectId);
    return projectImages ? projectImages.large_image_urls : [];
  };

  const handleMarkerClick = (project) => {
    setSelectedProject(project['Internal ID']);
    setProjectCenter([project.Latitude, project.Longitude]);
    updateMarkers(project['Internal ID'], selectedOptions);
  };

  const handleReturnBack = () => {
    setSelectedProject(null);
    setProjectCenter(defaultCenter);
    updateMarkers(null, selectedOptions);
  };

  const ZoomToMarker = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(center, 16); // Zoom level 16
    }, [center, map]);
    return null;
  };

  return (
    <>
      <section className="map" style={{ width: '80%' }}>
        <div className="container" style={{ height: '100%', width: '100%' }}>
          <div className="select-container">
            <Select
              options={options}
              isMulti
              onChange={handleAmenityChange}
              placeholder="Select amenities"
              value={options.filter(option => selectedOptions.includes(option.value))}
            />
          </div>

          <MapContainer
            center={projectCenter}
            zoom={12}
            style={mapContainerStyle}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {selectedProject
              ? (
                <>
                  {projects
                    .filter(project => project['Internal ID'] === selectedProject)
                    .map((project, index) => (
                      <Marker
                        key={`project-${index}`}
                        position={[project.Latitude, project.Longitude]}
                        icon={customIcons.project}
                        eventHandlers={{
                          click: () => handleMarkerClick(project),
                        }}
                      >
                        <Popup>
                          <ProjectPopup project={project} images={getProjectImages(project['Internal ID'])} />
                        </Popup>
                      </Marker>
                    ))}
                  <ZoomToMarker center={projectCenter} />
                </>
              )
              : (
                projects.map((project, index) => (
                  <Marker
                    key={`project-${index}`}
                    position={[project.Latitude, project.Longitude]}
                    icon={customIcons.project}
                    eventHandlers={{
                      click: () => handleMarkerClick(project),
                    }}
                  >
                    <Popup>
                      <ProjectPopup project={project} images={getProjectImages(project['Internal ID'])} />
                    </Popup>
                  </Marker>
                ))
              )}
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
      {selectedProject && (
        <button onClick={handleReturnBack}>Return Back</button>
      )}
    </>
  );
};

export default Map;
