
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { ExportData } from './resumeExport';

export const exportResumeAsWord = async (data: ExportData): Promise<void> => {
  try {
    const children: (Paragraph)[] = [];

    // Header - Name
    if (data.personalInfo?.name) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: data.personalInfo.name.toUpperCase(),
              bold: true,
              size: 32,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }

    // Job Title
    if (data.personalInfo?.jobTitle) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: data.personalInfo.jobTitle,
              italics: true,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }

    // Contact Information
    const contactInfo = [
      data.personalInfo?.location,
      data.personalInfo?.email,
      data.personalInfo?.phone,
    ].filter(Boolean);

    if (contactInfo.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contactInfo.join(' | '),
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );
    }

    // Professional Summary
    if (data.summary) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'PROFESSIONAL SUMMARY',
              bold: true,
              size: 24,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: data.summary,
              size: 20,
            }),
          ],
          spacing: { after: 400 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    }

    // Work Experience
    if (data.workExperience.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'PROFESSIONAL EXPERIENCE',
              bold: true,
              size: 24,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 },
        })
      );

      data.workExperience.forEach((job) => {
        // Job Title and Date
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${job.jobTitle} - ${job.startDate} to ${job.endDate}`,
                bold: true,
                size: 20,
              }),
            ],
            spacing: { after: 100 },
          })
        );

        // Company and Location
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${job.company}${job.location ? `, ${job.location}` : ''}`,
                italics: true,
                size: 20,
              }),
            ],
            spacing: { after: 100 },
          })
        );

        // Job Description
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Briefly describe what the company does as well as the purpose of your role.',
                italics: true,
                size: 20,
              }),
            ],
            spacing: { after: 100 },
          })
        );

        // Responsibilities
        if (job.responsibilities && job.responsibilities.length > 0) {
          job.responsibilities
            .filter((resp: string) => resp.trim())
            .forEach((responsibility: string) => {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${responsibility}`,
                      size: 20,
                    }),
                  ],
                  spacing: { after: 100 },
                })
              );
            });
        }

        children.push(
          new Paragraph({
            children: [new TextRun({ text: '', size: 20 })],
            spacing: { after: 200 },
          })
        );
      });
    }

    // Education
    if (data.education.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'EDUCATION',
              bold: true,
              size: 24,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 },
        })
      );

      data.education.forEach((edu) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${edu.degree} / ${edu.institution} / ${edu.graduationYear}`,
                bold: true,
                size: 20,
              }),
            ],
            spacing: { after: 100 },
          })
        );

        if (edu.gpa) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `GPA: ${edu.gpa}`,
                  size: 20,
                }),
              ],
              spacing: { after: 200 },
            })
          );
        } else {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: '', size: 20 })],
              spacing: { after: 200 },
            })
          );
        }
      });
    }

    // Courses and Certifications
    if (data.coursesAndCertifications.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'TRAINING OR CERTIFICATION',
              bold: true,
              size: 24,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 },
        })
      );

      data.coursesAndCertifications.forEach((item) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${item.title} / ${item.provider} / ${item.date}`,
                bold: true,
                size: 20,
              }),
            ],
            spacing: { after: 100 },
          })
        );

        if (item.description) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: item.description,
                  italics: true,
                  size: 20,
                }),
              ],
              spacing: { after: 200 },
            })
          );
        } else {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: '', size: 20 })],
              spacing: { after: 200 },
            })
          );
        }
      });
    }

    // Create the document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    });

    // Generate and download the document
    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.personalInfo?.name?.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') || 'resume'}_Resume.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error exporting resume as Word:', error);
    throw new Error(`Failed to export resume as Word: ${error.message}`);
  }
};
