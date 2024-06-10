import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import Select from 'react-select';

const libraries = ['places', 'geometry']; // Include 'geometry' library

const defaultCenter = { lat: 12.9927655, lng: 77.8060448 };

const mapContainerStyle = {
  height: '60vh',
  width: '100%',
};

const nightMode = [
  // Include your night mode styles here
];

const mapOptions = {
  disableDefaultUI: true,
  styles: nightMode,
};

const options = [
  { value: 'school', label: 'Schools' },
  { value: 'hospital', label: 'Hospitals' },
  { value: 'subway_station', label: 'Metros' },
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'cafe', label: 'Cafes' },
  { value: 'bank', label: 'Banks' },
  // Add more options as needed
];

const MAX_RADIUS = 50000; // Maximum radius for nearby search in meters

const Map = () => {
  const [projects, setProjects] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [customIcons, setCustomIcons] = useState({});
  const mapRef = useRef(null);
  const serviceRef = useRef(null);

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
  }, []);

  const initializeIcons = () => {
    setCustomIcons({
      school: {
        url: '/education.png',
        scaledSize: new window.google.maps.Size(40, 40),
      },
      hospital: {
        url: '/hospital.png',
        scaledSize: new window.google.maps.Size(40, 40),
      },
      subway_station: {
        url: '/metro.png',
        scaledSize: new window.google.maps.Size(40, 40),
      },
      restaurant: {
        url: '/location-pin.png',
        scaledSize: new window.google.maps.Size(40, 40),
      },
      cafe: {
        url: '/location-pin.png',
        scaledSize: new window.google.maps.Size(40, 40),
      },
      bank: {
        url: '/location-pin.png',
        scaledSize: new window.google.maps.Size(40, 40),
      },
      // Add more as needed
    });
  };

  const handleSelectChange = (selectedOptions) => {
    const options = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedOptions(options);
    updateMarkers(options);
  };

  const updateMarkers = (selectedOptions) => {
    if (serviceRef.current && mapRef.current) {
      const newMarkers = [];

      selectedOptions.forEach(option => {
        const request = {
          location: defaultCenter,
          radius: MAX_RADIUS,
          type: option,
        };

        serviceRef.current.nearbySearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            results.forEach(place => {
              newMarkers.push({
                type: option,
                position: { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() },
                name: place.name,
              });
            });

            // Check for projects outside the initial search radius
            const outlyingProjects = projects.filter(project => {
              const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
                new window.google.maps.LatLng(defaultCenter.lat, defaultCenter.lng),
                new window.google.maps.LatLng(project.Latitude, project.Longitude)
              );
              return distance > 20000;
            });

            // Perform search for outlying projects
            outlyingProjects.forEach(project => {
              const projectRequest = {
                location: { lat: project.Latitude, lng: project.Longitude },
                radius: MAX_RADIUS,
                type: option,
              };

              serviceRef.current.nearbySearch(projectRequest, (projectResults, projectStatus) => {
                if (projectStatus === window.google.maps.places.PlacesServiceStatus.OK) {
                  projectResults.forEach(place => {
                    newMarkers.push({
                      type: option,
                      position: { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() },
                      name: place.name,
                    });
                  });
                  setMarkers(newMarkers);
                }
              });
            });
          }
        });
      });
    }
  };

  const handleRemoveAmenity = (removedOption) => {
    const updatedMarkers = markers.filter(marker => marker.type !== removedOption.value);
    setMarkers(updatedMarkers);
  };

  const handleAmenityChange = (selectedOptions) => {
    const currentOptions = selectedOptions ? selectedOptions.map(option => option.value) : [];
    const removedOptions = selectedOptions
      ? options.filter(option => !currentOptions.includes(option.value))
      : options;

    removedOptions.forEach(removedOption => handleRemoveAmenity(removedOption));
    handleSelectChange(selectedOptions);
  };

  return (
    <section className="map">
      <div className="container">
        <Select
          options={options}
          isMulti
          onChange={handleAmenityChange}
          placeholder="Select amenities"
        />
        <LoadScript
          googleMapsApiKey="AIzaSyDzNTkZVr61Ofe6qC7BzEZKh1DASc0ADP4"
          libraries={libraries}
          onLoad={initializeIcons} // Initialize custom icons after the script is loaded
          onError={(error) => console.error('Error loading Google Maps script:', error)}
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={defaultCenter}
            zoom={12}
            options={mapOptions}
            onLoad={map => {
              mapRef.current = map;
              serviceRef.current = new window.google.maps.places.PlacesService(map);
            }}
          >
            {projects.map((project, index) => (
              <Marker
                key={`project-${index}`}
                position={{ lat: project.Latitude, lng: project.Longitude }}
              />
            ))}
            {markers.map((marker, index) => (
              <Marker
                key={`marker-${index}`}
                position={marker.position}
                title={marker.name}
                icon={customIcons[marker.type]}
              />
            ))}
          </GoogleMap>
        </LoadScript>
      </div>
    </section>
  );
};

export default Map;
