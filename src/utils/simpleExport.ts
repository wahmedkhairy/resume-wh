
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

// Simplified PDF export function - remove complex async patterns
export const exportToPDF = (data: ResumeData): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    console.log('=== PDF Export Started ===');
    
    try {
      // Find the resume element
      const resumeElement = document.querySelector('[data-resume-preview]') as HTMLElement;
      
      if (!resumeElement) {
        throw new Error('Resume preview not found');
      }
      
      console.log('Resume element found');

      // Import libraries
      const [html2canvas, jsPDF] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      
      console.log('Libraries imported');

      // Create canvas with enhanced settings for downloadable resume
      const canvas = await html2canvas.default(resumeElement, {
        scale: 2, // Higher quality for downloadable version
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: false,
        foreignObjectRendering: true,
        imageTimeout: 0,
        removeContainer: false
      });
      
      console.log('Canvas created');

      // Create PDF
      const pdf = new jsPDF.jsPDF('portrait', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pdfHeight - 20));
      
      // Save PDF
      const filename = `${data.personalInfo.name.replace(/\s+/g, '_') || 'resume'}_resume.pdf`;
      pdf.save(filename);
      
      console.log('=== PDF Export Complete ===');
      resolve();
    } catch (error) {
      console.error('=== PDF Export Failed ===', error);
      reject(error);
    }
  });
};

