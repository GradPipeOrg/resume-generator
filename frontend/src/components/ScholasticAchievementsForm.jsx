import { PlusCircle, Trash2 } from 'lucide-react';

export const ScholasticAchievementsForm = ({ resumeData, setResumeData }) => {
  const handleAchievementChange = (e, index) => {
    const { name, value } = e.target;
    const newAch = [...resumeData.scholasticAchievements];
    newAch[index][name] = value;
    setResumeData(prev => ({ ...prev, scholasticAchievements: newAch }));
  };

  const addAchievement = () => {
    setResumeData(prev => ({
      ...prev,
      scholasticAchievements: [...prev.scholasticAchievements, { percentile: "", exam_name: "", num_candidates: "", year: "" }]
    }));
  };

  const removeAchievement = (index) => {
    const newAch = [...resumeData.scholasticAchievements];
    newAch.splice(index, 1);
    setResumeData(prev => ({ ...prev, scholasticAchievements: newAch }));
  };

  return (
    <div className="form-section">
      <div className="section-header">
        <h2>Scholastic Achievements</h2>
        <button type="button" onClick={addAchievement} className="btn-icon"><PlusCircle size={20} /></button>
      </div>
      {resumeData.scholasticAchievements.map((ach, index) => (
        <div key={index} className="entry-item">
          <div className="entry-header">
            <input
              type="text" name="exam_name" placeholder="Exam Name"
              value={ach.exam_name} onChange={(e) => handleAchievementChange(e, index)} className="input-style"
            />
            <button type="button" onClick={() => removeAchievement(index)} className="btn-icon btn-danger"><Trash2 size={20} /></button>
          </div>
          <input
            type="text" name="percentile" placeholder="Percentile / Rank"
            value={ach.percentile} onChange={(e) => handleAchievementChange(e, index)} className="input-style"
          />
          <input
            type="text" name="num_candidates" placeholder="Number of Candidates"
            value={ach.num_candidates} onChange={(e) => handleAchievementChange(e, index)} className="input-style"
          />
          <input
            type="text" name="year" placeholder="Year"
            value={ach.year} onChange={(e) => handleAchievementChange(e, index)} className="input-style"
          />
        </div>
      ))}
    </div>
  );
};


