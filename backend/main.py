# main.py (Final Stable Version with Corrected Spacing)
import subprocess
import uuid
import os
import re
import requests
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
from dotenv import load_dotenv
import traceback

# --- AI Feature Code ---
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

class ImproveTextRequest(BaseModel):
    text: str

class AdjustTextRequest(BaseModel):
    text: str

def generate_ai_prompt(text: str) -> str:
    # A curated list of "gold standard" examples provided by the user.
    examples = [
        "Leading an IIT-B intern team to audit Agentic AI frameworks, automating IB tasks to project a 25% cost reduction",
        "Authored a VC-grade market analysis defining a 269 Cr obtainable market using the TAM-SAM-SOM framework",
        "Engineered the MVP, an AI agent on n8n, automating resume data extraction via Google Gemini and OCR API's",
        "Trained a predictive FinBERT NLP model to predict stock trends from 25,000+ news articles, reaching 73% accuracy",
        "Architected a scalable AI platform to consolidate analyst insights and eliminating redundant research duplication",
        "Implemented semantic de-duplication with Sentence Transformers and a custom AI similarity matching engine",
        "Helped 700+ final-year students in connecting with 250+ alumni mentors via the Placement Mentoring Program",
        "Managed the estate vertical solely and was overseeing an annual amenities budget of INR 1M+ for new initiatives",
        "Spearheaded the installation of 20+ lights on hostel grounds while managing a budget of INR 0.1M for the project",
        "Led the hostel cycle auction, coordinating with the warden and the security office to sell 400+ unclaimed cycles"
    ]
    example_string = "\n".join([f"- \"{ex}\"" for ex in examples])

    return f"""
    You are an expert resume writing assistant for students at a top-tier engineering college like an IIT in India.
    Your task is to take a user-written bullet point and rewrite it to match the high-quality, dense, and metric-driven style of the examples provided below.

    --- EXAMPLES OF PERFECT OUTPUT STYLE ---
    {example_string}
    --- END OF EXAMPLES ---

    Follow these rules strictly:
    1. Start with a strong, impressive action verb.
    2. Use the STAR (Situation, Task, Action, Result) method. Focus on quantifiable results.
    3. Keep the tone highly professional and concise.
    4. CRITICAL RULE 1: The final output must be a single, unbroken line of text strictly between 110 and 120 characters.
    5. CRITICAL RULE 2: Do not use any Markdown formatting or personal pronouns like "I" or "we".

    Now, take the following user-written text and transform it in the same style as the examples.
    User Text: "{text}"
    Perfect Output:
    """

def generate_lengthen_prompt(text: str) -> str:
    return f"""
    You are a professional copy-editor. The following resume bullet point is too short to fill the line.
    Your task is to rewrite it to be longer, specifically aiming for a length between 110 and 120 characters.
    You must do this by adding relevant professional detail or more descriptive language, without losing the core meaning or metrics.
    Do not use any Markdown formatting. Your output must be only the rewritten sentence.

    Original Short Text: "{text}"
    
    Rewritten, Longer Text (110-120 characters):
    """

def generate_shorten_prompt(text: str) -> str:
    return f"""
    You are a professional copy-editor. The following resume bullet point is too long and wraps to a second line.
    Your task is to rewrite it to be more concise, specifically aiming for a length between 110 and 120 characters.
    You must preserve the key metrics and accomplishments.
    Do not use any Markdown formatting. Your output must be only the rewritten sentence.

    Original Long Text: "{text}"
    
    Rewritten, Shorter Text (110-120 characters):
    """

# --- Pydantic Models ---
class PersonalDetails(BaseModel):
    name: str = ""
    branch: str = ""
    institution: str = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    linkedin_url: Optional[str] = ""
    github_url: Optional[str] = ""
    location: Optional[str] = ""
    cpi: str = ""
    grad_year: Optional[str] = ""
    roll_no: Optional[str] = ""
    dob: Optional[str] = ""
    gender: Optional[str] = ""
class ScholasticAchievement(BaseModel): text: str = ""
class Experience(BaseModel): company: str = ""; role: str = ""; dates: str = ""; description: str = ""; points: List[str] = []
class Project(BaseModel): name: str = ""; subtitle: str = ""; dates: str = ""; description: str = ""; points: List[str] = []
class Responsibility(BaseModel): role: str = ""; organization: str = ""; dates: str = ""; description: str = ""; points: List[str] = []
class ExtraCurricular(BaseModel): text: str = ""; date: str = ""

