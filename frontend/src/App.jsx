import { useState, useEffect } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import { Download, ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import 'react-responsive-modal/styles.css'; // Import modal styles
import { Modal } from 'react-responsive-modal';
import { trackEvent } from './services/mixpanel';
import './App.css';
import { ProfessionalExperienceForm } from './components/ProfessionalExperienceForm';
import { KeyProjectsForm } from './components/KeyProjectsForm';
import { PositionsOfResponsibilityForm } from './components/PositionsOfResponsibilityForm';
import { ScholasticAchievementsForm } from './components/ScholasticAchievementsForm';
import { ExtraCurricularsForm } from './components/ExtraCurricularsForm';
import { Tour } from './components/Tour';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

// --- Template Configuration ---
const templates = {
  'universal_one_page.tex': {
    name: '1-Page Universal',
    headerFields: ['name', 'branch', 'institution', 'cpi', 'grad_year', 'location', 'email', 'phone', 'linkedin_url', 'github_url']
  },
  'iitb_one_page.tex': {
    name: '1-Page IITB Style',
    headerFields: ['name', 'branch', 'roll_no', 'cpi', 'dob', 'gender']
  }
};

const initialData = {
  personalDetails: { 
    name: "Adolf Hitler", 
    branch: "Politics", 
    institution: "Indian Institute of Technology Bombay", 
    email: "hitler@nazi.de", 
    phone: "+49 12345 67890", 
    linkedin_url: "https://www.linkedin.com/in/adolf-hitler-1900", 
    github_url: "https://github.com/adolf-hitler-1900", 
    location: "Berlin, Germany", 
    cpi: "6.9", 
    grad_year: "1945", 
    roll_no: "4567890", 
    dob: "20/04/1900", 
    gender: "Male" 
  },
  scholasticAchievements: [
    { text: "Won the 1933 election for the Chancellor of Germany" },
    { text: "Won the 1936 election for the Chancellor of Germany" }
  ], 
  professionalExperience: [
    { company: "", role: "", dates: "", description: "", points: [""] }
  ], 
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
  const [template, setTemplate] = useState('universal_one_page.tex');
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
  
  // --- NEW STATE FOR MODAL ---
  const [openModal, setOpenModal] = useState(false);
  const [runTour, setRunTour] = useState(false);

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
    const payload = { ...resumeData, sectionOrder, template_name: template };
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/generate_pdf`, payload, { responseType: 'blob' });
      const fileUrl = URL.createObjectURL(response.data);
      setPdfUrl(fileUrl);

      // --- ADD THIS LINE ---
      trackEvent('PDF Generated Successfully');

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

  const handleTemplateChange = (e) => {
    setTemplate(e.target.value);
  };

  const moveSection = (index, direction) => {
    const newOrder = [...sectionOrder];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newOrder.length) return; // Boundary check
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]]; // Swap
    setSectionOrder(newOrder);
  };

  const handleGetDiscovered = async () => {
    trackEvent('Get Discovered Clicked');
    setIsLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/funnel/submit`, { resumeData });
      alert("Success! Your profile has been submitted to the GradPipe talent pool.");
    } catch (error) {
      console.error("Funnel submission failed:", error);
      alert("Sorry, there was an error submitting your profile.");
    } finally {
      setIsLoading(false);
      setOpenModal(false); // Close modal after action
    }
  };

  // --- Functions to control the modal ---
  const onOpenModal = () => setOpenModal(true);
  const onCloseModal = () => setOpenModal(false);

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-slate-900 p-8 overflow-y-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tighter text-white">Resume Generator</h1>
          <button onClick={() => setRunTour(true)} className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition" data-tooltip-id="main-tooltip" data-tooltip-content="Start Tour">
            <HelpCircle size={20} />
            <span>How to Use</span>
          </button>
        </div>
        <Tooltip id="main-tooltip" />
        
        <div className="bg-slate-800 rounded-xl p-6 shadow-2xl" id="template-selector">
          <h2 className="text-2xl font-semibold text-white mb-4">Select Template</h2>
          <select value={template} onChange={handleTemplateChange} className="input-style">
            {Object.entries(templates).map(([fileName, { name }]) => (
              <option key={fileName} value={fileName}>{name}</option>
            ))}
          </select>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 shadow-2xl" id="personal-details">
          <h2 className="text-2xl font-semibold text-white mb-4">Personal Details</h2>
          <div className="space-y-3">
            {/* --- NEW DYNAMIC FORM --- */}
            {templates[template].headerFields.map((fieldName) => {
                // Simple title generation from fieldName
                const placeholder = fieldName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                return (
                    <input
                        key={fieldName}
                        name={fieldName}
                        value={resumeData.personalDetails[fieldName] || ''}
                        onChange={handlePersonalChange}
                        placeholder={placeholder}
                        className="input-style"
                    />
                );
            })}
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

        <div className="text-center">
          <a 
            href="https://forms.gle/4dKgr7m7VJ2GDAwb7" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-slate-400 hover:text-indigo-400 transition"
          >
            Spotted a bug or have feedback? Let us know!
          </a>
        </div>

        <button 
            onClick={handleGeneratePdf} 
            disabled={isLoading} 
            id="generate-pdf-btn"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-[1.02] active:scale-95 shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
            {isLoading ? 'Generating...' : 'Generate / Refresh Preview'}
        </button>
      </div>

      <div className="w-1/2 bg-slate-800/50 p-8 flex flex-col items-center" id="pdf-preview">
        <h2 className="text-2xl font-semibold text-white mb-6">Preview</h2>
        
        {/* The Download button now opens the modal */}
        {pdfUrl && (
          <button
            onClick={onOpenModal}
            className="mb-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <Download size={20} />
            Download PDF
          </button>
        )}

        {/* The PDF viewer section */}
        <div className="w-full max-w-2xl aspect-[1/1.414] bg-slate-900/50 rounded-lg mt-4">
          {pdfUrl ? (
            <Document file={pdfUrl} onLoadError={(error) => console.error("React-PDF Load Error:", error)}>
              <Page pageNumber={1} />
            </Document>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-center">Click "Generate" to see your preview.</p>
            </div>
          )}
        </div>

        {/* --- NEW MODAL COMPONENT --- */}
        <Modal 
          open={openModal} 
          onClose={onCloseModal} 
          center 
          classNames={{ 
            modal: 'bg-slate-800 border border-slate-600 shadow-2xl text-white',
            overlay: 'bg-black bg-opacity-75'
          }}
          styles={{
            modal: {
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '0.5rem',
              color: 'white'
            },
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.75)'
            }
          }}
        >
          <div className="p-6 text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">Launch Your Career</h2>
            <p className="text-slate-300">Submit your resume to get discovered by top startups in GradPipe's network.</p>
            
            <button
              onClick={handleGetDiscovered}
              disabled={isLoading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-5 rounded-lg transition disabled:opacity-50"
            >
              {isLoading ? "Submitting..." : "Download & Get Discovered"}
            </button>

            <a
              href={pdfUrl}
              download={`${resumeData.personalDetails.name.replace(' ', '_')}_Resume.pdf`}
              onClick={onCloseModal} // Close modal on click
              className="text-sm text-slate-400 hover:text-slate-200 transition"
            >
              No thanks, just download
            </a>
          </div>
        </Modal>

      </div>
      <Tour run={runTour} setRun={setRunTour} />
    </div>
  );
}

export default App;