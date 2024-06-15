import React, { useState, useEffect } from 'react';
import Map from './components/Map/Map';
import ProjectDetails from './components/ProjectDetails/ProjectDetails';
import './App.css';

function App() {
  const [projects, setProjects] = useState([]);
  const [imageData, setImageData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    fetch('/updated_file_with_nearby_json2.json')
      .then(response => response.json())
      .then(data => setProjects(data))
      .catch(error => console.error('Error fetching JSON data:', error));

    fetch('/output_projects_with_images.json')
      .then(response => response.json())
      .then(data => setImageData(data))
      .catch(error => console.error('Error fetching images data:', error));
  }, []);

  const handleSelectProject = (project) => {
    setSelectedProject(project);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="App">
      <div className={`left-half ${isCollapsed ? 'collapsed' : ''}`}>
        <ProjectDetails
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={handleSelectProject}
          imageData={imageData}
        />
      </div>
      <div className={`right-half ${isCollapsed ? 'full' : ''}`}>
        <Map
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={handleSelectProject}
          imageData={imageData}
        />
      </div>
      <button className={`collapse-button ${isCollapsed ? 'desc' : 'asc'}`} onClick={toggleCollapse}>
        {isCollapsed ? '→' : '←'}
      </button>
    </div>
  );
}

export default App;
