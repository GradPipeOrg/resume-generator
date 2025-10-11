// Forcing a fresh build on Vercel
// Now using the VITE_API_BASE_URL from the .env file
import { useState } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import { Download } from 'lucide-react';
import './App.css';
import { ProfessionalExperienceForm } from './components/ProfessionalExperienceForm';
import { KeyProjectsForm } from './components/KeyProjectsForm';
import { PositionsOfResponsibilityForm } from './components/PositionsOfResponsibilityForm';
import { ScholasticAchievementsForm } from './components/ScholasticAchievementsForm';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

const initialData = {
  template_name: 'one_page.tex',
  personalDetails: {
    name: "Mohammad Shabir Peerzada",
    branch: "Civil Engineering",
    roll_no: "23B0717",
    cpi: "8.64",
    dob: "26/05/2004",
    gender: "Male",
    phone: "", email: "", linkedin: "", github: ""
  },
  scholasticAchievements: [
    { text: "Among the top 2.15 percentile in JEE Advanced examination out of 0.18 million candidates all over India\\hfill{\\sl \\small [2023]}" },
    { text: "Secured 99.05 percentile in JEE Main 2023 examination out of 1.1 million eligible candidates all over India\\hfill{\\sl \\small [2023]}" }
  ],
  professionalExperience: [],
  keyProjects: [],
  positionsOfResponsibility: []
};

function App() {
  const [resumeData, setResumeData] = useState(initialData);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePdf = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/generate_pdf`, resumeData, { responseType: 'blob' });
      const fileUrl = URL.createObjectURL(response.data);
      setPdfUrl(fileUrl);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Check the backend console for the full LaTeX log.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setResumeData(prev => ({...prev, personalDetails: {...prev.personalDetails, [name]: value}}));
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-slate-900 p-8 overflow-y-auto space-y-8">
        <h1 className="text-4xl font-bold tracking-tighter text-white">Resume Generator</h1>
        
        <div className="bg-slate-800 rounded-xl p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold text-white mb-4">Select Template</h2>
            <select 
                value={resumeData.template_name}
                onChange={(e) => setResumeData(prev => ({...prev, template_name: e.target.value}))}
                className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg p-3 text-base placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
                <option value="one_page.tex">1-Page Tech Resume</option>
            </select>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold text-white mb-4">Personal Details</h2>
            <div className="space-y-3">
                <input name="name" value={resumeData.personalDetails.name} onChange={handlePersonalChange} placeholder="Name" className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg p-3 text-base placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" />
                <input name="branch" value={resumeData.personalDetails.branch} onChange={handlePersonalChange} placeholder="Branch" className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg p-3 text-base placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" />
                <input name="roll_no" value={resumeData.personalDetails.roll_no} onChange={handlePersonalChange} placeholder="Roll Number" className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg p-3 text-base placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" />
                <input name="cpi" value={resumeData.personalDetails.cpi} onChange={handlePersonalChange} placeholder="CPI" className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg p-3 text-base placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" />
                <input name="dob" value={resumeData.personalDetails.dob} onChange={handlePersonalChange} placeholder="Date of Birth (DD/MM/YYYY)" className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg p-3 text-base placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" />
                <input name="gender" value={resumeData.personalDetails.gender} onChange={handlePersonalChange} placeholder="Gender" className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg p-3 text-base placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" />
            </div>
        </div>

        <ProfessionalExperienceForm resumeData={resumeData} setResumeData={setResumeData} />
        <KeyProjectsForm resumeData={resumeData} setResumeData={setResumeData} />
        <PositionsOfResponsibilityForm resumeData={resumeData} setResumeData={setResumeData} />
        <ScholasticAchievementsForm resumeData={resumeData} setResumeData={setResumeData} />

        <button 
            onClick={handleGeneratePdf} 
            disabled={isLoading} 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-[1.02] active:scale-95 shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
            {isLoading ? 'Generating...' : 'Generate / Refresh Preview'}
        </button>
      </div>
      <div className="w-1/2 bg-slate-800/50 p-8 flex flex-col items-center">
        <h2 className="text-2xl font-semibold text-white mb-6">Preview</h2>
        {pdfUrl && (
          <a
            href={pdfUrl}
            download={`${resumeData.personalDetails.name.replace(' ', '_')}_Resume.pdf`}
            className="mb-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <Download size={20} />
            Download PDF
          </a>
        )}
        {pdfUrl ? (
          <Document file={pdfUrl} onLoadError={(error) => console.error("React-PDF Load Error:", error)}>
            <Page pageNumber={1} />
          </Document>
        ) : (
          <p className="text-gray-300 text-center">Click the generate button to see your PDF preview.</p>
        )}
      </div>
    </div>
  );
}

export default App;