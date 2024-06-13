import React, { useState } from 'react';
import './ProjectPopup.css'; // Import CSS for styling

const ProjectPopup = ({ project, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="popup-content">
      <h3>{project['Project Name']}</h3>
      <h4>Developer: {project.Developer}</h4>
      <p>Type: {project.Type}</p>
      <div className="carousel">
        <div className="carousel-inner" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {images.map((image, index) => (
            <div className="carousel-item" key={index}>
              <img src={image} alt={`Project ${project['Project Name']} - ${index}`} />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <button className="carousel-control-prev" onClick={goToPrevious}>
              &lt;
            </button>
            <button className="carousel-control-next" onClick={goToNext}>
              &gt;
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectPopup;
