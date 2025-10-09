import { PlusCircle, Trash2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

export const KeyProjectsForm = ({ resumeData, setResumeData }) => {
  const [isImproving, setIsImproving] = useState(null);

  const handleProjectChange = (e, index) => {
    const { name, value } = e.target;
    const newProjects = [...resumeData.keyProjects];
    newProjects[index][name] = value;
    setResumeData(prev => ({ ...prev, keyProjects: newProjects }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      keyProjects: [...prev.keyProjects, { name: "", subtitle: "", dates: "", points: [""] }]
    }));
  };

  const removeProject = (index) => {
    const newProjects = [...resumeData.keyProjects];
    newProjects.splice(index, 1);
    setResumeData(prev => ({ ...prev, keyProjects: newProjects }));
  };

  const handlePointChange = (e, projIndex, pointIndex) => {
    const { value } = e.target;
    const newProjects = [...resumeData.keyProjects];
    newProjects[projIndex].points[pointIndex] = value;
    setResumeData(prev => ({ ...prev, keyProjects: newProjects }));
  };

  const addPoint = (projIndex) => {
    const newProjects = [...resumeData.keyProjects];
    newProjects[projIndex].points.push("");
    setResumeData(prev => ({ ...prev, keyProjects: newProjects }));
  };

  const removePoint = (projIndex, pointIndex) => {
    const newProjects = [...resumeData.keyProjects];
    newProjects[projIndex].points.splice(pointIndex, 1);
    setResumeData(prev => ({ ...prev, keyProjects: newProjects }));
  };
  
  const handleImprovePoint = async (projIndex, pointIndex) => {
    const originalText = resumeData.keyProjects[projIndex].points[pointIndex];
    if (!originalText.trim()) return;
    
    setIsImproving(`${projIndex}-${pointIndex}`);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/improve_text`, { text: originalText });
      const { improved_text } = response.data;
      
      const newProjects = [...resumeData.keyProjects];
      newProjects[projIndex].points[pointIndex] = improved_text;
      setResumeData(prev => ({ ...prev, keyProjects: newProjects }));
      
    } catch (error) {
      console.error("Failed to improve text:", error);
      alert("AI Assistant failed. Please check the backend console.");
    } finally {
      setIsImproving(null);
    }
  };

  return (
    <div className="form-section">
      <div className="section-header">
        <h2>Key Projects</h2>
        <button type="button" onClick={addProject} className="btn-icon"><PlusCircle size={20} /></button>
      </div>
      {resumeData.keyProjects.map((proj, projIndex) => (
        <div key={projIndex} className="entry-item">
          <div className="entry-header">
            <input type="text" name="name" placeholder="Project Name" value={proj.name} onChange={(e) => handleProjectChange(e, projIndex)} className="input-style" />
            <button type="button" onClick={() => removeProject(projIndex)} className="btn-icon btn-danger"><Trash2 size={20} /></button>
          </div>
          <input type="text" name="subtitle" placeholder="Subtitle (e.g., Course Project)" value={proj.subtitle} onChange={(e) => handleProjectChange(e, projIndex)} className="input-style" />
          <input type="text" name="dates" placeholder="Dates" value={proj.dates} onChange={(e) => handleProjectChange(e, projIndex)} className="input-style" />
          
          <h4 className="points-header">Accomplishments</h4>
          {proj.points.map((point, pointIndex) => (
            <div key={pointIndex} className="point-item">
              <textarea
                placeholder="Accomplishment..." value={point}
                onChange={(e) => handlePointChange(e, projIndex, pointIndex)}
                className="textarea-style"
              />
              <div className="point-actions">
                <button type="button" onClick={() => handleImprovePoint(projIndex, pointIndex)} className="btn-icon btn-ai" disabled={isImproving === `${projIndex}-${pointIndex}`}>
                  <Sparkles size={16} />
                </button>
                <button type="button" onClick={() => removePoint(projIndex, pointIndex)} className="btn-icon btn-danger btn-small"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => addPoint(projIndex)} className="btn-add-point"><PlusCircle size={16} /> Add Point</button>
        </div>
      ))}
    </div>
  );
};
 


