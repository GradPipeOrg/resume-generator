// Forcing a fresh build on Vercel
// Now using the VITE_API_BASE_URL from the .env file
import { useState } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
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
    <div className="app-container">
      <div className="form-container">
        <h1>Resume Generator</h1>
        
        <div className="form-section">
            <h2>Select Template</h2>
            <select 
                value={resumeData.template_name}
                onChange={(e) => setResumeData(prev => ({...prev, template_name: e.target.value}))}
                className="input-style"
            >
                <option value="one_page.tex">1-Page Tech Resume</option>
            </select>
        </div>

        <div className="form-section">
            <h2>Personal Details</h2>
            <input name="name" value={resumeData.personalDetails.name} onChange={handlePersonalChange} placeholder="Name" className="input-style" />
            <input name="branch" value={resumeData.personalDetails.branch} onChange={handlePersonalChange} placeholder="Branch" className="input-style" />
            <input name="roll_no" value={resumeData.personalDetails.roll_no} onChange={handlePersonalChange} placeholder="Roll Number" className="input-style" />
            <input name="cpi" value={resumeData.personalDetails.cpi} onChange={handlePersonalChange} placeholder="CPI" className="input-style" />
            <input name="dob" value={resumeData.personalDetails.dob} onChange={handlePersonalChange} placeholder="Date of Birth (DD/MM/YYYY)" className="input-style" />
            <input name="gender" value={resumeData.personalDetails.gender} onChange={handlePersonalChange} placeholder="Gender" className="input-style" />
        </div>

        <ProfessionalExperienceForm resumeData={resumeData} setResumeData={setResumeData} />
        <KeyProjectsForm resumeData={resumeData} setResumeData={setResumeData} />
        <PositionsOfResponsibilityForm resumeData={resumeData} setResumeData={setResumeData} />
        <ScholasticAchievementsForm resumeData={resumeData} setResumeData={setResumeData} />

        <button onClick={handleGeneratePdf} disabled={isLoading} className="generate-button">
            {isLoading ? 'Generating...' : 'Generate / Refresh Preview'}
        </button>
      </div>
      <div className="preview-container">
        <h2>Preview</h2>
        {pdfUrl ? (
          <Document file={pdfUrl} onLoadError={(error) => console.error("React-PDF Load Error:", error)}>
            <Page pageNumber={1} />
          </Document>
        ) : (
          <p>Click the generate button to see your PDF preview.</p>
        )}
      </div>
    </div>
  );
}

export default App;