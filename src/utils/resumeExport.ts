
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
    // Get the resume preview element
    const resumeElement = document.querySelector('.resume-container') as HTMLElement;
    
    if (!resumeElement) {
      throw new Error('Resume preview not found');
    }

    // Temporarily hide watermark for export
    const watermark = document.querySelector('.watermark') as HTMLElement;
    const originalDisplay = watermark?.style.display;
    if (watermark) {
      watermark.style.display = 'none';
    }

    // Create canvas from the resume element
    const canvas = await html2canvas(resumeElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: resumeElement.scrollWidth,
      height: resumeElement.scrollHeight,
    });

    // Restore watermark
    if (watermark && originalDisplay !== undefined) {
      watermark.style.display = originalDisplay;
    }

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `resume_${data.personalInfo.name?.replace(/\s+/g, '_') || 'user'}_${timestamp}.pdf`;
    
    pdf.save(filename);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error exporting resume:', error);
    throw error;
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
            body { font-family: Georgia, serif; margin: 20px; line-height: 1.6; }
            h1 { text-align: center; margin-bottom: 10px; }
            h2 { border-bottom: 1px solid #000; padding-bottom: 5px; margin-top: 20px; }
            .contact-info { text-align: center; margin-bottom: 20px; }
            .skill-bar { background: #f0f0f0; height: 10px; margin: 5px 0; border-radius: 5px; }
            .skill-fill { height: 100%; border-radius: 5px; }
            .skill-fill.high { background: #10b981; }
            .skill-fill.medium { background: #3b82f6; }
            .skill-fill.low { background: #eab308; }
            ul { margin: 10px 0; padding-left: 25px; }
        </style>
    </head>
    <body>
        <h1>${data.personalInfo.name}</h1>
        <div class="contact-info">
            ${data.personalInfo.jobTitle} | ${data.personalInfo.location} | 
            ${data.personalInfo.email} | ${data.personalInfo.phone}
        </div>
        
        ${data.summary ? `
        <h2>Summary</h2>
        <p>${data.summary}</p>
        ` : ''}
        
        <h2>Experience</h2>
        ${data.workExperience.map(job => `
            <h3>${job.jobTitle} - ${job.company}</h3>
            <p><em>${job.startDate} - ${job.endDate} | ${job.location}</em></p>
            <ul>
                ${job.responsibilities.filter((r: string) => r.trim()).map((responsibility: string) => `
                    <li>${responsibility}</li>
                `).join('')}
            </ul>
        `).join('')}
        
        ${data.skills.length > 0 ? `
        <h2>Skills</h2>
        ${data.skills.map(skill => `
            <div>
                <strong>${skill.name}</strong>
                <div class="skill-bar">
                    <div class="skill-fill ${skill.level >= 80 ? 'high' : skill.level >= 60 ? 'medium' : 'low'}" 
                         style="width: ${skill.level}%"></div>
                </div>
            </div>
        `).join('')}
        ` : ''}
        
        <h2>Education</h2>
        ${data.education.map(edu => `
            <h3>${edu.degree}</h3>
            <p>${edu.institution} - ${edu.graduationYear}</p>
            ${edu.location ? `<p>${edu.location}</p>` : ''}
            ${edu.gpa ? `<p>GPA: ${edu.gpa}</p>` : ''}
        `).join('')}
        
        ${data.coursesAndCertifications.length > 0 ? `
        <h2>Courses & Certifications</h2>
        ${data.coursesAndCertifications.map(item => `
            <h3>${item.title}</h3>
            <p>${item.provider} - ${item.date}</p>
            <p>${item.description}</p>
        `).join('')}
        ` : ''}
    </body>
    </html>
  `;
  
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `resume_${data.personalInfo.name?.replace(/\s+/g, '_') || 'user'}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
