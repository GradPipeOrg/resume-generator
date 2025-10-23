/**
 * App.jsx is the main component for the Resume Generator application*/
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import { Download, ArrowUp, ArrowDown, HelpCircle, Eye } from 'lucide-react';
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
import { TechnicalSkillsForm } from './components/TechnicalSkillsForm';
import { Tour } from './components/Tour';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

// --- NEW: Decoupled Template Configuration ---
const headerOptions = {
  'universal': {
    name: 'Universal',
    headerFields: ['name', 'branch', 'institution', 'cpi', 'grad_year', 'location', 'email', 'phone', 'linkedin_url', 'github_url']
  },
  'iitb': {
    name: 'IITB Official',
    headerFields: ['name', 'branch', 'roll_no', 'cpi', 'dob', 'gender']
  },
  'iitb_2': {
    name: 'IITB Official - 2',
    headerFields: ['name', 'branch', 'institution', 'email', 'roll_no', 'dob', 'gender', 'grad_year', 'cpi']
  },
  'blank': {
    name: 'Placement Cell (Blank)',
    headerFields: []
  }
};

const bodyOptions = {
  'iitb_one_page.tex': { name: 'IITB Style' },
  'dense_blue.tex': { name: 'IITB Style(Dense)' },
  'tcolorbox_style.tex': { name: 'T-Colorbox Style' },
};



const initialData = {
  personalDetails: { 
    name: "Trisha", 
    branch: "Computer Science and Engineering", 
    institution: "Indian Institute of Technology Bombay", 
    email: "trisha@iitb.ac.in", 
    phone: "+91 9876543210", 
    linkedin_url: "https://www.linkedin.com/in/trisha-1234567890", 
    github_url: "https://github.com/trisha", 
    location: "Mumbai, India", 
    cpi: "9.0", 
    grad_year: "2027", 
    roll_no: "1234567890", 
    dob: "25/05/2005", 
    gender: "Female" 
  },
  scholasticAchievements: [
    { text: "Won the 2025 election for the Chancellor of Germany" },
    { text: "Won the 2026 election for the Chancellor of Germany" }
  ], 
  professionalExperience: [
    { company: "", role: "", dates: "", description: "", points: [""] }
  ], 
  keyProjects: [], 
  positionsOfResponsibility: [], 
  extraCurriculars: [],
  technicalSkills: []
};

// Map keys to components and titles
const sectionComponents = {
    scholasticAchievements: { Component: ScholasticAchievementsForm, title: "Scholastic Achievements" },
    professionalExperience: { Component: ProfessionalExperienceForm, title: "Professional Experience" },
    keyProjects: { Component: KeyProjectsForm, title: "Key Projects" },
    positionsOfResponsibility: { Component: PositionsOfResponsibilityForm, title: "Positions of Responsibility" },
    extraCurriculars: { Component: ExtraCurricularsForm, title: "Extracurricular Activities" },
    technicalSkills: { Component: TechnicalSkillsForm, title: "Technical Skills" },
};

