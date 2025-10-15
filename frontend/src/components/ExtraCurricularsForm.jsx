import { PlusCircle, Trash2, Sparkles, Loader2, ChevronsLeftRight, ChevronsRightLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

export const ExtraCurricularsForm = ({ resumeData, setResumeData, index, moveSection, isFirst, isLast }) => {
    const [isImproving, setIsImproving] = useState(null);

    const handleEcChange = (e, ecIndex) => {
        const { name, value } = e.target;
        const newEcs = [...resumeData.extraCurriculars];
        newEcs[ecIndex][name] = value;
        setResumeData(prev => ({ ...prev, extraCurriculars: newEcs }));
    };

    const addEc = () => {
        setResumeData(prev => ({ ...prev, extraCurriculars: [...prev.extraCurriculars, { text: "", date: "" }] }));
    };

    const removeEc = (ecIndex) => {
        const newEcs = [...resumeData.extraCurriculars];
        newEcs.splice(ecIndex, 1);
        setResumeData(prev => ({ ...prev, extraCurriculars: newEcs }));
    };

    const handleImprovePoint = async (ecIndex) => {
        const originalText = resumeData.extraCurriculars[ecIndex].text;
        if (!originalText.trim()) return;
        setIsImproving(ecIndex);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/improve_text`, { text: originalText });
            const { improved_text } = response.data;
            const newEcs = [...resumeData.extraCurriculars];
            newEcs[ecIndex].text = improved_text;
            setResumeData(prev => ({ ...prev, extraCurriculars: newEcs }));
        } catch (error) { console.error("Failed to improve text:", error); alert("AI Assistant failed.");
        } finally { setIsImproving(null); }
    };
    
    const handleAdjustPoint = async (ecIndex, action) => {
        const originalText = resumeData.extraCurriculars[ecIndex].text;
        if (!originalText.trim()) return;
        setIsImproving(ecIndex);
        const endpoint = action === 'lengthen' ? '/lengthen_text' : '/shorten_text';
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, { text: originalText });
            const { adjusted_text } = response.data;
            const newEcs = [...resumeData.extraCurriculars];
            newEcs[ecIndex].text = adjusted_text;
            setResumeData(prev => ({ ...prev, extraCurriculars: newEcs }));
        } catch (error) { console.error(`Failed to ${action} text:`, error); alert(`AI Assistant failed to ${action} text.`);
        } finally { setIsImproving(null); }
    };

    return (
        <div className="bg-slate-800 rounded-xl p-6 mb-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-white">Extracurricular Activities</h2>
                <button 
                    type="button" 
                    onClick={addEc} 
                    className="text-slate-400 hover:text-indigo-400 hover:bg-slate-700 p-2 rounded-lg transition-colors duration-200"
                >
                    <PlusCircle size={20} />
                </button>
            </div>
            {resumeData.extraCurriculars.map((ec, ecIndex) => (
                <div key={ecIndex} className="bg-slate-900/70 p-4 rounded-lg border border-slate-700 space-y-4 mb-4">
                    <div className="bg-slate-700 border-2 border-slate-600 rounded-lg overflow-hidden">
                        {isImproving === ecIndex ? (
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
                            <div className="p-3">
                                <textarea 
                                    placeholder="Description of activity, achievement, or hobby..." 
                                    value={ec.text} 
                                    name="text" 
                                    onChange={(e) => handleEcChange(e, ecIndex)} 
                                    className="w-full bg-transparent text-slate-100 placeholder-slate-400 focus:outline-none min-h-[80px] resize-y border-none" 
                                    disabled={!!isImproving} 
                                />
                                <input 
                                    type="text" 
                                    name="date" 
                                    placeholder="Date (e.g., 2024 or Jan'25)" 
                                    value={ec.date} 
                                    onChange={(e) => handleEcChange(e, ecIndex)} 
                                    className="w-1/3 mt-2 bg-slate-800/50 border border-slate-600 text-slate-300 text-sm rounded-md p-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" 
                                />
                            </div>
                        )}
                        <div className="border-t border-slate-600 bg-slate-800/50 px-3 py-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => handleImprovePoint(ecIndex)} 
                                    className="text-slate-400 hover:text-violet-400 hover:bg-slate-600 p-1.5 rounded transition disabled:opacity-50 disabled:cursor-not-allowed" 
                                    disabled={isImproving === ecIndex}
                                    data-tooltip-id="main-tooltip"
                                    data-tooltip-content="Improve with AI"
                                >
                                    {isImproving === ecIndex ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => handleAdjustPoint(ecIndex, 'shorten')} 
                                    className="text-slate-400 hover:text-blue-400 hover:bg-slate-600 p-1.5 rounded transition disabled:opacity-50 disabled:cursor-not-allowed" 
                                    disabled={!!isImproving}
                                    data-tooltip-id="main-tooltip"
                                    data-tooltip-content="Make Shorter"
                                >
                                    <ChevronsRightLeft size={16} />
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => handleAdjustPoint(ecIndex, 'lengthen')} 
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
                                onClick={() => removeEc(ecIndex)} 
                                className="text-slate-400 hover:text-red-500 hover:bg-slate-600 p-1.5 rounded transition"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
