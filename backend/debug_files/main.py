import subprocess
import uuid
import os
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

# --- Pydantic Models ---
class PersonalDetails(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    linkedin: str = ""
    github: str = ""

class Project(BaseModel):
    name: str = ""
    points: List[str] = []
    link: str = ""

class ResumeData(BaseModel):
    personalDetails: PersonalDetails
    projects: List[Project]

# --- FastAPI App ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate_pdf")
async def generate_pdf(resume_data: ResumeData):
    with open("templates/template.tex", "r") as f:
        latex_template = f.read()

    pd = resume_data.personalDetails
    latex_template = latex_template.replace("__NAME__", pd.name)
    latex_template = latex_template.replace("__EMAIL__", pd.email)
    latex_template = latex_template.replace("__PHONE__", pd.phone)
    latex_template = latex_template.replace("__LINKEDIN__", pd.linkedin)
    latex_template = latex_template.replace("__GITHUB__", pd.github)

    project_latex_block = "\\begin{itemize}[leftmargin=*]\n"
    for project in resume_data.projects:
        for point in project.points:
            sanitized_point = point.replace('&', '\\&').replace('%', '\\%').replace('$', '\\$')
            project_latex_block += f"  \\item {sanitized_point}\n"
    project_latex_block += "\\end{itemize}"
    latex_template = latex_template.replace("__PROJECTS_SECTION__", project_latex_block)
    
    session_id = str(uuid.uuid4())
    tex_filepath = f"{session_id}.tex"
    pdf_filepath = f"{session_id}.pdf"
    
    with open(tex_filepath, "w") as f:
        f.write(latex_template)

    process = subprocess.run(
        ['pdflatex', '-interaction=nonstopmode', tex_filepath],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )
    
    if not os.path.exists(pdf_filepath):
        print("PDF generation failed!")
        # Decode the error from bytes to a string and print it
        error_message = process.stderr.decode('utf-8', 'ignore')
        print("--- LaTeX Error ---")
        print(error_message)
        print("--------------------")
        return {"error": "PDF generation failed", "details": error_message}

    return FileResponse(pdf_filepath, media_type='application/pdf', filename="MyResume.pdf")
