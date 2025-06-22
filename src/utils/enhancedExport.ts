
// Enhanced export utilities with exact preview formatting
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

// Enhanced PDF export with exact preview formatting
export const exportToHighQualityPDF = async (data: ResumeData): Promise<void> => {
  console.log('=== Enhanced PDF Export Started ===');
  
  try {
    // Find the resume element
    const resumeElement = document.querySelector('[data-resume-preview]') as HTMLElement;
    
    if (!resumeElement) {
      throw new Error('Resume preview not found');
    }
    
    console.log('Resume element found for enhanced export');

    // Import libraries
    const [html2canvas, jsPDF] = await Promise.all([
      import('html2canvas'),
      import('jspdf')
    ]);
    
    console.log('Libraries imported for enhanced export');

    // Create high-quality canvas with exact settings
    const canvas = await html2canvas.default(resumeElement, {
      scale: 2, // Higher quality
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: false,
      foreignObjectRendering: true,
      imageTimeout: 0,
      removeContainer: false
    });
    
    console.log('High-quality canvas created');

    // Create PDF with exact A4 dimensions
    const pdf = new jsPDF.jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality
    
    // A4 dimensions in mm
    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 10;
    
    const imgWidth = pdfWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add image with proper positioning
    pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, Math.min(imgHeight, pdfHeight - (margin * 2)));
    
    // Save with proper filename
    const filename = `${data.personalInfo.name.replace(/\s+/g, '_') || 'resume'}_resume.pdf`;
    pdf.save(filename);
    
    console.log('=== Enhanced PDF Export Complete ===');
  } catch (error) {
    console.error('=== Enhanced PDF Export Failed ===', error);
    throw error;
  }
};

// Enhanced Word export with all formatting changes applied
export const exportToEnhancedWord = async (data: ResumeData): Promise<void> => {
  console.log('=== Enhanced Word Export Started ===');
  
  try {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = await import('docx');
    
    const children = [];
    
    // Header with exact formatting and all requested changes
    if (data.personalInfo.name) {
      children.push(
        new Paragraph({
          children: [new TextRun({ 
            text: data.personalInfo.name, 
            bold: true, 
            size: 52, // Increased from 32 (26pt equivalent)
            color: "000000" // Explicit black color
          })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        })
      );
    }
    
    // Job title and location with increased font size and black color
    if (data.personalInfo.jobTitle) {
      const titleLine = data.personalInfo.jobTitle + 
        (data.personalInfo.location ? ` | ${data.personalInfo.location}` : '');
      children.push(
        new Paragraph({
          children: [new TextRun({ 
            text: titleLine, 
            size: 36, // Increased to match 18pt
            color: "000000" // Explicit black color
          })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        })
      );
    }
    
    // Contact info with increased font size and black color
    const contact = [data.personalInfo.email, data.personalInfo.phone]
      .filter(Boolean).join(' | ');
    if (contact) {
      children.push(
        new Paragraph({
          children: [new TextRun({ 
            text: contact, 
            size: 32, // Increased to match 16pt
            color: "000000" // Explicit black color
          })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );
    }
    
    // Summary section with normal font weight for heading and black color
    if (data.summary) {
      children.push(
        new Paragraph({
          children: [new TextRun({ 
            text: 'Summary', 
            bold: false, // Changed to normal font weight
            size: 36, // Increased to match 18pt
            color: "000000" // Explicit black color
          })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 150 },
          border: {
            bottom: {
              color: "000000", // Changed to black
              size: 1,
              style: BorderStyle.SINGLE,
            },
          },
        }),
        new Paragraph({
          children: [new TextRun({ 
            text: data.summary, 
            size: 32, // Increased to match 16pt
            color: "000000" // Explicit black color
          })],
          spacing: { after: 300 }
        })
      );
    }
    
    // Experience section with increased font sizes and black color
    if (data.workExperience.length > 0) {
      children.push(
        new Paragraph({
          children: [new TextRun({ 
            text: 'Experience', 
            bold: true, 
            size: 36, // Increased to match 18pt
            color: "000000" // Explicit black color
          })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 150 },
          border: {
            bottom: {
              color: "000000", // Changed to black
              size: 1,
              style: BorderStyle.SINGLE,
            },
          },
        })
      );
      
      data.workExperience.forEach(job => {
        children.push(
          new Paragraph({
            children: [new TextRun({ 
              text: `${job.jobTitle} - ${job.company}`, 
              bold: true, 
              size: 32, // Increased to match 16pt
              color: "000000" // Explicit black color
            })],
            spacing: { before: 200, after: 50 }
          }),
          new Paragraph({
            children: [new TextRun({ 
              text: `${job.startDate} - ${job.endDate}${job.location ? ` | ${job.location}` : ''}`, 
              size: 32, // Increased to match 16pt
              italics: true,
              color: "000000" // Explicit black color
            })],
            spacing: { after: 100 }
          })
        );
        
        job.responsibilities.forEach(resp => {
          children.push(
            new Paragraph({
              children: [new TextRun({ 
                text: `• ${resp}`, 
                size: 32, // Increased to match 16pt
                color: "000000" // Explicit black color
              })],
              spacing: { after: 50 }
            })
          );
        });
      });
    }
    
    // Education section with increased font sizes and black color
    if (data.education.length > 0) {
      children.push(
        new Paragraph({
          children: [new TextRun({ 
            text: 'Education', 
            bold: true, 
            size: 36, // Increased to match 18pt
            color: "000000" // Explicit black color
          })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 150 },
          border: {
            bottom: {
              color: "000000", // Changed to black
              size: 1,
              style: BorderStyle.SINGLE,
            },
          },
        })
      );
      
      data.education.forEach(edu => {
        children.push(
          new Paragraph({
            children: [new TextRun({ 
              text: edu.degree, 
              bold: true, 
              size: 32, // Increased to match 16pt
              color: "000000" // Explicit black color
            })],
            spacing: { before: 100, after: 50 }
          }),
          new Paragraph({
            children: [new TextRun({ 
              text: `${edu.institution} - ${edu.graduationYear}${edu.location ? ` | ${edu.location}` : ''}`, 
              size: 32, // Increased to match 16pt
              color: "000000" // Explicit black color
            })],
            spacing: { after: 200 }
          })
        );
      });
    }
    
    // Courses and certifications with normal font weight and increased font sizes
    if (data.coursesAndCertifications.length > 0) {
      children.push(
        new Paragraph({
          children: [new TextRun({ 
            text: 'Courses & Certifications', 
            bold: false, // Changed to normal font weight
            size: 32, // Increased to match 16pt
            color: "000000" // Explicit black color
          })],
          spacing: { before: 200, after: 100 }
        })
      );
      
      data.coursesAndCertifications.forEach(item => {
        children.push(
          new Paragraph({
            children: [new TextRun({ 
              text: `${item.title} - ${item.provider} (${item.date})`, 
              size: 32, // Increased to match 16pt
              color: "000000", // Explicit black color
              bold: true // Keep the bold formatting for the title line
            })],
            spacing: { after: 100 }
          })
        );
      });
    }
    
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
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
    
    console.log('=== Enhanced Word Export Complete ===');
  } catch (error) {
    console.error('=== Enhanced Word Export Failed ===', error);
    throw error;
  }
};