class ResumeData(BaseModel):
    template_name: str
    sectionOrder: List[str]
    personalDetails: PersonalDetails
    scholasticAchievements: List[ScholasticAchievement]
    professionalExperience: List[Experience]
    keyProjects: List[Project]
    positionsOfResponsibility: List[Responsibility]
    extraCurriculars: List[ExtraCurricular] = []

class FunnelSubmitData(BaseModel):
    resumeData: dict

def sanitize_and_format(text: str) -> str:
    # This function handles both sanitization and Markdown-style bolding.
    
    def sanitize_plain_text(s: str) -> str:
        # The order of replacement is critical. Backslash must be handled first.
        s = s.replace('\\', r'\textbackslash{}')
        s = s.replace('&', r'\&')
        s = s.replace('%', r'\%') # This is the original, correct escape for %
        s = s.replace('$', r'\$')
        s = s.replace('#', r'\#')
        s = s.replace('_', r'\_')
        s = s.replace('{', r'\{')
        s = s.replace('}', r'\}')
        s = s.replace('[', r'{[}')
        s = s.replace(']', r'{]}')
        s = s.replace('~', r'\textasciitilde{}')
        s = s.replace('^', r'\textasciicircum{}')
        return s

    # Split the string by the bold delimiter (**), keeping the delimiters
    parts = re.split(r'(\*\*.*?\*\*)', text)
    
    processed_parts = []
    for part in parts:
        if part.startswith('**') and part.endswith('**'):
            # This is a bolded part. Extract content, sanitize it, and wrap in \textbf{}
            content = part[2:-2]
            processed_parts.append(f"\\textbf{{{sanitize_plain_text(content)}}}")
        else:
            # This is a normal part. Just sanitize it.
            processed_parts.append(sanitize_plain_text(part))
            
    return "".join(processed_parts)

# --- FINAL, STABLE LaTeX Generation Functions ---
def generate_iitb_header_latex(details: PersonalDetails) -> str:
    # This function now perfectly replicates the structured IITB header with the logo.
    return f"""
\\begin{{tabular*}}{{\\textwidth}}{{l@{{\\extracolsep{{\\fill}}}}cr}}
    % Column 1: IITB Logo (larger and left-aligned)
    \\begin{{tabular}}[b]{{l}}
        \\hspace*{{-14.11mm}}\\includegraphics[height=1.8cm]{{iitb_logo.png}}
    \\end{{tabular}} &
    % Column 2: Name and Institution (Center Aligned)
    \\begin{{tabular}}[b]{{c}}
        \\textbf{{\\Large {sanitize_and_format(details.name)}}} \\\\
        {sanitize_and_format(details.branch)} \\\\
        {sanitize_and_format(details.institution)}
    \\end{{tabular}} &
    % Column 3: Key Stats (Right Aligned)
    \\begin{{tabular}}[b]{{l}}
        \\textbf{{{sanitize_and_format(details.roll_no)}}} \\\\
        B.Tech \\\\
        Gender: {sanitize_and_format(details.gender)} \\\\
        DOB: {sanitize_and_format(details.dob)}
    \\end{{tabular}}
\\end{{tabular*}}
\\vspace{{2mm}}
\\begin{{tabular*}}{{\\textwidth}}{{@{{\\extracolsep{{\\fill}}}}lcrr}}
    \\hline
    \\textbf{{Examination}} & \\textbf{{Institute}} & \\textbf{{Year}} & \\textbf{{CPI / \\%}} \\\\ \\hline
    Graduation & {sanitize_and_format(details.institution)} & 2027 & {sanitize_and_format(details.cpi)} \\\\ \\hline
\\end{{tabular*}}
"""

def generate_personal_details_latex(details: PersonalDetails) -> str:
    # This function creates the final, multi-column header using minipages for perfect alignment.
    contact_parts = []
    if details.email:
        contact_parts.append(f"\\faEnvelope \\hspace{{1mm}} \\href{{mailto:{details.email}}}{{{sanitize_and_format(details.email)}}}")
    if details.phone:
        contact_parts.append(f"\\faPhone \\hspace{{1mm}} {sanitize_and_format(details.phone)}")
    if details.linkedin_url:
        contact_parts.append(f"\\faLinkedin \\hspace{{1mm}} \\href{{{details.linkedin_url}}}{{LinkedIn}}")
    if details.github_url:
        contact_parts.append(f"\\faGithub \\hspace{{1mm}} \\href{{{details.github_url}}}{{GitHub}}")
    contact_block = " \\\\ \n".join(contact_parts)
    return f"""
\\begin{{minipage}}[t]{{0.3\\textwidth}}
    \\raggedright
    {contact_block}
\\end{{minipage}}%
\\begin{{minipage}}[t]{{0.4\\textwidth}}
    \\centering
    \\vspace*{{2mm}}
    \\textbf{{\\LARGE \\textcolor{{Blue}}{{{sanitize_and_format(details.name)}}}}} \\\\
    \\normalsize {sanitize_and_format(details.branch)} \\\\
    \\normalsize {sanitize_and_format(details.institution)}
\\end{{minipage}}%
\\begin{{minipage}}[t]{{0.3\\textwidth}}
    \\raggedleft
    \\textbf{{CPI:}} {sanitize_and_format(details.cpi)} \\\\
    \\textbf{{Graduation:}} {sanitize_and_format(details.grad_year)} \\\\
    \\textbf{{Location:}} {sanitize_and_format(details.location)}
\\end{{minipage}}
\\vspace{{4mm}}
\\rule{{\\textwidth}}{{0.4pt}}
"""

