import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { exportResumeAsPlainText } from './textExport';

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

    // Create canvas from the resume element with better options for ATS-Pro template
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
        
        // Ensure ATS-Pro template fonts are properly rendered
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((el: any) => {
          if (el.style) {
            el.style.fontFamily = 'Times New Roman, serif';
          }
        });
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

    // Create PDF with proper sizing for ATS compatibility
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
    const filename = `${name}_ATS_Pro_${timestamp}.pdf`;
    
    console.log('Saving PDF:', filename);
    pdf.save(filename);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error exporting resume:', error);
    throw new Error(`Failed to export resume: ${error.message}`);
  }
};

// Export as plain text for ATS compatibility
export const exportResumeAsText = (data: ExportData): void => {
  exportResumeAsPlainText(data);
};

// Alternative export as HTML (keeping existing functionality)
export const exportResumeAsHTML = (data: ExportData): void => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resume - ${data.personalInfo.name}</title>
        <style>
            body { 
              font-family: 'Times New Roman', serif; 
              margin: 20px; 
              line-height: 1.25; 
              color: #000; 
              font-size: 11pt;
            }
            h1 { 
              font-size: 14pt; 
              font-weight: bold; 
              margin: 0 0 4pt 0; 
              text-align: left; 
              color: #000; 
            }
            h2 { 
              font-size: 13pt; 
              font-weight: bold; 
              margin: 12pt 0 8pt 0; 
              text-transform: uppercase; 
              letter-spacing: 0.5pt; 
              color: #000; 
            }
            .contact-info { 
              margin-bottom: 12pt; 
              color: #000; 
              line-height: 1.2; 
            }
            .job-title { 
              font-weight: bold; 
              color: #000; 
              margin: 0; 
            }
            .job-meta { 
              color: #000; 
              margin: 2pt 0; 
            }
            ul { 
              margin: 6pt 0; 
              padding-left: 0; 
              list-style: none; 
            }
            li { 
              margin: 3pt 0; 
              color: #000; 
              line-height: 1.3; 
            }
            li:before { 
              content: "• "; 
              color: #000; 
            }
        </style>
    </head>
    <body>
        <h1>${data.personalInfo.name || 'Professional Resume'}</h1>
        ${data.personalInfo.jobTitle ? `<div style="margin: 0 0 8pt 0;">${data.personalInfo.jobTitle}</div>` : ''}
        
        <div class="contact-info">
            ${data.personalInfo.phone ? `<div>${data.personalInfo.phone}</div>` : ''}
            ${data.personalInfo.email ? `<div>${data.personalInfo.email}</div>` : ''}
            ${data.personalInfo.location ? `<div>${data.personalInfo.location}</div>` : ''}
        </div>
        
        ${data.summary ? `
        <h2>Professional Summary</h2>
        <p style="margin: 0 0 12pt 0; line-height: 1.4;">${data.summary}</p>
        ` : ''}
        
        ${data.workExperience.length > 0 ? `
        <h2>Professional Experience</h2>
        ${data.workExperience.map(job => `
            <div style="margin-bottom: 16pt;">
                <div class="job-title">${job.jobTitle}</div>
                <div class="job-meta">${job.company}${job.location ? `, ${job.location}` : ''}</div>
                <div class="job-meta">${job.startDate} - ${job.endDate}</div>
                <ul>
                    ${job.responsibilities.filter((r: string) => r.trim()).map((responsibility: string) => `
                        <li>${responsibility}</li>
                    `).join('')}
                </ul>
            </div>
        `).join('')}
        ` : ''}
        
        ${data.education.length > 0 ? `
        <h2>Education</h2>
        ${data.education.map(edu => `
            <div style="margin-bottom: 12pt;">
                <div class="job-title">${edu.degree}</div>
                <div class="job-meta">${edu.institution}${edu.location ? `, ${edu.location}` : ''}</div>
                <div class="job-meta">${edu.graduationYear}</div>
                ${edu.gpa ? `<div class="job-meta">GPA: ${edu.gpa}</div>` : ''}
            </div>
        `).join('')}
        ` : ''}
        
        ${data.coursesAndCertifications.length > 0 ? `
        <h2>Courses & Certifications</h2>
        ${data.coursesAndCertifications.map(item => `
            <div style="margin-bottom: 8pt;">
                <div>${item.title} - ${item.provider} (${item.date})</div>
                ${item.description ? `<div style="margin-top: 2pt;">${item.description}</div>` : ''}
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
  a.download = `${data.personalInfo.name?.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') || 'resume'}_ATS_Pro.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
