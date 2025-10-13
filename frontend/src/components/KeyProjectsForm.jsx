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
    <div className="bg-slate-800 rounded-xl p-6 mb-6 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">Key Projects</h2>
        <button 
          type="button" 
          onClick={addProject} 
          className="text-slate-400 hover:text-indigo-400 hover:bg-slate-700 p-2 rounded-lg transition-colors duration-200"
        >
          <PlusCircle size={20} />
        </button>
      </div>
      {resumeData.keyProjects.map((proj, projIndex) => (
        <div key={projIndex} className="bg-slate-900/70 p-4 rounded-lg border border-slate-700 space-y-4">
          <div className="flex justify-between items-center">
            <input 
              type="text" 
              name="name" 
              placeholder="Project Name" 
              value={proj.name} 
              onChange={(e) => handleProjectChange(e, projIndex)} 
              className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg p-3 text-base placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
            />
            <button 
              type="button" 
              onClick={() => removeProject(projIndex)} 
              className="text-slate-400 hover:text-red-500 transition"
            >
              <Trash2 size={20} />
            </button>
          </div>
          <div className="space-y-3">
            <input 
              type="text" 
              name="subtitle" 
              placeholder="Subtitle (e.g., Course Project)" 
              value={proj.subtitle} 
              onChange={(e) => handleProjectChange(e, projIndex)} 
              className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg p-3 text-base placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
            />
            <input 
              type="text" 
              name="dates" 
              placeholder="Dates" 
              value={proj.dates} 
              onChange={(e) => handleProjectChange(e, projIndex)} 
              className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg p-3 text-base placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
            />
          </div>
          
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Accomplishments</h4>
          {proj.points.map((point, pointIndex) => (
            <div key={pointIndex} className="flex items-start gap-3 mb-3">
              {isImproving === `${projIndex}-${pointIndex}` ? (
                <div className="w-full bg-slate-700 border-2 border-slate-600 rounded-lg min-h-[80px] flex flex-col justify-center items-center px-4 space-y-2">
                  <p className="text-slate-400 text-sm font-medium">Enhancing with AI...</p>
                  <div className="w-full bg-slate-600 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-1.5 rounded-full"
                      style={{ animation: 'progress-bar 2s ease-out infinite' }}
                    ></div>
                  </div>
                </div>
              ) : (
                <textarea
                  placeholder="Accomplishment..." 
                  value={point}
                  onChange={(e) => handlePointChange(e, projIndex, pointIndex)}
                  className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg p-3 text-base placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 min-h-[80px] resize-y"
                  disabled={!!isImproving}
                />
              )}
              <div className="flex flex-col items-center justify-center gap-2">
                <button 
                  type="button" 
                  onClick={() => handleImprovePoint(projIndex, pointIndex)} 
                  className="text-slate-400 hover:text-violet-400 hover:bg-slate-600 p-1.5 rounded transition disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={isImproving === `${projIndex}-${pointIndex}`}
                  data-tooltip-id="main-tooltip"
                  data-tooltip-content="Improve with AI"
                >
                  <Sparkles size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={() => removePoint(projIndex, pointIndex)} 
                  className="text-slate-400 hover:text-red-500 hover:bg-slate-600 p-1.5 rounded transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => addPoint(projIndex)} 
            className="text-sm font-semibold text-indigo-400 hover:bg-indigo-500/10 py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <PlusCircle size={16} /> Add Point
          </button>
        </div>
      ))}
    </div>
  );
};
 