def generate_universal_header_latex(details: PersonalDetails) -> str:
    # This function creates the final, multi-column header using minipages for perfect alignment.
    
    contact_parts = []
    if details.email:
        contact_parts.append(f"\\faEnvelope \\hspace{{1mm}} \\href{{mailto:{details.email}}}{{{sanitize_and_format(details.email)}}}")
    if details.phone:
        contact_parts.append(f"\\faPhone \\hspace{{1mm}} {sanitize_and_format(details.phone)}")
    if details.linkedin_url:
        contact_parts.append(f"\\faLinkedin \\hspace{{1mm}} \\href{{{details.linkedin_url}}}{{LinkedIn}}")
    if details.github_url:
        contact_parts.append(f"\\faGithub \\hspace{{1mm}} \\href{{{details.github_url}}}{{GitHub}}")
        
    contact_block = " \\\\ \n".join(contact_parts)

    return f"""
% Using minipages for a robust 3-column layout
\\begin{{minipage}}[t]{{0.3\\textwidth}}
    \\raggedright
    {contact_block}
\\end{{minipage}}%
\\begin{{minipage}}[t]{{0.4\\textwidth}}
    \\centering
    \\vspace*{{2mm}} % Artificially lower the center block for visual balance
    \\textbf{{\\LARGE \\textcolor{{Blue}}{{{sanitize_and_format(details.name)}}}}} \\\\
    \\normalsize {sanitize_and_format(details.branch)} \\\\
    \\normalsize {sanitize_and_format(details.institution)}
\\end{{minipage}}%
\\begin{{minipage}}[t]{{0.3\\textwidth}}
    \\raggedleft
    \\textbf{{CPI:}} {sanitize_and_format(details.cpi)} \\\\
    \\textbf{{Graduation:}} {sanitize_and_format(details.grad_year)} \\\\
    \\textbf{{Location:}} {sanitize_and_format(details.location)}
\\end{{minipage}}

\\vspace{{4mm}}
\\rule{{\\textwidth}}{{0.4pt}}
\\vspace{{-2mm}}
"""

def generate_scholastic_latex(achievements: List[ScholasticAchievement]) -> str:
    if not achievements: return ""
    latex_string = "\\section*{\\textcolor{Blue}{\\Large{Scholastic Achievements} \\vhrulefill{1pt}}}\n\\vspace{-2mm}\n"
    items = "".join([f"    \\item {sanitize_and_format(ach.text)}\n" for ach in achievements])
    latex_string += f"\\begin{{itemize}}[itemsep=-0.8mm,leftmargin=*]\n{items}\\end{{itemize}}\n"
    latex_string += "\\vspace{-6mm}\n"
    return latex_string

def generate_experience_latex(experiences: List[Experience]) -> str:
    if not experiences: return ""
    latex_string = "\\section*{\\textcolor{Blue}{\\Large{Professional Experience} \\vhrulefill{1pt}}}\n\\vspace{-2mm}\n"
    for i, exp in enumerate(experiences):
        if i > 0: latex_string += "\\vspace{1mm}\n" # Add a small space BETWEEN experiences
        points_latex = "".join([f"    \\item {sanitize_and_format(point)}\n" for point in exp.points if point.strip()])
        description_latex = f"\\vspace{{-1.5mm}}\n\\textit{{{sanitize_and_format(exp.description)}}}\n\\vspace{{-1mm}}" if exp.description else ""
        latex_string += f"""
\\noindent \\textbf{{\\large {sanitize_and_format(exp.company)}}}
| \\textbf{{\\large   {sanitize_and_format(exp.role)}}}
\\hfill{{\\textit{{{sanitize_and_format(exp.dates)}}}}}
\\vspace{{-3mm}}
\\\\ \\rule{{\\textwidth}}{{0.2mm}}
{description_latex}
\\begin{{itemize}}[itemsep=0mm, leftmargin=6mm]
{points_latex}\\end{{itemize}}
"""
    if experiences: latex_string += "\\vspace{-6mm}\n" # Add final space after the whole section
    return latex_string

