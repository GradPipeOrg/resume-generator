import { PlusCircle, Trash2, Sparkles, Loader2, ChevronsLeftRight, ChevronsRightLeft } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { trackEvent } from '../services/mixpanel';

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
    trackEvent('Section Item Added', { section: 'Positions of Responsibility' });
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
    trackEvent('Bullet Point Added', { section: 'Positions of Responsibility' });
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
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/improve_text`, { text: originalText });
      const { improved_text } = response.data;
      
      const newPors = [...resumeData.positionsOfResponsibility];
      newPors[porIndex].points[pointIndex] = improved_text;
      setResumeData(prev => ({ ...prev, positionsOfResponsibility: newPors }));
      
      trackEvent('AI Tool Used', { tool: 'Improve' });
      
    } catch (error) {
      console.error("Failed to improve text:", error);
      alert("AI Assistant failed.");
    } finally {
      setIsImproving(null);
    }
  };

  const handleAdjustPoint = async (porIndex, pointIndex, action) => {
    const originalText = resumeData.positionsOfResponsibility[porIndex].points[pointIndex];
    if (!originalText.trim()) return;

    setIsImproving(`${porIndex}-${pointIndex}`);
    const endpoint = action === 'lengthen' ? '/lengthen_text' : '/shorten_text';
    try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, { text: originalText });
        const { adjusted_text } = response.data;

        const newPors = [...resumeData.positionsOfResponsibility];
        newPors[porIndex].points[pointIndex] = adjusted_text;
        setResumeData(prev => ({ ...prev, positionsOfResponsibility: newPors }));
        
        trackEvent('AI Tool Used', { tool: action === 'lengthen' ? 'Lengthen' : 'Shorten' });
    } catch (error) {
        console.error(`Failed to ${action} text:`, error);
        alert(`AI Assistant failed to ${action} text.`);
    } finally {
        setIsImproving(null);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 mb-6 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">Positions of Responsibility</h2>
        <button 
          type="button" 
          onClick={addPor} 
          className="text-slate-400 hover:text-indigo-400 hover:bg-slate-700 p-2 rounded-lg transition-colors duration-200"
        >
          <PlusCircle size={20} />
        </button>
      </div>
      {resumeData.positionsOfResponsibility.map((por, porIndex) => (
        <div key={porIndex} className="bg-slate-900/70 p-4 rounded-lg border border-slate-700 space-y-4">
          <div className="flex justify-between items-center">
            <input 
              type="text" 
              name="role" 
              placeholder="Role (e.g., Alumni Secretary)" 
              value={por.role} 
              onChange={(e) => handlePorChange(e, porIndex)} 
              className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg p-3 text-base placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
            />
            <button 
              type="button" 
              onClick={() => removePor(porIndex)} 
              className="text-slate-400 hover:text-red-500 transition"
            >
              <Trash2 size={20} />
            </button>
          </div>
          <div className="space-y-3">
            <input 
              type="text" 
              name="organization" 
              placeholder="Organization" 
              value={por.organization} 
              onChange={(e) => handlePorChange(e, porIndex)} 
              className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg p-3 text-base placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
            />
            <input 
              type="text" 
              name="dates" 
              placeholder="Dates" 
              value={por.dates} 
              onChange={(e) => handlePorChange(e, porIndex)} 
              className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg p-3 text-base placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
            />
            <input 
              type="text" 
              name="description" 
              placeholder="Short Description" 
              value={por.description} 
              onChange={(e) => handlePorChange(e, porIndex)} 
              className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg p-3 text-base placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
            />
          </div>
          
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Accomplishments</h4>
          {por.points.map((point, pointIndex) => (
            <div key={pointIndex} className="mb-4">
              <div className="bg-slate-700 border-2 border-slate-600 rounded-lg overflow-hidden">
                {isImproving === `${porIndex}-${pointIndex}` ? (
                  <div className="min-h-[80px] flex flex-col justify-center items-center px-4 py-3 space-y-2">
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
                    onChange={(e) => handlePointChange(e, porIndex, pointIndex)}
                    className="w-full bg-transparent text-slate-100 p-3 text-base placeholder-slate-400 focus:outline-none min-h-[80px] resize-y border-none"
                    disabled={!!isImproving}
                  />
                )}
                <div className="border-t border-slate-600 bg-slate-800/50 px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => handleImprovePoint(porIndex, pointIndex)} 
                      className="text-slate-400 hover:text-violet-400 hover:bg-slate-600 p-1.5 rounded transition disabled:opacity-50 disabled:cursor-not-allowed" 
                      disabled={isImproving === `${porIndex}-${pointIndex}`}
                      data-tooltip-id="main-tooltip"
                      data-tooltip-content="Improve with AI"
                    >
                      {isImproving === `${porIndex}-${pointIndex}` ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleAdjustPoint(porIndex, pointIndex, 'shorten')} 
                      className="text-slate-400 hover:text-blue-400 hover:bg-slate-600 p-1.5 rounded transition disabled:opacity-50 disabled:cursor-not-allowed" 
                      disabled={!!isImproving}
                      data-tooltip-id="main-tooltip"
                      data-tooltip-content="Make Shorter"
                    >
                      <ChevronsRightLeft size={16} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleAdjustPoint(porIndex, pointIndex, 'lengthen')} 
                      className="text-slate-400 hover:text-green-400 hover:bg-slate-600 p-1.5 rounded transition disabled:opacity-50 disabled:cursor-not-allowed" 
                      disabled={!!isImproving}
                      data-tooltip-id="main-tooltip"
                      data-tooltip-content="Make Longer"
                    >
                      <ChevronsLeftRight size={16} />
                    </button>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removePoint(porIndex, pointIndex)} 
                    className="text-slate-400 hover:text-red-500 hover:bg-slate-600 p-1.5 rounded transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => addPoint(porIndex)} 
            className="text-sm font-semibold text-indigo-400 hover:bg-indigo-500/10 py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <PlusCircle size={16} /> Add Point
          </button>
        </div>
      ))}
    </div>
  );
};