function App() {
  const [headerId, setHeaderId] = useState('universal');
  const [bodyId, setBodyId] = useState('iitb_one_page.tex');
  const [resumeData, setResumeData] = useState(() => {
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // Ensure extraCurriculars field exists in saved data
      if (!parsedData.extraCurriculars) {
        parsedData.extraCurriculars = [];
      }
      if (!parsedData.technicalSkills) {
        parsedData.technicalSkills = [];
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
      if (!parsedOrder.includes('technicalSkills')) {
        parsedOrder.push('technicalSkills');
      }
      return parsedOrder;
    }
    return ['scholasticAchievements', 'professionalExperience', 'keyProjects', 'technicalSkills', 'positionsOfResponsibility', 'extraCurriculars'];
  });

  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- NEW STATE FOR MODAL ---
  const [openModal, setOpenModal] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  
  // --- NEW STATE FOR WAITLIST MODAL ---
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');

  // --- Start Addition ---
const previewImageMap = {
  'iitb_one_page.tex': '/previews/iitb_style_body.png',
  'dense_blue.tex': '/previews/iitb_style_dense_body.png',
  'tcolorbox_style.tex': '/previews/tcolorbox_body.png',
};

const handleShowPreview = (fileName) => {
  const imageUrl = previewImageMap[fileName];
  if (imageUrl) {
    setPreviewImageUrl(imageUrl);
    setIsPreviewModalOpen(true);
    trackEvent('Template Preview Viewed', { template: fileName });
  } else {
    console.warn(`Preview image not found for template: ${fileName}`);
  }
};
// --- End Addition ---

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
    const payload = { ...resumeData, sectionOrder, header_id: headerId, body_id: bodyId };
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
      // Trigger PDF download on successful submission
      if (pdfUrl) {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${resumeData.personalDetails.name.replace(' ', '_')}_Resume.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Funnel submission failed:", error);
      alert("Sorry, there was an error submitting your profile.");
    } finally {
      setIsLoading(false);
      setOpenModal(false); // Close modal after action
    }
  };

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    if (!waitlistEmail) {
      alert("Please enter your email.");
      return;
    }
    trackEvent('Waitlist Joined');
    setIsLoading(true); // Reuse existing loading state
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/waitlist/submit`, { email: waitlistEmail });
      alert("Success! You've been added to the waitlist.");
      setIsWaitlistModalOpen(false); // Close modal on success
      setWaitlistEmail(''); // Clear email
    } catch (error) {
      console.error("Waitlist submission failed:", error);
      alert("Sorry, there was an error submitting your email.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Functions to control the modal ---
  const onOpenModal = () => setOpenModal(true);
  const onCloseModal = () => setOpenModal(false);

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-slate-900 p-8 overflow-y-auto space-y-8">
        <div className="flex items-start justify-between" id="main-header">
          {/* LEFT SIDE: Title and new "by GradPipe" button */}
          <div className="flex flex-col"> {/* <-- 1. ADDED flex flex-col */}
            <h1 className="text-4xl font-bold tracking-tighter text-white">Apex - The IITB Resume Generator</h1>
            <button 
              onClick={() => setIsWaitlistModalOpen(true)}
              className="text-lg font-normal text-slate-400 hover:text-indigo-400 transition -mt-1 self-center"
              data-tooltip-id="main-tooltip" 
              data-tooltip-content="About GradPipe"
            >
              by GradPipe
            </button>
          </div>

          {/* RIGHT SIDE: Tour button STAYS HERE */}
          <button 
            onClick={() => setRunTour(true)} 
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition mt-2" 
            data-tooltip-id="main-tooltip" 
            data-tooltip-content="Start Tour"
          >
            <HelpCircle size={20} />
            <span>How to Use</span>
          </button>
        </div>
        <Tooltip id="main-tooltip" />
        
{/* --- NEW: Decoupled Template Selectors --- */}
<div className="bg-slate-800 rounded-xl p-6 shadow-2xl space-y-6" id="template-selectors">
  <div>
    <h2 className="text-2xl font-semibold text-white mb-4">Header Style</h2>
    <div className="flex flex-wrap gap-3">
      {Object.entries(headerOptions).map(([id, { name }]) => (
        <button
          key={id}
          onClick={() => setHeaderId(id)}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
            headerId === id 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  </div>
  <div>
    <h2 className="text-2xl font-semibold text-white mb-4">Body Style</h2>
    <div className="flex flex-wrap gap-3">
      {/* --- Start Replacement --- */}
      {Object.entries(bodyOptions).map(([fileName, { name }]) => (
        <div key={fileName} className="flex items-center gap-1">
          <button
            onClick={() => setBodyId(fileName)}
            className={`px-4 py-2 rounded-l-lg font-semibold transition-colors duration-200 ${
              bodyId === fileName
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {name}
          </button>
          <button
            onClick={() => handleShowPreview(fileName)}
            className={`p-2 rounded-r-lg transition-colors duration-200 ${
               bodyId === fileName
                ? 'bg-indigo-700 hover:bg-indigo-800 text-white'
                : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
            }`}
            data-tooltip-id="main-tooltip"
            data-tooltip-content={`Preview ${name}`}
          >
            <Eye size={18} />
          </button>
        </div>
      ))}
      {/* --- End Replacement --- */}
    </div>
  </div>
</div>

