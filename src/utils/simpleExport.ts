
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

// Simple PDF export function with extensive debugging
export const exportToPDF = async (data: ResumeData): Promise<void> => {
  console.log('=== PDF Export Debug Log ===');
  console.log('Step 1: Starting PDF export function');
  
  try {
    // Step 1: Find the resume element
    console.log('Step 2: Looking for resume element');
    const resumeElement = document.querySelector('[data-resume-preview]') as HTMLElement;
    
    if (!resumeElement) {
      console.error('Step 2 FAILED: Resume preview element not found');
      throw new Error('Resume preview not found');
    }
    
    console.log('Step 2 SUCCESS: Resume element found', resumeElement);
    console.log('Element dimensions:', resumeElement.offsetWidth, 'x', resumeElement.offsetHeight);

    // Step 2: Import libraries with timeout
    console.log('Step 3: Importing libraries with timeout protection');
    
    const importPromise = Promise.all([
      import('html2canvas'),
      import('jspdf')
    ]);
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Library import timeout')), 10000);
    });
    
    const [html2canvas, jsPDF] = await Promise.race([importPromise, timeoutPromise]) as any;
    console.log('Step 3 SUCCESS: Libraries imported successfully');

    // Step 3: Create canvas with timeout and optimized settings
    console.log('Step 4: Creating canvas with optimized settings');
    
    const canvasPromise = html2canvas.default(resumeElement, {
      scale: 0.8, // Reduced scale to prevent memory issues
      useCORS: true,
      backgroundColor: '#ffffff',
      width: resumeElement.offsetWidth,
      height: resumeElement.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      allowTaint: false,
      logging: true // Enable html2canvas logging
    });
    
    const canvasTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Canvas creation timeout')), 15000);
    });
    
    const canvas = await Promise.race([canvasPromise, canvasTimeoutPromise]);
    console.log('Step 4 SUCCESS: Canvas created', canvas.width, 'x', canvas.height);

    // Step 4: Create PDF
    console.log('Step 5: Creating PDF document');
    const pdf = new jsPDF.jsPDF('portrait', 'mm', 'a4');
    console.log('Step 5 SUCCESS: PDF document created');
    
    // Step 5: Convert canvas to image
    console.log('Step 6: Converting canvas to image data');
    const imgData = canvas.toDataURL('image/png', 0.8); // Reduced quality to prevent memory issues
    console.log('Step 6 SUCCESS: Image data created, length:', imgData.length);
    
    // Step 6: Calculate dimensions
    console.log('Step 7: Calculating PDF dimensions');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    console.log('PDF dimensions:', pdfWidth, 'x', pdfHeight);
    console.log('Image dimensions:', imgWidth, 'x', imgHeight);
    
    // Step 7: Add image to PDF
    console.log('Step 8: Adding image to PDF');
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pdfHeight - 20));
    console.log('Step 8 SUCCESS: Image added to PDF');
    
    // Step 8: Save PDF
    console.log('Step 9: Saving PDF file');
    const filename = `${data.personalInfo.name.replace(/\s+/g, '_') || 'resume'}_resume.pdf`;
    pdf.save(filename);
    console.log('Step 9 SUCCESS: PDF saved as', filename);
    
    console.log('=== PDF Export Complete ===');
  } catch (error) {
    console.error('=== PDF Export Failed ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw new Error(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Simple Word export function with extensive debugging
export const exportToWord = async (data: ResumeData): Promise<void> => {
  console.log('=== Word Export Debug Log ===');
  console.log('Step 1: Starting Word export function');
  
  try {
    console.log('Step 2: Importing docx library');
    const { Document, Packer, Paragraph, TextRun } = await import('docx');
    console.log('Step 2 SUCCESS: Docx library imported');
    
    console.log('Step 3: Building document content');
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
    
    console.log('Step 3 SUCCESS: Document content built, sections:', children.length);
    
    console.log('Step 4: Creating document');
    const doc = new Document({
      sections: [{
        children: children,
      }],
    });
    console.log('Step 4 SUCCESS: Document created');
    
    console.log('Step 5: Converting to blob');
    const blob = await Packer.toBlob(doc);
    console.log('Step 5 SUCCESS: Blob created, size:', blob.size);
    
    console.log('Step 6: Creating download');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.personalInfo.name.replace(/\s+/g, '_') || 'resume'}_resume.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('Step 6 SUCCESS: File downloaded');
    
    console.log('=== Word Export Complete ===');
  } catch (error) {
    console.error('=== Word Export Failed ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw new Error(`Word export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
