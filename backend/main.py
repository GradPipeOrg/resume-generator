# main.py (Final Definitive Version)
import subprocess
import uuid
import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
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

def generate_ai_prompt(text: str) -> str:
    example_1 = "Engineered the MVP, an AI agent on n8n, automating resume data extraction via Google Gemini and OCR API's"
    example_2 = "Trained a predictive FinBERT NLP model to predict stock trends from 25,000+ news articles, reaching 73% accuracy"
    example_3 = "Managed the estate vertical solely and was overseeing an annual amenities budget of INR 1M+ for new initiatives"
    return f"""
    You are an expert resume writing assistant for students at a top-tier engineering college like an IIT in India.
    Your task is to take a user-written bullet point and rewrite it to match the high-quality, dense, and metric-driven style of the examples provided.
    Follow these rules strictly:
    1. Start with a strong, impressive action verb.
    2. Use the STAR (Situation, Task, Action, Result) method. Focus on quantifiable results.
    3. Keep the tone highly professional and concise.
    4. Do not use personal pronouns like "I" or "we".
    5. Do not use any Markdown formatting.
    6. CRITICAL RULE: The final output must be a single, unbroken line of text.
    User Text: "{text}"
    Perfect Output:
    """

# --- Pydantic Models ---
class PersonalDetails(BaseModel): name: str = ""; branch: str = ""; roll_no: str = ""; cpi: str = ""; dob: str = ""; gender: str = ""
class ScholasticAchievement(BaseModel): percentile: str = ""; exam_name: str = ""; num_candidates: str = ""; year: str = ""
class Experience(BaseModel): company: str = ""; role: str = ""; dates: str = ""; points: List[str] = []
class Project(BaseModel): name: str = ""; subtitle: str = ""; dates: str = ""; points: List[str] = []
class Responsibility(BaseModel): role: str = ""; organization: str = ""; dates: str = ""; description: str = ""; points: List[str] = []

class ResumeData(BaseModel):
    template_name: str
    personalDetails: PersonalDetails
    scholasticAchievements: List[ScholasticAchievement]
    professionalExperience: List[Experience]
    keyProjects: List[Project]
    positionsOfResponsibility: List[Responsibility]

def sanitize(text: str) -> str:
    replacements = {'&': r'\&', '%': r'\%', '$': r'\$', '#': r'\#', '_': r'\_', '{': r'\{', '}': r'\}', '[': r'{[}', ']': r'{]}', '~': r'\textasciitilde{}', '^': r'\textasciicircum{}', '\\': r'\textbackslash{}'}
    for char, replacement in replacements.items(): text = text.replace(char, replacement)
    return text

# --- FINAL, PERFECTED LaTeX Generation Functions ---
def generate_personal_details_latex(details: PersonalDetails, logo_path: str) -> str:
    # This function now perfectly replicates the header from the reference image.
    return f"""
\\begin{{tabular*}}{{\\textwidth}}{{l@{{\\extracolsep{{\\fill}}}}r}}
    \\raisebox{{-0.25\\height}}{{\\includegraphics[height=1.5cm]{{{logo_path}}}}} &
    \\begin{{tabular}}[b]{{l}}
        \\textbf{{\\Large {sanitize(details.name)}}} \\\\
        {sanitize(details.branch)} \\\\
        Indian Institute of Technology Bombay
    \\end{{tabular}} &
    \\begin{{tabular}}[b]{{l}}
        \\textbf{{{sanitize(details.roll_no)}}} \\\\
        B.Tech \\\\
        Gender: {sanitize(details.gender)} \\\\
        DOB: {sanitize(details.dob)}
    \\end{{tabular}}
\\end{{tabular*}}
\\vspace{{2mm}}
\\begin{{tabular*}}{{\\textwidth}}{{@{{\\extracolsep{{\\fill}}}}lrlr}}
    \\hline
    \\textbf{{Examination}} & \\textbf{{University}} & \\textbf{{Institute}} & \\textbf{{Year}} & \\textbf{{CPI / \%}} \\\\ \\hline
    Graduation & IIT Bombay & IIT Bombay & 2027 & {sanitize(details.cpi)} \\\\ \\hline
\\end{{tabular*}}
"""

def generate_scholastic_latex(achievements: List[ScholasticAchievement]) -> str:
    # This function is now corrected to build the text from structured data.
    items = "".join([f"    \\item\\textls[10]{{Among the top \\textbf{{{sanitize(ach.percentile)}}} percentile in \\textbf{{{sanitize(ach.exam_name)}}} examination out of \\textbf{{{sanitize(ach.num_candidates)}}} million candidates all over India\\hfill{{\\sl \\small [{sanitize(ach.year)}]}}}}\n" for ach in achievements])
    return f"\\begin{{itemize}}[itemsep=-0.8mm,leftmargin=*]\n{items}\\end{{itemize}}"

