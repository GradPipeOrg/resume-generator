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
    <div className="form-section">
      <div className="section-header">
        <h2>Scholastic Achievements</h2>
        <button type="button" onClick={addAchievement} className="btn-icon"><PlusCircle size={20} /></button>
      </div>
      {resumeData.scholasticAchievements.map((ach, index) => (
        <div key={index} className="point-item">
          <textarea
            placeholder="Scholastic Achievement..."
            value={ach.text}
            onChange={(e) => handleAchievementChange(e, index)}
            className="textarea-style"
          />
          <div className="point-actions">
             <button type="button" onClick={() => removeAchievement(index)} className="btn-icon btn-danger btn-small"><Trash2 size={16} /></button>
          </div>
        </div>
      ))}
    </div>
  );
};