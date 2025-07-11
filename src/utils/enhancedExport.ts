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
    experienceType?: string;
    writingStyle?: "bullet" | "paragraph";
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
    writingStyle?: "bullet" | "paragraph";
  }>;
}

const getExperienceTypeDisplay = (type?: string) => {
  switch (type) {
    case "full-time":
      return "Full Time";
    case "remote":
      return "Remote";
    case "internship":
      return "Internship";
    default:
      return "";
  }
};

const formatResponsibilities = (responsibilities: string[], writingStyle?: "bullet" | "paragraph") => {
  const validResponsibilities = responsibilities.filter(resp => resp.trim());
  
  if (!validResponsibilities.length) return "";

  if (writingStyle === "paragraph") {
    return validResponsibilities.join('. ');
  }

  // For bullet points, split each responsibility by line breaks and create separate bullet points
  const allBulletPoints: string[] = [];
  validResponsibilities.forEach(responsibility => {
    const lines = responsibility.split('\n').filter(line => line.trim());
    lines.forEach(line => {
      // Remove existing bullet point if present
      const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
      if (cleanLine) {
        allBulletPoints.push(cleanLine);
      }
    });
  });

  return allBulletPoints;
};

const formatDescription = (description: string, writingStyle?: "bullet" | "paragraph") => {
  if (!description.trim()) return "";

  if (writingStyle === "paragraph") {
    return description;
  }

  // For bullet points, split description by line breaks and create separate bullet points
  const lines = description.split('\n').filter(line => line.trim());
  const bulletPoints: string[] = [];
  
  lines.forEach(line => {
    // Remove existing bullet point if present
    const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
    if (cleanLine) {
      bulletPoints.push(cleanLine);
    }
  });

  return bulletPoints;
};

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

// Enhanced Word export with exact font sizes matching preview
export const exportToEnhancedWord = async (data: ResumeData): Promise<void> => {
  console.log('=== Enhanced Word Export Started ===');
  
  try {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = await import('docx');
    
    const children = [];
    
    // Header with exact font sizes matching preview (20pt = 40 Word units)
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
    
    // Contact info in one line with vertical separators and exact font size matching preview (12pt = 24 Word units)
    const contactInfo = [
      data.personalInfo.jobTitle,
      data.personalInfo.location,
      data.personalInfo.email,
      data.personalInfo.phone
    ].filter(Boolean);
    
    if (contactInfo.length > 0) {
      children.push(
        new Paragraph({
          children: [new TextRun({ 
            text: contactInfo.join(' | '), // Use vertical separators like in preview
            size: 24, // 12pt equivalent - matches preview exactly
            color: "000000" // Explicit black color
          })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          bidirectional: false // Ensure left-to-right
        })
      );
    }
    
    // Summary section with exact font sizes matching preview (Heading: 14pt = 28 Word units, Body: 12pt = 24 Word units)
    if (data.summary) {
      children.push(
        new Paragraph({
          children: [new TextRun({ 
            text: 'Summary', 
            bold: true, // Bold to match preview
            size: 28, // 14pt equivalent - matches preview exactly
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
    
    if (data.workExperience.length > 0) {
      children.push(
        new Paragraph({
          children: [new TextRun({ 
            text: 'Experience', 
            bold: true, 
            size: 28, // 14pt equivalent - matches preview exactly
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
          })
        );

        // Date, location, and experience type line
        const dateLocationLine = `${job.startDate} - ${job.endDate}` +
          (job.location ? ` | ${job.location}` : '') +
          (job.experienceType ? ` | ${getExperienceTypeDisplay(job.experienceType)}` : '');
        
        children.push(
          new Paragraph({
            children: [new TextRun({ 
              text: dateLocationLine, 
              size: 24, // 12pt equivalent - matches preview exactly
              italics: true,
              color: "000000" // Explicit black color
            })],
            spacing: { after: 100 },
            alignment: AlignmentType.LEFT,
            bidirectional: false // Ensure left-to-right
          })
        );
        
        // Handle responsibilities with writing style
        const formattedResponsibilities = formatResponsibilities(job.responsibilities, job.writingStyle);
        
        if (job.writingStyle === "paragraph" && typeof formattedResponsibilities === "string") {
          children.push(
            new Paragraph({
              children: [new TextRun({ 
                text: formattedResponsibilities, 
                size: 24, // 12pt equivalent - matches preview exactly
                color: "000000" // Explicit black color
              })],
              spacing: { after: 200 },
              alignment: AlignmentType.LEFT,
              bidirectional: false // Ensure left-to-right
            })
          );
        } else if (Array.isArray(formattedResponsibilities)) {
          formattedResponsibilities.forEach(resp => {
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
        }
      });
    }
    
    if (data.education.length > 0) {
      children.push(
        new Paragraph({
          children: [new TextRun({ 
            text: 'Education', 
            bold: true, 
            size: 28, // 14pt equivalent - matches preview exactly
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
            spacing: { after: 50 },
            alignment: AlignmentType.LEFT,
            bidirectional: false // Ensure left-to-right
          })
        );

        // Handle description with writing style
        const formattedDescription = formatDescription(item.description, item.writingStyle);
        
        if (item.writingStyle === "paragraph" && typeof formattedDescription === "string" && formattedDescription) {
          children.push(
            new Paragraph({
              children: [new TextRun({ 
                text: formattedDescription, 
                size: 24, // 12pt equivalent - matches preview exactly
                color: "000000" // Explicit black color
              })],
              spacing: { after: 100 },
              alignment: AlignmentType.LEFT,
              bidirectional: false // Ensure left-to-right
            })
          );
        } else if (Array.isArray(formattedDescription)) {
          formattedDescription.forEach(point => {
            children.push(
              new Paragraph({
                children: [new TextRun({ 
                  text: `• ${point}`, 
                  size: 24, // 12pt equivalent - matches preview exactly
                  color: "000000" // Explicit black color
                })],
                spacing: { after: 50 },
                alignment: AlignmentType.LEFT,
                bidirectional: false // Ensure left-to-right
              })
            );
          });
        }
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
