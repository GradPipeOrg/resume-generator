import { useState, useEffect } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import { Download, ArrowUp, ArrowDown } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import './App.css';
import { ProfessionalExperienceForm } from './components/ProfessionalExperienceForm';
import { KeyProjectsForm } from './components/KeyProjectsForm';
import { PositionsOfResponsibilityForm } from './components/PositionsOfResponsibilityForm';
import { ScholasticAchievementsForm } from './components/ScholasticAchievementsForm';
import { ExtraCurricularsForm } from './components/ExtraCurricularsForm';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

const initialData = {
  personalDetails: { name: "Mohammad Shabir Peerzada", branch: "Civil Engineering", roll_no: "23B0717", cpi: "8.64", dob: "26/05/2004", gender: "Male", phone: "", email: "", linkedin: "", github: "" },
  scholasticAchievements: [
    { text: "Among the top 2.15 percentile in JEE Advanced examination out of 0.18 million candidates all over India[2023]" },
    { text: "Secured 99.05 percentile in JEE Main 2023 examination out of 1.1 million eligible candidates all over India[2023]" }
  ], 
  professionalExperience: [], 
  keyProjects: [], 
  positionsOfResponsibility: [],
  extraCurriculars: []
};

// Map keys to components and titles
const sectionComponents = {
    scholasticAchievements: { Component: ScholasticAchievementsForm, title: "Scholastic Achievements" },
    professionalExperience: { Component: ProfessionalExperienceForm, title: "Professional Experience" },
    keyProjects: { Component: KeyProjectsForm, title: "Key Projects" },
    positionsOfResponsibility: { Component: PositionsOfResponsibilityForm, title: "Positions of Responsibility" },
    extraCurriculars: { Component: ExtraCurricularsForm, title: "Extracurricular Activities" },
};

function App() {
  const [resumeData, setResumeData] = useState(() => {
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // Ensure extraCurriculars field exists in saved data
      if (!parsedData.extraCurriculars) {
        parsedData.extraCurriculars = [];
      }
      return parsedData;
    }
    return initialData;
  });
  
  const [sectionOrder, setSectionOrder] = useState(() => {
    const savedOrder = localStorage.getItem('sectionOrder');
    if (savedOrder) {
      const parsedOrder = JSON.parse(savedOrder);
      // Ensure extraCurriculars is in the section order
      if (!parsedOrder.includes('extraCurriculars')) {
        parsedOrder.push('extraCurriculars');
      }
      return parsedOrder;
    }
    return ['scholasticAchievements', 'professionalExperience', 'keyProjects', 'positionsOfResponsibility', 'extraCurriculars'];
  });

  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
    localStorage.setItem('sectionOrder', JSON.stringify(sectionOrder));
  }, [resumeData, sectionOrder]);

  // The 'beforeunload' listener remains the same
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (JSON.stringify(resumeData) !== JSON.stringify(initialData)) {
        e.preventDefault(); e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [resumeData]);

  const handleGeneratePdf = async () => {
    setIsLoading(true);
    // Include sectionOrder in the payload
    const payload = { ...resumeData, sectionOrder, template_name: 'one_page.tex' };
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/generate_pdf`, payload, { responseType: 'blob' });
      const fileUrl = URL.createObjectURL(response.data);
      setPdfUrl(fileUrl);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Check the backend console.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setResumeData(prev => ({...prev, personalDetails: {...prev.personalDetails, [name]: value}}));
  }

  const moveSection = (index, direction) => {
    const newOrder = [...sectionOrder];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newOrder.length) return; // Boundary check
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]]; // Swap
    setSectionOrder(newOrder);
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-slate-900 p-8 overflow-y-auto space-y-8">
        <h1 className="text-4xl font-bold tracking-tighter text-white">Resume Generator</h1>
        <Tooltip id="main-tooltip" />
        
        {/* Static sections like Template and Personal Details */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold text-white mb-4">Select Template</h2>
            <select 
                value={resumeData.template_name || 'one_page.tex'}
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

        {/* Dynamically Ordered Sections */}
        {sectionOrder.map((sectionKey, index) => {
          const { Component, title } = sectionComponents[sectionKey];
          return (
            <div key={sectionKey} className="bg-slate-800 rounded-xl shadow-2xl relative group">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveSection(index, -1)} disabled={index === 0} className="p-1 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-20 disabled:cursor-not-allowed">
                  <ArrowUp size={16} />
                </button>
                <button onClick={() => moveSection(index, 1)} disabled={index === sectionOrder.length - 1} className="p-1 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-20 disabled:cursor-not-allowed">
                  <ArrowDown size={16} />
                </button>
              </div>
              <Component 
                resumeData={resumeData} 
                setResumeData={setResumeData} 
                index={index}
                moveSection={moveSection}
                isFirst={index === 0}
                isLast={index === sectionOrder.length - 1}
              />
            </div>
          );
        })}

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