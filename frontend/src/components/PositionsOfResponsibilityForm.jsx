import { PlusCircle, Trash2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

export const PositionsOfResponsibilityForm = ({ resumeData, setResumeData }) => {
  const [isImproving, setIsImproving] = useState(null);

  const handlePorChange = (e, index) => {
    const { name, value } = e.target;
    const newPors = [...resumeData.positionsOfResponsibility];
    newPors[index][name] = value;
    setResumeData(prev => ({ ...prev, positionsOfResponsibility: newPors }));
  };

  const addPor = () => {
    setResumeData(prev => ({
      ...prev,
      positionsOfResponsibility: [...prev.positionsOfResponsibility, { role: "", organization: "", dates: "", description: "", points: [""] }]
    }));
  };

  const removePor = (index) => {
    const newPors = [...resumeData.positionsOfResponsibility];
    newPors.splice(index, 1);
    setResumeData(prev => ({ ...prev, positionsOfResponsibility: newPors }));
  };

  const handlePointChange = (e, porIndex, pointIndex) => {
    const { value } = e.target;
    const newPors = [...resumeData.positionsOfResponsibility];
    newPors[porIndex].points[pointIndex] = value;
    setResumeData(prev => ({ ...prev, positionsOfResponsibility: newPors }));
  };

  const addPoint = (porIndex) => {
    const newPors = [...resumeData.positionsOfResponsibility];
    newPors[porIndex].points.push("");
    setResumeData(prev => ({ ...prev, positionsOfResponsibility: newPors }));
  };

  const removePoint = (porIndex, pointIndex) => {
    const newPors = [...resumeData.positionsOfResponsibility];
    newPors[porIndex].points.splice(pointIndex, 1);
    setResumeData(prev => ({ ...prev, positionsOfResponsibility: newPors }));
  };
  
  const handleImprovePoint = async (porIndex, pointIndex) => {
    const originalText = resumeData.positionsOfResponsibility[porIndex].points[pointIndex];
    if (!originalText.trim()) return;
    
    setIsImproving(`${porIndex}-${pointIndex}`);
    try {
      const response = await axios.post('http://localhost:8000/improve_text', { text: originalText });
      const { improved_text } = response.data;
      
      const newPors = [...resumeData.positionsOfResponsibility];
      newPors[porIndex].points[pointIndex] = improved_text;
      setResumeData(prev => ({ ...prev, positionsOfResponsibility: newPors }));
      
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
        <h2>Positions of Responsibility</h2>
        <button type="button" onClick={addPor} className="btn-icon"><PlusCircle size={20} /></button>
      </div>
      {resumeData.positionsOfResponsibility.map((por, porIndex) => (
        <div key={porIndex} className="entry-item">
          <div className="entry-header">
            <input type="text" name="role" placeholder="Role (e.g., Alumni Secretary)" value={por.role} onChange={(e) => handlePorChange(e, porIndex)} className="input-style" />
            <button type="button" onClick={() => removePor(porIndex)} className="btn-icon btn-danger"><Trash2 size={20} /></button>
          </div>
          <input type="text" name="organization" placeholder="Organization" value={por.organization} onChange={(e) => handlePorChange(e, porIndex)} className="input-style" />
          <input type="text" name="dates" placeholder="Dates" value={por.dates} onChange={(e) => handlePorChange(e, porIndex)} className="input-style" />
          <input type="text" name="description" placeholder="Short Description" value={por.description} onChange={(e) => handlePorChange(e, porIndex)} className="input-style" />
          
          <h4 className="points-header">Accomplishments</h4>
          {por.points.map((point, pointIndex) => (
            <div key={pointIndex} className="point-item">
              <textarea
                placeholder="Accomplishment..." value={point}
                onChange={(e) => handlePointChange(e, porIndex, pointIndex)}
                className="textarea-style"
              />
              <div className="point-actions">
                <button type="button" onClick={() => handleImprovePoint(porIndex, pointIndex)} className="btn-icon btn-ai" disabled={isImproving === `${porIndex}-${pointIndex}`}>
                  <Sparkles size={16} />
                </button>
                <button type="button" onClick={() => removePoint(porIndex, pointIndex)} className="btn-icon btn-danger btn-small"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => addPoint(porIndex)} className="btn-add-point"><PlusCircle size={16} /> Add Point</button>
        </div>
      ))}
    </div>
  );
};
