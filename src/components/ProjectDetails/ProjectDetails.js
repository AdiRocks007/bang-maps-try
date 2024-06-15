import React, { useEffect, useState } from 'react';
import ProjectPopup from '../Project_popup/ProjectPopup';

const ProjectDetails = ({ projects, selectedProject, onSelectProject, imageData }) => {
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

  useEffect(() => {
    if (!selectedProject) {
      const intervalId = setInterval(() => {
        setCurrentProjectIndex((prevIndex) => (prevIndex + 1) % projects.length);
      }, 5000); // Change project every 5 seconds

      return () => clearInterval(intervalId);
    }
  }, [projects.length, selectedProject]);

  const handleButtonClick = (project) => {
    onSelectProject(selectedProject ? null : project);
  };

  const displayedProject = selectedProject || projects[currentProjectIndex];

  return (
    <div className="project-details">
      {displayedProject && (
        <div className="project-popup-container">
          <ProjectPopup 
            project={displayedProject} 
            images={imageData.find(item => item.project_id === displayedProject['Internal ID'])?.large_image_urls || []} 
          />
          <button onClick={() => handleButtonClick(displayedProject)}>
            {selectedProject ? 'Return' : 'Select'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
