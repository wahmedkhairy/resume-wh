
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
    // Get the ATS resume preview element
    const resumeElement = document.querySelector('[data-resume-preview]') as HTMLElement;
    
    if (!resumeElement) {
      const fallbackElement = document.querySelector('.ats-resume-container') || 
                             document.querySelector('.resume-container') ||
                             document.querySelector('[class*="resume"]');
      
      if (!fallbackElement) {
        throw new Error('ATS-Pro resume preview not found. Please ensure the resume is visible and try again.');
      }
    }

    const targetElement = resumeElement || document.querySelector('.ats-resume-container') as HTMLElement;

    console.log('Starting ATS-Pro PDF export...');

    // Temporarily hide watermark for export
    const watermark = document.querySelector('.watermark') as HTMLElement;
    const antiTheft = document.querySelector('[data-anti-theft]') as HTMLElement;
    
    const originalWatermarkDisplay = watermark?.style.display;
    const originalAntiTheftDisplay = antiTheft?.style.display;
    
    if (watermark) watermark.style.display = 'none';
    if (antiTheft) antiTheft.style.display = 'none';

    // Wait for DOM updates
    await new Promise(resolve => setTimeout(resolve, 300));

    // Create high-quality canvas for ATS compatibility
    const canvas = await html2canvas(targetElement, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: targetElement.scrollWidth || targetElement.offsetWidth,
      height: targetElement.scrollHeight || targetElement.offsetHeight,
      logging: false,
      onclone: (clonedDoc) => {
        // Remove watermarks and anti-theft elements in clone
        const clonedWatermark = clonedDoc.querySelector('.watermark');
        const clonedAntiTheft = clonedDoc.querySelector('[data-anti-theft]');
        if (clonedWatermark) clonedWatermark.remove();
        if (clonedAntiTheft) clonedAntiTheft.remove();
        
        // Ensure ATS-compatible fonts in clone
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((el: any) => {
          if (el.style) {
            // Force Arial for maximum ATS compatibility
            el.style.fontFamily = 'Arial, Helvetica, sans-serif';
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

    console.log('Canvas created for ATS-Pro template, generating PDF...');

    // Create ATS-optimized PDF
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: false // Better quality for ATS scanning
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calculate optimal scaling for ATS reading
    const ratio = Math.min(pdfWidth / (imgWidth * 0.264583), pdfHeight / (imgHeight * 0.264583));
    const scaledWidth = imgWidth * 0.264583 * ratio;
    const scaledHeight = imgHeight * 0.264583 * ratio;
    
    // Center on page
    const imgX = (pdfWidth - scaledWidth) / 2;
    const imgY = (pdfHeight - scaledHeight) / 2;

    pdf.addImage(imgData, 'PNG', imgX, imgY, scaledWidth, scaledHeight, '', 'FAST');
    
    // Generate ATS-friendly filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const name = data.personalInfo?.name?.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') || 'resume';
    const filename = `${name}_ATS_Pro_Resume_${timestamp}.pdf`;
    
    console.log('Saving ATS-Pro PDF:', filename);
    pdf.save(filename);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error exporting ATS-Pro resume:', error);
    throw new Error(`Failed to export ATS-Pro resume: ${error.message}`);
  }
};

// Export as plain text for maximum ATS compatibility
export const exportResumeAsText = (data: ExportData): void => {
  exportResumeAsPlainText(data);
};

// Export as ATS-optimized HTML
export const exportResumeAsHTML = (data: ExportData): void => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ATS-Pro Resume - ${data.personalInfo.name}</title>
        <style>
            /* ATS-Optimized CSS */
            body { 
              font-family: Arial, Helvetica, sans-serif; 
              margin: 0.5in; 
              line-height: 1.15; 
              color: #000; 
              font-size: 11pt;
              background: white;
            }
            h1 { 
              font-size: 16pt; 
              font-weight: bold; 
              margin: 0 0 8pt 0; 
              text-align: center; 
              color: #000; 
              text-transform: uppercase;
              letter-spacing: 1pt;
            }
            h2 { 
              font-size: 12pt; 
              font-weight: bold; 
              margin: 0 0 12pt 0; 
              text-transform: uppercase; 
              color: #000;
              border-bottom: 1pt solid #000;
              padding-bottom: 2pt;
            }
            .contact-info { 
              text-align: center;
              margin-bottom: 20pt; 
              color: #000; 
              line-height: 1.2; 
            }
            .job-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 4pt;
            }
            .job-title { 
              font-weight: bold; 
              color: #000; 
              margin: 0; 
            }
            .job-company { 
              color: #000; 
              margin: 2pt 0; 
            }
            .job-dates {
              font-weight: bold;
              color: #000;
            }
            ul { 
              margin: 6pt 0; 
              padding-left: 18pt; 
              list-style-type: disc;
            }
            li { 
              margin: 3pt 0; 
              color: #000; 
              line-height: 1.2; 
            }
            .education-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .cert-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 8pt;
            }
            .summary {
              text-align: justify;
              line-height: 1.3;
            }
        </style>
    </head>
    <body>
        <h1>${data.personalInfo.name || 'PROFESSIONAL RESUME'}</h1>
        ${data.personalInfo.jobTitle ? `<div style="text-align: center; margin: 0 0 12pt 0; font-size: 12pt;">${data.personalInfo.jobTitle}</div>` : ''}
        
        <div class="contact-info">
            ${[data.personalInfo.phone, data.personalInfo.email, data.personalInfo.location].filter(Boolean).join(' | ')}
        </div>
        
        ${data.summary ? `
        <h2>Professional Summary</h2>
        <div class="summary">${data.summary}</div>
        <br>
        ` : ''}
        
        ${data.workExperience.length > 0 ? `
        <h2>Professional Experience</h2>
        ${data.workExperience.map(job => `
            <div style="margin-bottom: 16pt;">
                <div class="job-header">
                    <div>
                        <div class="job-title">${job.jobTitle}</div>
                        <div class="job-company">${job.company}${job.location ? `, ${job.location}` : ''}</div>
                    </div>
                    <div class="job-dates">${job.startDate} - ${job.endDate}</div>
                </div>
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
                <div class="education-header">
                    <div>
                        <div class="job-title">${edu.degree}</div>
                        <div class="job-company">${edu.institution}${edu.location ? `, ${edu.location}` : ''}</div>
                        ${edu.gpa ? `<div style="margin: 2pt 0;">GPA: ${edu.gpa}</div>` : ''}
                    </div>
                    <div class="job-dates">${edu.graduationYear}</div>
                </div>
            </div>
        `).join('')}
        ` : ''}
        
        ${data.coursesAndCertifications.length > 0 ? `
        <h2>Certifications & Professional Development</h2>
        ${data.coursesAndCertifications.map(item => `
            <div class="cert-header">
                <div>
                    <div class="job-title">${item.title}</div>
                    <div class="job-company">${item.provider}</div>
                    ${item.description ? `<div style="font-style: italic; font-size: 10pt; margin: 2pt 0;">${item.description}</div>` : ''}
                </div>
                <div class="job-dates">${item.date}</div>
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
  a.download = `${data.personalInfo.name?.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') || 'resume'}_ATS_Pro_Resume.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