{/* --- MODIFIED: Conditionally render Personal Details section --- */}
{headerOptions[headerId].headerFields.length > 0 && (
    <div className="bg-slate-800 rounded-xl p-6 shadow-2xl" id="personal-details">
        <h2 className="text-2xl font-semibold text-white mb-4">Personal Details</h2>
        <div className="space-y-3">
            {headerOptions[headerId].headerFields.map((fieldName) => {
                const placeholder = fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
)}

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

        {/* --- NEW: App Footer --- */}
        <footer className="mt-12 pt-6 border-t border-slate-700 text-center space-y-4">
          <div className="flex items-center justify-center gap-6">
            <a 
              href="https://www.linkedin.com/company/gradpipe" // <<< UPDATE THIS LINK
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-400 hover:text-indigo-400 transition"
              data-tooltip-id="main-tooltip" 
              data-tooltip-content="GradPipe on LinkedIn"
            >
              LinkedIn
            </a>
            <a 
              href="https://www.instagram.com/gradpipe" // <<< UPDATE THIS LINK
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-400 hover:text-indigo-400 transition"
              data-tooltip-id="main-tooltip" 
              data-tooltip-content="GradPipe on Instagram"
            >
              Instagram
            </a>
          </div>
          <p className="text-sm text-slate-500">
            © 2025 GradPipe. All rights reserved.
          </p>
        </footer>
        {/* --- End of App Footer --- */}

      </div>

      <div className="w-1/2 bg-slate-800/50 p-8 flex flex-col items-center" id="pdf-preview">
        <h2 className="text-2xl font-semibold text-white mb-6">Preview</h2>
        
        {/* --- Start Replacement --- */}

        {/* Container for Side-by-Side Buttons */}
        <div className="flex items-center justify-center gap-4 mb-2 w-full max-w-sm">
          {/* Generate Button (Always Visible) */}
          <button
            onClick={handleGeneratePdf}
            disabled={isLoading}
            id="generate-pdf-btn"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-base transition-transform transform hover:scale-[1.02] active:scale-95 shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : 'Generate / Refresh'}
          </button>

          {/* Download Button (Conditional) */}
          {pdfUrl && (
            <button
              onClick={onOpenModal}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Download
            </button>
          )}
        </div>

        {/* Feedback Link (Below Buttons) */}
        <div className="text-center mb-4">
          <a
            href="https://forms.gle/4dKgr7m7VJ2GDAwb7"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 hover:text-indigo-400 transition"
          >
            Spotted a bug or have feedback? Let us know!
          </a>
        </div>

        {/* The PDF viewer section */}
        <div className="w-full max-w-2xl aspect-[1/1.414] bg-slate-900/50 rounded-lg mt-4">
        {/* --- End Replacement --- */}
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

        {/* --- NEW: Template Preview Modal --- */}
        <Modal
          open={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          center
          classNames={{
            modal: 'bg-slate-800 border border-slate-600 shadow-2xl p-0', // Removed padding for image fit
            overlay: 'bg-black bg-opacity-75',
            closeButton: 'text-white fill-current hover:text-slate-300 m-2' // Style close button
          }}
          styles={{
            modal: {
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '0.5rem',
              maxWidth: '80vw', // Limit width
              maxHeight: '90vh' // Limit height
            },
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.85)' // Darker overlay
            }
          }}
        >
          {previewImageUrl && (
            <img
              src={previewImageUrl}
              alt="Template Preview"
              className="max-w-full max-h-[85vh] object-contain rounded" // Image styling
            />
          )}
        </Modal>

        {/* --- NEW: Waitlist (Passive Funnel) Modal --- */}
        <Modal 
          open={isWaitlistModalOpen} 
          onClose={() => setIsWaitlistModalOpen(false)} 
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
              color: 'white',
              maxWidth: '500px'
            },
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.75)'
            }
          }}
        >
          <div className="p-6 text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">Stop Applying. Get Discovered.</h2>
            <p className="text-slate-300">
              Apex is a free tool built by GradPipe. Our real mission isn't just to build resumes, it's to get you hired.
              We're building an exclusive talent pool to connect top students (like you) directly with global companies and startups.
            </p>

            <form onSubmit={handleWaitlistSubmit} className="space-y-4 pt-2">
              <input
                type="email"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder="Enter your email to join the waitlist"
                className="input-style w-full"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-5 rounded-lg transition disabled:opacity-50"
              >
                {isLoading ? "Submitting..." : "Join the Waitlist"}
              </button>
            </form>
          </div>
        </Modal>

      </div>
      <Tour run={runTour} setRun={setRunTour} />
    </div>
  );
}

export default App;