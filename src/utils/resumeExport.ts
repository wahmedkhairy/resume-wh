
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportData {
  personalInfo: any;
  summary: string;
  workExperience: any[];
  education: any[];
  skills: any[];
  coursesAndCertifications: any[];
}

export const exportResumeToPDF = async (data: ExportData): Promise<void> => {
  try {
    // Get the resume preview element with better selector
    const resumeElement = document.querySelector('[data-resume-preview]') as HTMLElement;
    
    if (!resumeElement) {
      // Fallback selectors
      const fallbackElement = document.querySelector('.resume-container') || 
                             document.querySelector('.resume-preview') ||
                             document.querySelector('[class*="resume"]');
      
      if (!fallbackElement) {
        throw new Error('Resume preview not found. Please ensure the resume is visible on screen and try again.');
      }
    }

    const targetElement = resumeElement || document.querySelector('.resume-container') as HTMLElement;

    console.log('Starting PDF export...');

    // Temporarily hide watermark and anti-theft protection for export
    const watermark = document.querySelector('.watermark') as HTMLElement;
    const antiTheft = document.querySelector('[data-anti-theft]') as HTMLElement;
    
    const originalWatermarkDisplay = watermark?.style.display;
    const originalAntiTheftDisplay = antiTheft?.style.display;
    
    if (watermark) {
      watermark.style.display = 'none';
    }
    if (antiTheft) {
      antiTheft.style.display = 'none';
    }

    // Wait a moment for DOM to update
    await new Promise(resolve => setTimeout(resolve, 200));

    // Create canvas from the resume element with better options
    const canvas = await html2canvas(targetElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: targetElement.scrollWidth || targetElement.offsetWidth,
      height: targetElement.scrollHeight || targetElement.offsetHeight,
      logging: false,
      onclone: (clonedDoc) => {
        // Remove any remaining watermarks or anti-theft elements in the clone
        const clonedWatermark = clonedDoc.querySelector('.watermark');
        const clonedAntiTheft = clonedDoc.querySelector('[data-anti-theft]');
        if (clonedWatermark) clonedWatermark.remove();
        if (clonedAntiTheft) clonedAntiTheft.remove();
      }
    });

    // Restore original display styles
    if (watermark && originalWatermarkDisplay !== undefined) {
      watermark.style.display = originalWatermarkDisplay;
    }
    if (antiTheft && originalAntiTheftDisplay !== undefined) {
      antiTheft.style.display = originalAntiTheftDisplay;
    }

    console.log('Canvas created, generating PDF...');

    // Create PDF with proper sizing
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calculate scaling to fit the page while maintaining aspect ratio
    const ratio = Math.min(pdfWidth / (imgWidth * 0.264583), pdfHeight / (imgHeight * 0.264583));
    const scaledWidth = imgWidth * 0.264583 * ratio;
    const scaledHeight = imgHeight * 0.264583 * ratio;
    
    // Center the image on the page
    const imgX = (pdfWidth - scaledWidth) / 2;
    const imgY = (pdfHeight - scaledHeight) / 2;

    pdf.addImage(imgData, 'PNG', imgX, imgY, scaledWidth, scaledHeight);
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const name = data.personalInfo?.name?.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') || 'resume';
    const filename = `${name}_resume_${timestamp}.pdf`;
    
    console.log('Saving PDF:', filename);
    pdf.save(filename);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error exporting resume:', error);
    throw new Error(`Failed to export resume: ${error.message}`);
  }
};

// Alternative export as HTML
export const exportResumeAsHTML = (data: ExportData): void => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resume - ${data.personalInfo.name}</title>
        <style>
            body { font-family: Georgia, serif; margin: 20px; line-height: 1.6; color: #333; }
            h1 { text-align: center; margin-bottom: 10px; color: #2c3e50; }
            h2 { border-bottom: 2px solid #3498db; padding-bottom: 5px; margin-top: 20px; color: #2c3e50; }
            .contact-info { text-align: center; margin-bottom: 20px; color: #7f8c8d; }
            .skill-item { margin: 8px 0; }
            .skill-bar { background: #ecf0f1; height: 8px; margin: 4px 0; border-radius: 4px; overflow: hidden; }
            .skill-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; }
            .skill-fill.high { background: linear-gradient(90deg, #27ae60, #2ecc71); }
            .skill-fill.medium { background: linear-gradient(90deg, #2980b9, #3498db); }
            .skill-fill.low { background: linear-gradient(90deg, #f39c12, #e67e22); }
            ul { margin: 10px 0; padding-left: 25px; }
            li { margin: 4px 0; }
            .job-header { margin-bottom: 8px; }
            .job-title { font-weight: bold; color: #2c3e50; }
            .job-meta { color: #7f8c8d; font-style: italic; font-size: 0.9em; }
        </style>
    </head>
    <body>
        <h1>${data.personalInfo.name || 'Professional Resume'}</h1>
        <div class="contact-info">
            ${data.personalInfo.jobTitle ? `${data.personalInfo.jobTitle}<br>` : ''}
            ${data.personalInfo.location ? `${data.personalInfo.location}<br>` : ''}
            ${data.personalInfo.email ? `${data.personalInfo.email}<br>` : ''}
            ${data.personalInfo.phone ? `${data.personalInfo.phone}` : ''}
        </div>
        
        ${data.summary ? `
        <h2>Professional Summary</h2>
        <p>${data.summary}</p>
        ` : ''}
        
        ${data.workExperience.length > 0 ? `
        <h2>Professional Experience</h2>
        ${data.workExperience.map(job => `
            <div class="job-header">
                <div class="job-title">${job.jobTitle} - ${job.company}</div>
                <div class="job-meta">${job.startDate} - ${job.endDate} | ${job.location}</div>
            </div>
            <ul>
                ${job.responsibilities.filter((r: string) => r.trim()).map((responsibility: string) => `
                    <li>${responsibility}</li>
                `).join('')}
            </ul>
        `).join('')}
        ` : ''}
        
        ${data.skills.length > 0 ? `
        <h2>Skills</h2>
        ${data.skills.map(skill => `
            <div class="skill-item">
                <strong>${skill.name}</strong>
                <div class="skill-bar">
                    <div class="skill-fill ${skill.level >= 80 ? 'high' : skill.level >= 60 ? 'medium' : 'low'}" 
                         style="width: ${skill.level}%"></div>
                </div>
            </div>
        `).join('')}
        ` : ''}
        
        ${data.education.length > 0 ? `
        <h2>Education</h2>
        ${data.education.map(edu => `
            <div class="job-header">
                <div class="job-title">${edu.degree}</div>
                <div class="job-meta">${edu.institution} - ${edu.graduationYear}${edu.location ? ` | ${edu.location}` : ''}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
            </div>
        `).join('')}
        ` : ''}
        
        ${data.coursesAndCertifications.length > 0 ? `
        <h2>Courses & Certifications</h2>
        ${data.coursesAndCertifications.map(item => `
            <div class="job-header">
                <div class="job-title">${item.title}</div>
                <div class="job-meta">${item.provider} - ${item.date}</div>
                ${item.description ? `<p>${item.description}</p>` : ''}
            </div>
        `).join('')}
        ` : ''}
    </body>
    </html>
  `;
  
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.personalInfo.name?.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') || 'resume'}_resume.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
