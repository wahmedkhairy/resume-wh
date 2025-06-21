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
    console.log('Starting PDF export with data:', data);
    
    // Dynamic import to avoid build issues
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).jsPDF;
    
    // Get the resume preview element - try multiple selectors
    let resumeElement = document.querySelector('[data-resume-preview]') as HTMLElement;
    
    if (!resumeElement) {
      // Try alternative selectors
      resumeElement = document.querySelector('.resume-container') as HTMLElement || 
                    document.querySelector('[class*="resume"]') as HTMLElement ||
                    document.querySelector('.ClassicResumePreview') as HTMLElement;
    }
    
    if (!resumeElement) {
      console.error('Resume preview element not found');
      throw new Error('Resume preview not found. Please ensure the resume is visible and try again.');
    }

    console.log('Found resume element:', resumeElement);

    // Temporarily hide watermark and anti-theft for export
    const watermark = document.querySelector('.watermark') as HTMLElement;
    const antiTheft = document.querySelector('[data-anti-theft]') as HTMLElement;
    
    const originalWatermarkDisplay = watermark?.style.display;
    const originalAntiTheftDisplay = antiTheft?.style.display;
    
    if (watermark) {
      console.log('Hiding watermark for export');
      watermark.style.display = 'none';
    }
    if (antiTheft) {
      console.log('Hiding anti-theft for export');
      antiTheft.style.display = 'none';
    }

    // Wait for DOM updates
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create canvas with optimized settings
    console.log('Creating canvas...');
    const canvas = await html2canvas(resumeElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        // Remove watermarks and anti-theft elements in clone
        const clonedWatermark = clonedDoc.querySelector('.watermark');
        const clonedAntiTheft = clonedDoc.querySelector('[data-anti-theft]');
        if (clonedWatermark) clonedWatermark.remove();
        if (clonedAntiTheft) clonedAntiTheft.remove();
      }
    });

    // Restore original display styles immediately
    if (watermark && originalWatermarkDisplay !== undefined) {
      watermark.style.display = originalWatermarkDisplay;
    }
    if (antiTheft && originalAntiTheftDisplay !== undefined) {
      antiTheft.style.display = originalAntiTheftDisplay;
    }

    console.log('Canvas created successfully, dimensions:', canvas.width, 'x', canvas.height);

    // Create PDF
    const imgData = canvas.toDataURL('image/png', 0.92);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calculate optimal scaling
    const ratio = Math.min(pdfWidth / (imgWidth * 0.264583), pdfHeight / (imgHeight * 0.264583));
    const scaledWidth = imgWidth * 0.264583 * ratio;
    const scaledHeight = imgHeight * 0.264583 * ratio;
    
    // Center on page
    const imgX = (pdfWidth - scaledWidth) / 2;
    const imgY = (pdfHeight - scaledHeight) / 2;

    pdf.addImage(imgData, 'PNG', imgX, imgY, scaledWidth, scaledHeight);
    
    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const name = data.personalInfo?.name?.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') || 'resume';
    const filename = `${name}_Resume_${timestamp}.pdf`;
    
    console.log('Saving PDF:', filename);
    pdf.save(filename);
    
    console.log('PDF export completed successfully');
  } catch (error) {
    console.error('Error exporting resume:', error);
    throw new Error(`Failed to export resume: ${error.message}`);
  }
};

// Export as Word
export const exportResumeAsWord = async (data: ExportData): Promise<void> => {
  try {
    console.log('Starting Word export with data:', data);
    const { exportResumeAsWord: exportWordFunction } = await import('./wordExport');
    return exportWordFunction(data);
  } catch (error) {
    console.error('Error exporting Word document:', error);
    throw new Error(`Failed to export Word document: ${error.message}`);
  }
};

// Export as plain text
export const exportResumeAsText = (data: ExportData): void => {
  exportResumeAsPlainText(data);
};

// Export as HTML
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
              font-family: Times, "Times New Roman", serif; 
              margin: 1in; 
              line-height: 1.4; 
              color: #000; 
              font-size: 12pt;
              background: white;
            }
            h1 { 
              font-size: 18pt; 
              font-weight: bold; 
              margin: 0 0 8pt 0; 
              text-align: center; 
              color: #000; 
              text-transform: uppercase;
              letter-spacing: 2pt;
            }
            h2 { 
              font-size: 14pt; 
              font-weight: bold; 
              margin: 0 0 16pt 0; 
              text-transform: uppercase; 
              color: #000;
              text-align: center;
              letter-spacing: 1pt;
            }
            .contact-info { 
              text-align: center;
              margin-bottom: 24pt; 
              color: #000; 
              line-height: 1.2; 
            }
            .job-title { 
              font-size: 14pt;
              font-style: italic;
              margin: 0 0 12pt 0;
              text-align: center;
            }
            .job-header {
              margin-bottom: 8pt;
            }
            .job-name { 
              font-weight: bold; 
              color: #000; 
              margin: 0 0 2pt 0; 
            }
            .job-company { 
              color: #000; 
              margin: 2pt 0;
              font-style: italic; 
            }
            .job-description {
              font-style: italic;
              margin: 0 0 8pt 0;
              line-height: 1.4;
            }
            ul { 
              margin: 0; 
              padding-left: 20pt; 
              list-style-type: disc;
            }
            li { 
              margin: 4pt 0; 
              color: #000; 
              line-height: 1.4; 
            }
            .education-item {
              margin-bottom: 12pt;
            }
            .education-title {
              font-weight: bold;
              text-transform: uppercase;
            }
            .cert-item {
              margin-bottom: 8pt;
            }
            .cert-title {
              font-weight: bold;
              text-transform: uppercase;
            }
            .summary {
              text-align: justify;
              line-height: 1.5;
              font-style: italic;
              margin-bottom: 24pt;
            }
        </style>
    </head>
    <body>
        <h1>${data.personalInfo.name || 'NAME'}</h1>
        ${data.personalInfo.jobTitle ? `<div class="job-title">${data.personalInfo.jobTitle}</div>` : ''}
        
        <div class="contact-info">
            ${[data.personalInfo.location, data.personalInfo.email, data.personalInfo.phone].filter(Boolean).join(' | ')}
        </div>
        
        ${data.summary ? `
        <div class="summary">${data.summary}</div>
        ` : ''}
        
        ${data.workExperience.length > 0 ? `
        <h2>Work Experience</h2>
        ${data.workExperience.map(job => `
            <div style="margin-bottom: 20pt;">
                <div class="job-header">
                    <div class="job-name">${job.jobTitle} - ${job.startDate} to ${job.endDate}</div>
                    <div class="job-company">${job.company}${job.location ? `, ${job.location}` : ''}</div>
                    <div class="job-description">Briefly describe what the company does as well as the purpose of your role.</div>
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
            <div class="education-item">
                <div class="education-title">${edu.degree} / ${edu.institution} / ${edu.graduationYear}</div>
                ${edu.gpa ? `<div style="margin: 2pt 0 0 0;">GPA: ${edu.gpa}</div>` : ''}
            </div>
        `).join('')}
        ` : ''}
        
        ${data.coursesAndCertifications.length > 0 ? `
        <h2>Training or Certification</h2>
        ${data.coursesAndCertifications.map(item => `
            <div class="cert-item">
                <div class="cert-title">${item.title} / ${item.provider} / ${item.date}</div>
                ${item.description ? `<div style="font-style: italic; margin: 2pt 0;">${item.description}</div>` : ''}
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
  a.download = `${data.personalInfo.name?.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') || 'resume'}_Resume.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
