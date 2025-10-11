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
    <div className="bg-slate-800 rounded-xl p-6 mb-6 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">Professional Experience</h2>
        <button 
          type="button" 
          onClick={addExperience} 
          className="text-slate-400 hover:text-indigo-400 hover:bg-slate-700 p-2 rounded-lg transition-colors duration-200"
        >
          <PlusCircle size={20} />
        </button>
      </div>
      {resumeData.professionalExperience.map((exp, expIndex) => (
        <div key={expIndex} className="bg-slate-900/70 p-4 rounded-lg border border-slate-700 space-y-4">
          <div className="flex justify-between items-center">
            <input 
              type="text" 
              name="role" 
              placeholder="Role" 
              value={exp.role} 
              onChange={(e) => handleExperienceChange(e, expIndex)} 
              className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg p-3 text-base placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
            />
            <button 
              type="button" 
              onClick={() => removeExperience(expIndex)} 
              className="text-slate-400 hover:text-red-500 transition"
            >
              <Trash2 size={20} />
            </button>
          </div>
          <div className="space-y-3">
            <input 
              type="text" 
              name="company" 
              placeholder="Company" 
              value={exp.company} 
              onChange={(e) => handleExperienceChange(e, expIndex)} 
              className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg p-3 text-base placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
            />
            <input 
              type="text" 
              name="dates" 
              placeholder="Dates" 
              value={exp.dates} 
              onChange={(e) => handleExperienceChange(e, expIndex)} 
              className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg p-3 text-base placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
            />
          </div>
          
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Accomplishments</h4>
          {exp.points.map((point, pointIndex) => (
            <div key={pointIndex} className="flex items-start gap-3 mb-3">
              <textarea
                placeholder="Accomplishment..." 
                value={point}
                onChange={(e) => handlePointChange(e, expIndex, pointIndex)}
                className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg p-3 text-base placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 min-h-[80px] resize-y"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <button 
                  type="button" 
                  onClick={() => handleImprovePoint(expIndex, pointIndex)} 
                  className="text-slate-400 hover:text-violet-400 hover:bg-slate-600 p-1.5 rounded transition disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={isImproving === `${expIndex}-${pointIndex}`}
                  data-tooltip-id="main-tooltip"
                  data-tooltip-content="Improve with AI"
                >
                  <Sparkles size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={() => removePoint(expIndex, pointIndex)} 
                  className="text-slate-400 hover:text-red-500 hover:bg-slate-600 p-1.5 rounded transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => addPoint(expIndex)} 
            className="text-sm font-semibold text-indigo-400 hover:bg-indigo-500/10 py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <PlusCircle size={16} /> Add Point
          </button>
        </div>
      ))}
    </div>
  );
};
 