def generate_projects_latex(projects: List[Project]) -> str:
    if not projects: return ""
    latex_string = "\\section*{\\textcolor{Blue}{\\Large{Key Projects} \\vhrulefill{1pt}}}\n\\vspace{-2mm}\n"
    for i, proj in enumerate(projects):
        if i > 0: latex_string += "\\vspace{-0.5mm}\n"
        points_latex = "".join([f"    \\item {sanitize_and_format(point)}\n" for point in proj.points if point.strip()])
        description_latex = f"\\vspace{{-1.5mm}}\n\\textit{{{sanitize_and_format(proj.description)}}}\n\\vspace{{-1mm}}" if proj.description else ""
        latex_string += f"""
\\noindent \\textbf{{\\large {sanitize_and_format(proj.name)}}}
\\textit{{| {sanitize_and_format(proj.subtitle)} }}
\\hfill{{\\textit{{{sanitize_and_format(proj.dates)}}}}}
\\vspace{{-3mm}}
\\\\ \\rule{{\\textwidth}}{{0.2mm}}
{description_latex}
\\begin{{itemize}}[itemsep=0mm, leftmargin=6mm]
{points_latex}\\end{{itemize}}
"""
    if projects: latex_string += "\\vspace{-6mm}\n"
    return latex_string

def generate_por_latex(pors: List[Responsibility]) -> str:
    if not pors: return ""
    latex_string = "\\section*{\\textcolor{Blue}{\\Large{Positions of Responsibility} \\vhrulefill{1pt}}}\n\\vspace{-2mm}\n"
    for i, por in enumerate(pors):
        if i > 0: latex_string += "\\vspace{-0.5mm}\n"
        points_latex = "".join([f"    \\item {sanitize_and_format(point)}\n" for point in por.points if point.strip()])
        latex_string += f"""
\\noindent \\textbf{{\\large {sanitize_and_format(por.role)}}} | {sanitize_and_format(por.organization)} \\hfill{{\\textit{{{sanitize_and_format(por.dates)}}}}} 
\\vspace{{-3mm}}
\\\\ \\rule{{\\textwidth}}{{0.2mm}}
\\vspace{{-1.5mm}}
\\textit{{{sanitize_and_format(por.description)}}}
\\vspace{{-1mm}}
\\begin{{itemize}}[itemsep=0mm, leftmargin=6mm]
{points_latex}\\end{{itemize}}
"""
    if pors: latex_string += "\\vspace{-6mm}\n"
    return latex_string

def generate_extracurricular_latex(extracurriculars: List[ExtraCurricular]) -> str:
    if not extracurriculars: return ""
    latex_string = "\\section*{\\textcolor{Blue}{\\Large{Extra-Curricular Activities} \\vhrulefill{1pt}}}\n\\vspace{-2mm}\n"
    items = "".join([f"    \\item {sanitize_and_format(ec.text)} \\hfill {{\\sl \\small [{sanitize_and_format(ec.date)}]}}\n" for ec in extracurriculars if ec.text.strip()])
    latex_string += f"\\begin{{itemize}}[itemsep=0mm, leftmargin=*]\n{items}\\end{{itemize}}\n"
    return latex_string

