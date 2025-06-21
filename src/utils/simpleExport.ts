
// Simple export interface
export interface ResumeData {
  personalInfo: {
    name: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
  };
  summary: string;
  workExperience: Array<{
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
    location: string;
    responsibilities: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    graduationYear: string;
    location: string;
    gpa?: string;
  }>;
  skills: Array<{
    name: string;
    level: number;
  }>;
  coursesAndCertifications: Array<{
    title: string;
    provider: string;
    date: string;
    description: string;
  }>;
}

// Simple PDF export function
export const exportToPDF = async (data: ResumeData): Promise<void> => {
  console.log('Starting simple PDF export...');
  
  try {
    // Find the resume element
    const resumeElement = document.querySelector('[data-resume-preview]') as HTMLElement;
    
    if (!resumeElement) {
      throw new Error('Resume preview not found');
    }

    // Import libraries
    const [html2canvas, jsPDF] = await Promise.all([
      import('html2canvas'),
      import('jspdf')
    ]);

    // Create canvas
    const canvas = await html2canvas.default(resumeElement, {
      scale: 1,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    // Create PDF
    const pdf = new jsPDF.jsPDF('portrait', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    
    // Download
    const filename = `${data.personalInfo.name.replace(/\s+/g, '_') || 'resume'}_resume.pdf`;
    pdf.save(filename);
    
    console.log('PDF export completed');
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error(`PDF export failed: ${error.message}`);
  }
};

// Simple Word export function
export const exportToWord = async (data: ResumeData): Promise<void> => {
  console.log('Starting simple Word export...');
  
  try {
    const { Document, Packer, Paragraph, TextRun } = await import('docx');
    
    const children = [];
    
    // Name
    if (data.personalInfo.name) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: data.personalInfo.name, bold: true, size: 48 })],
        })
      );
    }
    
    // Contact info
    const contact = [data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location]
      .filter(Boolean).join(' | ');
    if (contact) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: contact, size: 24 })],
        })
      );
    }
    
    // Summary
    if (data.summary) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: 'Summary', bold: true, size: 32 })],
        }),
        new Paragraph({
          children: [new TextRun({ text: data.summary, size: 24 })],
        })
      );
    }
    
    // Experience
    if (data.workExperience.length > 0) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: 'Experience', bold: true, size: 32 })],
        })
      );
      
      data.workExperience.forEach(job => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `${job.jobTitle} - ${job.company}`, bold: true, size: 28 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: `${job.startDate} - ${job.endDate}`, size: 24 })],
          })
        );
        
        job.responsibilities.forEach(resp => {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `• ${resp}`, size: 24 })],
            })
          );
        });
      });
    }
    
    const doc = new Document({
      sections: [{
        children: children,
      }],
    });
    
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.personalInfo.name.replace(/\s+/g, '_') || 'resume'}_resume.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Word export completed');
  } catch (error) {
    console.error('Word export failed:', error);
    throw new Error(`Word export failed: ${error.message}`);
  }
};