// Enhanced Word export function with exact font sizes matching preview
export const exportToWord = (data: ResumeData): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    console.log('=== Word Export Started ===');
    
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');
      
      const children = [];
      
      // Name with exact font size matching preview (20pt = 40 Word units)
      if (data.personalInfo.name) {
        children.push(
          new Paragraph({
            children: [new TextRun({ 
              text: data.personalInfo.name, 
              bold: true, 
              size: 40, // 20pt equivalent - matches preview exactly
              color: "000000" // Explicit black color
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            bidirectional: false // Ensure left-to-right
          })
        );
      }
      
      // Job title and location with exact font size matching preview (12pt = 24 Word units)
      if (data.personalInfo.jobTitle) {
        const titleLine = data.personalInfo.jobTitle + 
          (data.personalInfo.location ? ` | ${data.personalInfo.location}` : '');
        children.push(
          new Paragraph({
            children: [new TextRun({ 
              text: titleLine, 
              size: 24, // 12pt equivalent - matches preview exactly
              color: "000000" // Explicit black color
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            bidirectional: false // Ensure left-to-right
          })
        );
      }
      
      // Contact info with exact font size matching preview (12pt = 24 Word units)
      const contact = [data.personalInfo.email, data.personalInfo.phone]
        .filter(Boolean).join(' | ');
      if (contact) {
        children.push(
          new Paragraph({
            children: [new TextRun({ 
              text: contact, 
              size: 24, // 12pt equivalent - matches preview exactly
              color: "000000" // Explicit black color
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            bidirectional: false // Ensure left-to-right
          })
        );
      }
      
      // Summary section with exact font sizes matching preview
      if (data.summary) {
        children.push(
          new Paragraph({
            children: [new TextRun({ 
              text: 'Summary', 
              bold: true, // Bold to match preview
              size: 28, // 14pt equivalent - matches preview exactly
              color: "000000" // Explicit black color
            })],
            spacing: { before: 200, after: 150 },
            alignment: AlignmentType.LEFT,
            bidirectional: false // Ensure left-to-right
          }),
          new Paragraph({
            children: [new TextRun({ 
              text: data.summary, 
              size: 24, // 12pt equivalent - matches preview exactly
              color: "000000" // Explicit black color
            })],
            spacing: { after: 300 },
            alignment: AlignmentType.LEFT,
            bidirectional: false // Ensure left-to-right
          })
        );
      }
      
      // Experience section with exact font sizes matching preview
      if (data.workExperience.length > 0) {
        children.push(
          new Paragraph({
            children: [new TextRun({ 
              text: 'Experience', 
              bold: true, 
              size: 28, // 14pt equivalent - matches preview exactly
              color: "000000" // Explicit black color
            })],
            spacing: { before: 200, after: 150 },
            alignment: AlignmentType.LEFT,
            bidirectional: false // Ensure left-to-right
          })
        );
        
        data.workExperience.forEach(job => {
          children.push(
            new Paragraph({
              children: [new TextRun({ 
                text: `${job.jobTitle} - ${job.company}`, 
                bold: true, 
                size: 24, // 12pt equivalent - matches preview exactly
                color: "000000" // Explicit black color
              })],
              spacing: { before: 200, after: 50 },
              alignment: AlignmentType.LEFT,
              bidirectional: false // Ensure left-to-right
            }),
            new Paragraph({
              children: [new TextRun({ 
                text: `${job.startDate} - ${job.endDate}${job.location ? ` | ${job.location}` : ''}`, 
                size: 24, // 12pt equivalent - matches preview exactly
                italics: true,
                color: "000000" // Explicit black color
              })],
              spacing: { after: 100 },
              alignment: AlignmentType.LEFT,
              bidirectional: false // Ensure left-to-right
            })
          );
          
          job.responsibilities.forEach(resp => {
            children.push(
              new Paragraph({
                children: [new TextRun({ 
                  text: `• ${resp}`, 
                  size: 24, // 12pt equivalent - matches preview exactly
                  color: "000000" // Explicit black color
                })],
                spacing: { after: 50 },
                alignment: AlignmentType.LEFT,
                bidirectional: false // Ensure left-to-right
              })
            );
          });
        });
      }
      
      // Education section with exact font sizes matching preview
      if (data.education.length > 0) {
        children.push(
          new Paragraph({
            children: [new TextRun({ 
              text: 'Education', 
              bold: true, 
              size: 28, // 14pt equivalent - matches preview exactly
              color: "000000" // Explicit black color
            })],
            spacing: { before: 400, after: 150 },
            alignment: AlignmentType.LEFT,
            bidirectional: false // Ensure left-to-right
          })
        );
        
        data.education.forEach(edu => {
          children.push(
            new Paragraph({
              children: [new TextRun({ 
                text: edu.degree, 
                bold: true, 
                size: 24, // 12pt equivalent - matches preview exactly
                color: "000000" // Explicit black color
              })],
              spacing: { before: 100, after: 50 },
              alignment: AlignmentType.LEFT,
              bidirectional: false // Ensure left-to-right
            }),
            new Paragraph({
              children: [new TextRun({ 
                text: `${edu.institution} - ${edu.graduationYear}${edu.location ? ` | ${edu.location}` : ''}`, 
                size: 24, // 12pt equivalent - matches preview exactly
                color: "000000" // Explicit black color
              })],
              spacing: { after: 200 },
              alignment: AlignmentType.LEFT,
              bidirectional: false // Ensure left-to-right
            })
          );
        });
      }
      
      // Courses and certifications with exact font sizes matching preview
      if (data.coursesAndCertifications.length > 0) {
        children.push(
          new Paragraph({
            children: [new TextRun({ 
              text: 'Courses & Certifications', 
              bold: true, // Keep title bold
              size: 24, // 12pt equivalent - matches preview exactly
              color: "000000" // Explicit black color
            })],
            spacing: { before: 200, after: 100 },
            alignment: AlignmentType.LEFT,
            bidirectional: false // Ensure left-to-right
          })
        );
        
        data.coursesAndCertifications.forEach(item => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ 
                  text: item.title, 
                  size: 24, // 12pt equivalent - matches preview exactly
                  color: "000000", // Explicit black color
                  bold: true // Course title is bold to match preview
                }),
                new TextRun({ 
                  text: ` - ${item.provider} (${item.date})`, 
                  size: 24, // 12pt equivalent - matches preview exactly
                  color: "000000", // Explicit black color
                  bold: false // Rest is normal weight
                })
              ],
              spacing: { after: 100 },
              alignment: AlignmentType.LEFT,
              bidirectional: false // Ensure left-to-right
            })
          );
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
      
      console.log('=== Word Export Complete ===');
      resolve();
    } catch (error) {
      console.error('=== Word Export Failed ===', error);
      reject(error);
    }
  });
};
