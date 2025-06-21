
import { ExportData } from './types';
import { generateFilename } from './domHelpers';

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
    a.download = generateFilename(data, 'html');
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
