import { PlusCircle, Trash2 } from 'lucide-react';

export const ScholasticAchievementsForm = ({ resumeData, setResumeData }) => {
  const handleAchievementChange = (e, index) => {
    const { value } = e.target;
    const newAchievements = [...resumeData.scholasticAchievements];
    newAchievements[index].text = value;
    setResumeData(prev => ({ ...prev, scholasticAchievements: newAchievements }));
  };

  const addAchievement = () => {
    setResumeData(prev => ({
      ...prev,
      scholasticAchievements: [...prev.scholasticAchievements, { text: "" }]
    }));
  };

  const removeAchievement = (index) => {
    const newAchievements = [...resumeData.scholasticAchievements];
    newAchievements.splice(index, 1);
    setResumeData(prev => ({ ...prev, scholasticAchievements: newAchievements }));
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 mb-6 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">Scholastic Achievements</h2>
        <button 
          type="button" 
          onClick={addAchievement} 
          className="text-slate-400 hover:text-indigo-400 hover:bg-slate-700 p-2 rounded-lg transition-colors duration-200"
        >
          <PlusCircle size={20} />
        </button>
      </div>
      {resumeData.scholasticAchievements.map((ach, index) => (
        <div key={index} className="flex items-start gap-3 mb-3">
          <textarea
            placeholder="Scholastic Achievement..."
            value={ach.text}
            onChange={(e) => handleAchievementChange(e, index)}
            className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg p-3 text-base placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 min-h-[80px] resize-y"
          />
          <div className="flex flex-col gap-1">
            <button 
              type="button" 
              onClick={() => removeAchievement(index)} 
              className="text-slate-400 hover:text-red-500 hover:bg-slate-600 p-1.5 rounded transition"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};