import { Trash2, Plus } from 'lucide-react';

export function TechnicalSkillsForm({ resumeData, setResumeData }) {
  
  const handleChange = (index, field, value) => {
    const updatedSkills = [...resumeData.technicalSkills];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    setResumeData(prev => ({ ...prev, technicalSkills: updatedSkills }));
  };

  const handleAddItem = () => {
    setResumeData(prev => ({
      ...prev,
      technicalSkills: [
        ...prev.technicalSkills,
        { category: '', skills: '' }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    const updatedSkills = resumeData.technicalSkills.filter((_, i) => i !== index);
    setResumeData(prev => ({ ...prev, technicalSkills: updatedSkills }));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-white mb-4">Technical Skills</h2>
      <div className="space-y-4">
        {resumeData.technicalSkills.map((item, index) => (
          <div key={index} className="space-y-3 p-4 bg-slate-700/50 rounded-lg relative">
            <button 
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="absolute top-3 right-3 text-red-400 hover:text-red-300 transition"
            >
              <Trash2 size={18} />
            </button>
            <input
              type="text"
              placeholder="Category (e.g., Programming Languages)"
              value={item.category}
              onChange={(e) => handleChange(index, 'category', e.target.value)}
              className="input-style"
            />
            <input
              type="text"
              placeholder="Skills (e.g., Python, C++, Java)"
              value={item.skills}
              onChange={(e) => handleChange(index, 'skills', e.target.value)}
              className="input-style"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleAddItem}
        className="mt-4 flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition"
      >
        <Plus size={18} />
        Add Skill Category
      </button>
    </div>
  );
}
