
import { exportResumeAsPlainText } from './textExport';

export interface ExportData {
  personalInfo: any;
  summary: string;
  workExperience: any[];
  education: any[];
  skills: any[];
  coursesAndCertifications: any[];
}

// Helper function to wait for DOM to be ready
const waitForDOM = (ms: number = 100): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper function to find resume element with multiple fallback strategies
const findResumeElement = (): HTMLElement | null => {
  console.log('Searching for resume element...');
  
  // Strategy 1: Look for data-resume-preview attribute
  let element = document.querySelector('[data-resume-preview]') as HTMLElement;
  if (element) {
    console.log('Found resume element with data-resume-preview');
    return element;
  }
  
  // Strategy 2: Look for ClassicResumePreview class
  element = document.querySelector('.ClassicResumePreview') as HTMLElement;
  if (element) {
    console.log('Found resume element with ClassicResumePreview class');
    return element;
  }
  
  // Strategy 3: Look for any element containing resume content
  element = document.querySelector('[class*="resume"]') as HTMLElement;
  if (element) {
    console.log('Found resume element with resume in class name');
    return element;
  }
  
  // Strategy 4: Look for the parent container
  element = document.querySelector('.border.rounded-lg.bg-white') as HTMLElement;
  if (element) {
    console.log('Found resume element by border styling');
    return element;
  }
  
  console.error('No resume element found');
  return null;
};

