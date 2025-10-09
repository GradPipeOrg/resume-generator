import { PlusCircle, Trash2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

export const ProfessionalExperienceForm = ({ resumeData, setResumeData }) => {
  const [isImproving, setIsImproving] = useState(null);

  const handleExperienceChange = (e, index) => {
    const { name, value } = e.target;
    const newExperience = [...resumeData.professionalExperience];
    newExperience[index][name] = value;
    setResumeData(prev => ({ ...prev, professionalExperience: newExperience }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      professionalExperience: [...prev.professionalExperience, { company: "", role: "", dates: "", points: [""] }]
    }));
  };

  const removeExperience = (index) => {
    const newExperience = [...resumeData.professionalExperience];
    newExperience.splice(index, 1);
    setResumeData(prev => ({ ...prev, professionalExperience: newExperience }));
  };

  const handlePointChange = (e, expIndex, pointIndex) => {
    const { value } = e.target;
    const newExperience = [...resumeData.professionalExperience];
    newExperience[expIndex].points[pointIndex] = value;
    setResumeData(prev => ({ ...prev, professionalExperience: newExperience }));
  };

  const addPoint = (expIndex) => {
    const newExperience = [...resumeData.professionalExperience];
    newExperience[expIndex].points.push("");
    setResumeData(prev => ({ ...prev, professionalExperience: newExperience }));
  };

  const removePoint = (expIndex, pointIndex) => {
    const newExperience = [...resumeData.professionalExperience];
    newExperience[expIndex].points.splice(pointIndex, 1);
    setResumeData(prev => ({ ...prev, professionalExperience: newExperience }));
  };
  
  const handleImprovePoint = async (expIndex, pointIndex) => {
    const originalText = resumeData.professionalExperience[expIndex].points[pointIndex];
    if (!originalText.trim()) return;
    
    setIsImproving(`${expIndex}-${pointIndex}`);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/improve_text`, { text: originalText });
      const { improved_text } = response.data;
      
      const newExperience = [...resumeData.professionalExperience];
      newExperience[expIndex].points[pointIndex] = improved_text;
      setResumeData(prev => ({ ...prev, professionalExperience: newExperience }));
      
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
        <h2>Professional Experience</h2>
        <button type="button" onClick={addExperience} className="btn-icon"><PlusCircle size={20} /></button>
      </div>
      {resumeData.professionalExperience.map((exp, expIndex) => (
        <div key={expIndex} className="entry-item">
          <div className="entry-header">
            <input type="text" name="role" placeholder="Role" value={exp.role} onChange={(e) => handleExperienceChange(e, expIndex)} className="input-style" />
            <button type="button" onClick={() => removeExperience(expIndex)} className="btn-icon btn-danger"><Trash2 size={20} /></button>
          </div>
          <input type="text" name="company" placeholder="Company" value={exp.company} onChange={(e) => handleExperienceChange(e, expIndex)} className="input-style" />
          <input type="text" name="dates" placeholder="Dates" value={exp.dates} onChange={(e) => handleExperienceChange(e, expIndex)} className="input-style" />
          
          <h4 className="points-header">Accomplishments</h4>
          {exp.points.map((point, pointIndex) => (
            <div key={pointIndex} className="point-item">
              <textarea
                placeholder="Accomplishment..." value={point}
                onChange={(e) => handlePointChange(e, expIndex, pointIndex)}
                className="textarea-style"
              />
              <div className="point-actions">
                <button type="button" onClick={() => handleImprovePoint(expIndex, pointIndex)} className="btn-icon btn-ai" disabled={isImproving === `${expIndex}-${pointIndex}`}>
                  <Sparkles size={16} />
                </button>
                <button type="button" onClick={() => removePoint(expIndex, pointIndex)} className="btn-icon btn-danger btn-small"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => addPoint(expIndex)} className="btn-add-point"><PlusCircle size={16} /> Add Point</button>
        </div>
      ))}
    </div>
  );
};
 
