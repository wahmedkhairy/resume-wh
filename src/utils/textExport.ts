
export interface ExportData {
  personalInfo: any;
  summary: string;
  workExperience: any[];
  education: any[];
  skills: any[];
  coursesAndCertifications: any[];
}

export const exportResumeAsPlainText = (data: ExportData): void => {
  let textContent = '';
  
  // Header Section
  if (data.personalInfo?.name) {
    textContent += `${data.personalInfo.name.toUpperCase()}\n`;
  }
  
  if (data.personalInfo?.jobTitle) {
    textContent += `${data.personalInfo.jobTitle}\n`;
  }
  
  textContent += '\n';
  
  // Contact Information
  if (data.personalInfo?.phone) {
    textContent += `${data.personalInfo.phone}\n`;
  }
  if (data.personalInfo?.email) {
    textContent += `${data.personalInfo.email}\n`;
  }
  if (data.personalInfo?.location) {
    textContent += `${data.personalInfo.location}\n`;
  }
  
  textContent += '\n';
  
  // Professional Summary
  if (data.summary) {
    textContent += 'PROFESSIONAL SUMMARY\n';
    textContent += `${data.summary}\n\n`;
  }
  
  // Professional Experience
  if (data.workExperience.length > 0) {
    textContent += 'PROFESSIONAL EXPERIENCE\n';
    data.workExperience.forEach((job) => {
      textContent += `${job.jobTitle}\n`;
      textContent += `${job.company}`;
      if (job.location) {
        textContent += `, ${job.location}`;
      }
      textContent += '\n';
      textContent += `${job.startDate} - ${job.endDate}\n`;
      
      if (job.responsibilities && job.responsibilities.length > 0) {
        job.responsibilities
          .filter((resp: string) => resp.trim())
          .forEach((responsibility: string) => {
            textContent += `• ${responsibility}\n`;
          });
      }
      textContent += '\n';
    });
  }
  
  // Education
  if (data.education.length > 0) {
    textContent += 'EDUCATION\n';
    data.education.forEach((edu) => {
      textContent += `${edu.degree}\n`;
      textContent += `${edu.institution}`;
      if (edu.location) {
        textContent += `, ${edu.location}`;
      }
      textContent += '\n';
      textContent += `${edu.graduationYear}\n`;
      if (edu.gpa) {
        textContent += `GPA: ${edu.gpa}\n`;
      }
      textContent += '\n';
    });
  }
  
  // Courses and Certifications
  if (data.coursesAndCertifications.length > 0) {
    textContent += 'COURSES & CERTIFICATIONS\n';
    data.coursesAndCertifications.forEach((item) => {
      textContent += `${item.title} - ${item.provider} (${item.date})\n`;
      if (item.description) {
        textContent += `${item.description}\n`;
      }
    });
    textContent += '\n';
  }
  
  // Create and download the text file
  const blob = new Blob([textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.personalInfo?.name?.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') || 'resume'}_resume.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