# --- FastAPI App ---
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.post("/generate_pdf")
async def generate_pdf(resume_data: ResumeData):
    try:
        template_filename = resume_data.template_name
        if '..' in template_filename: raise HTTPException(status_code=400, detail="Invalid template name")
        template_path = os.path.join("templates", template_filename)
        if not os.path.exists(template_path): raise HTTPException(status_code=404, detail=f"Template '{template_filename}' not found")
        
        with open(template_path, "r", encoding='utf-8') as f: latex_template = f.read()
        
        # --- NEW DYNAMIC SECTION GENERATION ---
        # Map section keys to their generator functions
        section_generators = {
            "scholasticAchievements": generate_scholastic_latex,
            "professionalExperience": generate_experience_latex,
            "keyProjects": generate_projects_latex,
            "positionsOfResponsibility": generate_por_latex,
            "extraCurriculars": generate_extracurricular_latex,
        }
        
        dynamic_content = ""
        # Iterate through the user-defined order from the frontend
        for section_key in resume_data.sectionOrder:
            if section_key in section_generators:
                # Get the corresponding data for that section (e.g., resume_data.professionalExperience)
                section_data = getattr(resume_data, section_key, [])
                # Call the generator function for that section
                section_latex = section_generators[section_key](section_data)
                if section_latex: # Only add if the section is not empty
                    dynamic_content += section_latex + "\n"

        # --- Smart Header Generation ---
        if "iitb" in resume_data.template_name.lower():
            header_latex = generate_iitb_header_latex(resume_data.personalDetails)
        else:
            header_latex = generate_universal_header_latex(resume_data.personalDetails)
        
        latex_template = latex_template.replace("__PERSONAL_DETAILS_SECTION__", header_latex)
        latex_template = latex_template.replace("__DYNAMIC_CONTENT_SECTION__", dynamic_content)
        
        session_id = str(uuid.uuid4())
        tex_filepath = f"{session_id}.tex"
        with open(tex_filepath, "w", encoding='utf-8') as f: f.write(latex_template)
        
        subprocess.run(['pdflatex', f'-output-directory=/app', '-interaction=nonstopmode', tex_filepath], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        process = subprocess.run(['pdflatex', f'-output-directory=/app', '-interaction=nonstopmode', tex_filepath], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        pdf_filepath = f"{session_id}.pdf"
        if not os.path.exists(pdf_filepath):
            log_filepath = f"{session_id}.log"
            log_content = "No log file found."
            if os.path.exists(log_filepath):
                with open(log_filepath, "r", encoding='utf-8') as log_file: log_content = log_file.read()
            raise Exception(f"PDF file was not created. LaTeX log: {log_content}")
            
        return FileResponse(pdf_filepath, media_type='application/pdf', filename="MyResume.pdf")
    except Exception as e:
        print("--- AN EXCEPTION OCCURRED IN generate_pdf ---"); traceback.print_exc(); print("-------------------------------------------")
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")

@app.post("/lengthen_text")
async def lengthen_text(request: AdjustTextRequest):
    try:
        if not request.text.strip(): raise HTTPException(status_code=400, detail="Text cannot be empty")
        prompt = generate_lengthen_prompt(request.text)
        response = model.generate_content(prompt)
        adjusted_text = response.text.strip().replace('**', '').replace('\n', ' ')
        return {"adjusted_text": adjusted_text}
    except Exception as e:
        print("--- AI LENGthen EXCEPTION ---"); traceback.print_exc(); print("-------------------------")
        raise HTTPException(status_code=500, detail=f"An error occurred with the AI model: {str(e)}")

@app.post("/shorten_text")
async def shorten_text(request: AdjustTextRequest):
    try:
        if not request.text.strip(): raise HTTPException(status_code=400, detail="Text cannot be empty")
        prompt = generate_shorten_prompt(request.text)
        response = model.generate_content(prompt)
        adjusted_text = response.text.strip().replace('**', '').replace('\n', ' ')
        return {"adjusted_text": adjusted_text}
    except Exception as e:
        print("--- AI SHORTEN EXCEPTION ---"); traceback.print_exc(); print("-------------------------")
        raise HTTPException(status_code=500, detail=f"An error occurred with the AI model: {str(e)}")

@app.post("/improve_text")
async def improve_text(request: ImproveTextRequest):
    try:
        if not request.text.strip(): raise HTTPException(status_code=400, detail="Text cannot be empty")
        prompt = generate_ai_prompt(request.text)
        response = model.generate_content(prompt)
        improved_text = response.text.strip().replace('**', '').replace('\n', ' ')
        return {"improved_text": improved_text}
    except Exception as e:
        print("--- AI ENDPOINT EXCEPTION OCCURRED ---"); traceback.print_exc(); print("------------------------------------")
        raise HTTPException(status_code=500, detail=f"An error occurred with the AI model: {str(e)}")

@app.post("/funnel/submit")
async def funnel_submit(data: FunnelSubmitData):
    try:
        # IMPORTANT: Replace with your actual Sheet Monkey Form URL
        SHEET_MONKEY_URL = "https://api.sheetmonkey.io/form/gqCdSvbbANq35GXCKyowj4"
        
        # We send the data as a JSON string to the "Resume Data" field we created
        payload = {
            "Resume Data": str(data.resumeData)
        }
        
        response = requests.post(SHEET_MONKEY_URL, json=payload)
        response.raise_for_status() # Raises an exception for bad status codes
        
        return {"status": "success"}
    except Exception as e:
        print(f"--- FUNNEL SUBMIT EXCEPTION ---: {e}")
        raise HTTPException(status_code=500, detail="Could not submit profile.")