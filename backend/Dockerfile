# Start from an official Python image
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Install TeX Live. This is the magic step.
# It installs a clean version inside our Linux environment.
RUN apt-get update && apt-get install -y \
    texlive-latex-base \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    lmodern \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*
# Copy the requirements file and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code into the container
COPY . .

# Tell Docker to expose port 8000 to the outside world
EXPOSE 8000

# Default model can be overridden at runtime
ENV GEMINI_MODEL_NAME=gemini-2.5-flash

# The command to run when the container starts
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]