def generate_experience_latex(experiences: List[Experience]) -> str:
    # This function has corrected spacing logic.
    latex_string = ""
    for exp in experiences:
        # Using double braces {{...}} to protect the content of \textls, making it more robust
        points_latex = "".join([f"    \\item\\textls[5]{{{{{sanitize(point)}}}}}\n" for point in exp.points if point.strip()])
        latex_string += f"""
\\noindent \\textbf{{\\large {sanitize(exp.company)}}}
| \\textbf{{\\large   {sanitize(exp.role)}}}
\\hfill{{\\textit{{{sanitize(exp.dates)}}}}}
\\vspace{{-3mm}}
\\\\ \\rule{{\\textwidth}}{{0.2mm}}
\\vspace{{-6.2mm}}
\\begin{{itemize}}[itemsep=0mm, leftmargin=6mm]
{points_latex}\\end{{itemize}}
"""
    # Add final spacing after the last experience item
    if experiences: latex_string += "\\vspace{-6mm}\n"
    return latex_string

def generate_projects_latex(projects: List[Project]) -> str:
    latex_string = ""
    for i, proj in enumerate(projects):
        if i > 0: latex_string += "\\vspace{-0.5mm}\n"
        points_latex = "".join([f"    \\item\\textls[5]{{{{{sanitize(point)}}}}}\n" for point in proj.points if point.strip()])
        latex_string += f"""
\\noindent \\textbf{{\\large {sanitize(proj.name)}}}
\\textit{{| {sanitize(proj.subtitle)} }}
\\hfill{{\\textit{{{sanitize(proj.dates)}}}}}
\\vspace{{-3mm}}
\\\\ \\rule{{\\textwidth}}{{0.2mm}}
\\vspace{{-6.2mm}}
\\begin{{itemize}}[itemsep=0mm, leftmargin=6mm]
{points_latex}\\end{{itemize}}
"""
    return latex_string

def generate_por_latex(pors: List[Responsibility]) -> str:
    latex_string = ""
    for i, por in enumerate(pors):
        if i > 0: latex_string += "\\vspace{-0.5mm}\n"
        points_latex = "".join([f"    \\item\\textls[5]{{{{{sanitize(point)}}}}}\n" for point in por.points if point.strip()])
        latex_string += f"""
\\noindent \\textbf{{\\large {sanitize(por.role)}}} | {sanitize(por.organization)} \\hfill{{\\textit{{{sanitize(por.dates)}}}}} 
\\vspace{{-3mm}}
\\\\ \\rule{{\\textwidth}}{{0.2mm}}
\\vspace{{-1.5mm}}
\\textit{{{sanitize(por.description)}}}
\\vspace{{-1mm}}
\\begin{{itemize}}[itemsep=0mm, leftmargin=6mm]
{points_latex}\\end{{itemize}}
"""
    return latex_string

# --- FastAPI App ---
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://resume-generator-chi-eosin.vercel.app" ], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.post("/generate_pdf")
async def generate_pdf(resume_data: ResumeData):
    iitb_logo_path = "iitb_logo.png"
    final_iitb_logo_path = os.path.join("/app", iitb_logo_path).replace("\\", "/")
    try:
        template_filename = resume_data.template_name
        if '..' in template_filename: raise HTTPException(status_code=400, detail="Invalid template name")
        template_path = os.path.join("templates", template_filename)
        if not os.path.exists(template_path): raise HTTPException(status_code=404, detail=f"Template '{template_filename}' not found")
        
        with open(template_path, "r", encoding='utf-8') as f: latex_template = f.read()
        
        latex_template = latex_template.replace("__PERSONAL_DETAILS_SECTION__", generate_personal_details_latex(resume_data.personalDetails, final_iitb_logo_path))
        latex_template = latex_template.replace("__SCHOLASTIC_ACHIEVEMENTS_SECTION__", generate_scholastic_latex(resume_data.scholasticAchievements))
        latex_template = latex_template.replace("__PROFESSIONAL_EXPERIENCE_SECTION__", generate_experience_latex(resume_data.professionalExperience))
        latex_template = latex_template.replace("__KEY_PROJECTS_SECTION__", generate_projects_latex(resume_data.keyProjects))
        latex_template = latex_template.replace("__POSITIONS_OF_RESPONSIBILITY_SECTION__", generate_por_latex(resume_data.positionsOfResponsibility))
        
        session_id = str(uuid.uuid4())
        tex_filepath = f"{session_id}.tex"
        with open(tex_filepath, "w", encoding='utf-8') as f: f.write(latex_template)
        
        # Run pdflatex twice to ensure all references and layouts are correct
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