export const exportResumeToPDF = async (data: ExportData): Promise<void> => {
  console.log('=== Starting PDF Export ===');
  console.log('Export data received:', data);
  
  try {
    // Validate input data
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid export data provided');
    }
    
    // Wait for DOM to be ready
    await waitForDOM(200);
    
    // Find the resume element
    const resumeElement = findResumeElement();
    if (!resumeElement) {
      throw new Error('Resume preview element not found. Please ensure the resume is visible on the page.');
    }
    
    console.log('Resume element found:', resumeElement);
    console.log('Element dimensions:', {
      width: resumeElement.offsetWidth,
      height: resumeElement.offsetHeight,
      visible: resumeElement.offsetParent !== null
    });
    
    // Check if element is visible
    if (resumeElement.offsetParent === null) {
      throw new Error('Resume element is not visible. Please ensure the resume preview is displayed.');
    }
    
    // Dynamically import required libraries
    console.log('Loading html2canvas and jsPDF...');
    const [html2canvasModule, jsPDFModule] = await Promise.all([
      import('html2canvas'),
      import('jspdf')
    ]);
    
    const html2canvas = html2canvasModule.default;
    const { jsPDF } = jsPDFModule;
    
    console.log('Libraries loaded successfully');
    
    // Hide watermarks and anti-theft elements temporarily
    const elementsToHide = [
      '.watermark',
      '[data-anti-theft]',
      '.anti-theft',
      '[class*="watermark"]'
    ];
    
    const hiddenElements: Array<{element: HTMLElement, originalDisplay: string}> = [];
    
    elementsToHide.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const htmlEl = el as HTMLElement;
        hiddenElements.push({
          element: htmlEl,
          originalDisplay: htmlEl.style.display
        });
        htmlEl.style.display = 'none';
      });
    });
    
    console.log(`Hidden ${hiddenElements.length} overlay elements`);
    
    // Wait for style changes to take effect
    await waitForDOM(100);
    
    // Create canvas with optimized settings
    console.log('Creating canvas from element...');
    const canvas = await html2canvas(resumeElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: resumeElement.offsetWidth,
      height: resumeElement.offsetHeight,
      onclone: (clonedDoc) => {
        console.log('Cloning document for canvas...');
        // Remove overlay elements in cloned document
        elementsToHide.forEach(selector => {
          const elements = clonedDoc.querySelectorAll(selector);
          elements.forEach(el => el.remove());
        });
      }
    });
    
    // Restore hidden elements immediately
    hiddenElements.forEach(({ element, originalDisplay }) => {
      element.style.display = originalDisplay;
    });
    
    console.log('Canvas created successfully:', {
      width: canvas.width,
      height: canvas.height
    });
    
    // Validate canvas
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Generated canvas has invalid dimensions');
    }
    
    // Create PDF
    console.log('Creating PDF document...');
    const imgData = canvas.toDataURL('image/png', 0.95);
    
    if (!imgData || imgData === 'data:,') {
      throw new Error('Failed to generate image data from canvas');
    }
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // Calculate optimal scaling for A4
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgAspectRatio = canvas.width / canvas.height;
    const pdfAspectRatio = pdfWidth / pdfHeight;
    
    let finalWidth, finalHeight;
    
    if (imgAspectRatio > pdfAspectRatio) {
      // Image is wider - fit to width
      finalWidth = pdfWidth - 20; // 10mm margin on each side
      finalHeight = finalWidth / imgAspectRatio;
    } else {
      // Image is taller - fit to height
      finalHeight = pdfHeight - 20; // 10mm margin top/bottom
      finalWidth = finalHeight * imgAspectRatio;
    }
    
    // Center the image
    const x = (pdfWidth - finalWidth) / 2;
    const y = (pdfHeight - finalHeight) / 2;
    
    pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight, undefined, 'FAST');
    
    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const nameFromData = data.personalInfo?.name || '';
    const safeName = nameFromData
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30) || 'resume';
    
    const filename = `${safeName}_Resume_${timestamp}.pdf`;
    
    console.log('Saving PDF with filename:', filename);
    
    // Save the PDF
    pdf.save(filename);
    
    console.log('=== PDF Export Completed Successfully ===');
    
  } catch (error) {
    console.error('=== PDF Export Failed ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Ensure hidden elements are restored even on error
    const elementsToRestore = document.querySelectorAll('[style*="display: none"]');
    elementsToRestore.forEach(el => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.style.display === 'none') {
        htmlEl.style.display = '';
      }
    });
    
    throw new Error(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Export as Word
export const exportResumeAsWord = async (data: ExportData): Promise<void> => {
  console.log('=== Starting Word Export ===');
  console.log('Export data received:', data);
  
  try {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid export data provided');
    }
    
    const { exportResumeAsWord: exportWordFunction } = await import('./wordExport');
    await exportWordFunction(data);
    
    console.log('=== Word Export Completed Successfully ===');
  } catch (error) {
    console.error('=== Word Export Failed ===');
    console.error('Error details:', error);
    throw new Error(`Word export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Export as plain text
export const exportResumeAsText = (data: ExportData): void => {
  console.log('=== Starting Text Export ===');
  try {
    exportResumeAsPlainText(data);
    console.log('=== Text Export Completed Successfully ===');
  } catch (error) {
    console.error('=== Text Export Failed ===');
    console.error('Error details:', error);
    throw new Error(`Text export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Export as HTML  
export const exportResumeAsHTML = (data: ExportData): void => {
  console.log('=== Starting HTML Export ===');
  try {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid export data provided');
    }
    
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resume - ${data.personalInfo?.name || 'Professional Resume'}</title>
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
        <h1>${data.personalInfo?.name || 'NAME'}</h1>
        ${data.personalInfo?.jobTitle ? `<div class="job-title">${data.personalInfo.jobTitle}</div>` : ''}
        
        <div class="contact-info">
            ${[data.personalInfo?.location, data.personalInfo?.email, data.personalInfo?.phone].filter(Boolean).join(' | ')}
        </div>
        
        ${data.summary ? `
        <div class="summary">${data.summary}</div>
        ` : ''}
        
        ${data.workExperience?.length > 0 ? `
        <h2>Work Experience</h2>
        ${data.workExperience.map(job => `
            <div style="margin-bottom: 20pt;">
                <div class="job-header">
                    <div class="job-name">${job.jobTitle} - ${job.startDate} to ${job.endDate}</div>
                    <div class="job-company">${job.company}${job.location ? `, ${job.location}` : ''}</div>
                    <div class="job-description">Briefly describe what the company does as well as the purpose of your role.</div>
                </div>
                <ul>
                    ${job.responsibilities?.filter((r: string) => r.trim()).map((responsibility: string) => `
                        <li>${responsibility}</li>
                    `).join('') || ''}
                </ul>
            </div>
        `).join('')}
        ` : ''}
        
        ${data.education?.length > 0 ? `
        <h2>Education</h2>
        ${data.education.map(edu => `
            <div class="education-item">
                <div class="education-title">${edu.degree} / ${edu.institution} / ${edu.graduationYear}</div>
                ${edu.gpa ? `<div style="margin: 2pt 0 0 0;">GPA: ${edu.gpa}</div>` : ''}
            </div>
        `).join('')}
        ` : ''}
        
        ${data.coursesAndCertifications?.length > 0 ? `
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
    
    const timestamp = new Date().toISOString().slice(0, 10);
    const nameFromData = data.personalInfo?.name || '';
    const safeName = nameFromData
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30) || 'resume';
    
    a.download = `${safeName}_Resume_${timestamp}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('=== HTML Export Completed Successfully ===');
  } catch (error) {
    console.error('=== HTML Export Failed ===');
    console.error('Error details:', error);
    throw new Error(`HTML export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
