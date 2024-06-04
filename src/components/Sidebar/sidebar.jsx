import React from 'react';
import '../Sidebar/sidebar.css';

export function Sidebar({ isOpen, project, airport, hospital, school, onClose }) {
  if (!isOpen || !project) return null;

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="close-button" onClick={onClose}>×</button>
      <h2 className="project-name">{project.name}</h2>
      <div className="details">
        {/* {airport && airport.name ? (
          <p><strong>Nearest Airport:</strong> {airport.name} ({airport.distance?.toFixed(2)} km)</p>
        ) : (
          <p>Loading nearest airport...</p>
        )} */}
        {hospital && hospital.name ? (
          <p><strong>Nearest Hospital:</strong> {hospital.name} ({hospital.distance?.toFixed(2)} km)</p>
        ) : (
          <p>Loading nearest hospital...</p>
        )}
        {school && school.name ? (
          <p><strong>Nearest School:</strong> {school.name} ({school.distance?.toFixed(2)} km)</p>
        ) : (
          <p>Loading nearest school...</p>
        )}
      </div>
    </div>
  );
}
