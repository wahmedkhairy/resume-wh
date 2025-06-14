
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { ExportData } from './resumeExport';

export const exportResumeAsWord = async (data: ExportData): Promise<void> => {
  try {
    const children: (Paragraph)[] = [];

    // Header - Name (matching Resume Preview)
    if (data.personalInfo?.name) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: data.personalInfo.name,
              bold: true,
              size: 64, // 32pt in half-points (matching Resume Preview)
              color: "000000",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }

    // Job Title (matching Resume Preview)
    if (data.personalInfo?.jobTitle) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: data.personalInfo.jobTitle,
              size: 36, // 18pt in half-points
              color: "000000",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }

    // Contact Information (matching Resume Preview)
    const contactInfo = [
      data.personalInfo?.email,
      data.personalInfo?.phone,
      data.personalInfo?.location,
    ].filter(Boolean);

    if (contactInfo.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contactInfo.join(' | '),
              size: 32, // 16pt in half-points
              color: "000000",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 500 },
        })
      );
    }

    // Summary Section (matching Resume Preview)
    if (data.summary) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Summary',
              bold: true,
              size: 44, // 22pt in half-points
              color: "000000",
            }),
          ],
          spacing: { before: 200, after: 300 },
          border: {
            bottom: {
              color: "CCCCCC",
              space: 1,
              value: "single",
              size: 6,
            },
          },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: data.summary,
              size: 32, // 16pt in half-points
              color: "000000",
            }),
          ],
          spacing: { after: 500 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    }

    // Experience Section (matching Resume Preview)
    if (data.workExperience.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Experience',
              bold: true,
              size: 44, // 22pt in half-points
              color: "000000",
            }),
          ],
          spacing: { before: 200, after: 300 },
          border: {
            bottom: {
              color: "CCCCCC",
              space: 1,
              value: "single",
              size: 6,
            },
          },
        })
      );

      data.workExperience.forEach((job, index) => {
        // Job Title and Company (matching Resume Preview)
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${job.jobTitle} - ${job.company}`,
                bold: true,
                size: 36, // 18pt in half-points
                color: "000000",
              }),
            ],
            spacing: { after: 100 },
          })
        );

        // Date and Location (matching Resume Preview)
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${job.startDate} - ${job.endDate}${job.location ? ` | ${job.location}` : ''}`,
                italics: true,
                size: 32, // 16pt in half-points
                color: "000000",
              }),
            ],
            spacing: { after: 200 },
          })
        );

        // Responsibilities (matching Resume Preview)
        if (job.responsibilities && job.responsibilities.length > 0) {
          job.responsibilities
            .filter((resp: string) => resp.trim())
            .forEach((responsibility: string) => {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${responsibility}`,
                      size: 32, // 16pt in half-points
                      color: "000000",
                    }),
                  ],
                  spacing: { after: 100 },
                  indent: { left: 360 }, // Indent bullet points
                })
              );
            });
        }

        // Add spacing between jobs
        if (index < data.workExperience.length - 1) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: '', size: 32 })],
              spacing: { after: 300 },
            })
          );
        }
      });
    }

    // Education Section (matching Resume Preview)
    if (data.education.length > 0 || data.coursesAndCertifications.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Education',
              bold: true,
              size: 44, // 22pt in half-points
              color: "000000",
            }),
          ],
          spacing: { before: 500, after: 300 },
          border: {
            bottom: {
              color: "CCCCCC",
              space: 1,
              value: "single",
              size: 6,
            },
          },
        })
      );

      // Education entries (matching Resume Preview)
      data.education.forEach((edu, index) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: edu.degree,
                bold: true,
                size: 36, // 18pt in half-points
                color: "000000",
              }),
            ],
            spacing: { after: 100 },
          })
        );

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${edu.institution} - ${edu.graduationYear}${edu.location ? ` | ${edu.location}` : ''}`,
                size: 32, // 16pt in half-points
                color: "000000",
              }),
            ],
            spacing: { after: edu.gpa ? 100 : 300 },
          })
        );

        if (edu.gpa) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `GPA: ${edu.gpa}`,
                  size: 32, // 16pt in half-points
                  color: "000000",
                }),
              ],
              spacing: { after: 300 },
            })
          );
        }
      });

      // Certifications (matching Resume Preview)
      if (data.coursesAndCertifications.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Certifications',
                bold: true,
                size: 36, // 18pt in half-points
                color: "000000",
              }),
            ],
            spacing: { before: 300, after: 200 },
          })
        );

        data.coursesAndCertifications.forEach((item) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${item.title} - ${item.provider} (${item.date})`,
                  bold: true,
                  size: 32, // 16pt in half-points
                  color: "000000",
                }),
              ],
              spacing: { after: 200 },
            })
          );
        });
      }
    }

    // Create the document with proper styling
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720, // 0.5 inch
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: children,
        },
      ],
      styles: {
        default: {
          document: {
            run: {
              font: "Times New Roman",
              size: 32, // 16pt default
              color: "000000",
            },
          },
        },
      },
    });

    // Generate and download the document using browser-compatible method
    const blob = await Packer.toBlob(doc);
    
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
