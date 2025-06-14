
import React from "react";

interface PersonalInfo {
  name: string;
  jobTitle: string;
  location: string;
  email: string;
  phone: string;
}

interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  location: string;
  responsibilities: string[];
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  graduationYear: string;
  gpa?: string;
  location: string;
}

interface Course {
  id: string;
  title: string;
  provider: string;
  date: string;
  description: string;
  type: "course" | "certification";
}

interface ATSProResumePreviewProps {
  watermark?: boolean;
  personalInfo: PersonalInfo;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  coursesAndCertifications: Course[];
}

const ATSProResumePreview: React.FC<ATSProResumePreviewProps> = ({
  watermark = false,
  personalInfo,
  summary,
  workExperience,
  education,
  coursesAndCertifications,
}) => {
  return (
    <div 
      className="resume-container bg-white relative min-h-[800px]" 
      style={{ 
        fontFamily: 'Times New Roman, serif',
        fontSize: '11pt',
        lineHeight: '1.25',
        color: '#000000',
        padding: '0.75in',
        margin: '0',
        maxWidth: '8.5in'
      }}
      data-resume-preview="true"
    >
      {/* Watermark */}
      {watermark && (
        <div className="watermark absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-gray-200 text-6xl font-bold transform rotate-45 opacity-10">
            DEMO VERSION
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-6">
        <h1 
          className="text-black font-bold mb-1"
          style={{ 
            fontSize: '14pt',
            fontWeight: 'bold',
            margin: '0 0 4pt 0',
            textAlign: 'left'
          }}
        >
          {personalInfo.name || "Your Name"}
        </h1>
        
        {personalInfo.jobTitle && (
          <div 
            className="text-black mb-2"
            style={{ 
              fontSize: '11pt',
              margin: '0 0 8pt 0'
            }}
          >
            {personalInfo.jobTitle}
          </div>
        )}
        
        <div 
          className="text-black"
          style={{ 
            fontSize: '11pt',
            margin: '0 0 12pt 0',
            lineHeight: '1.2'
          }}
        >
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
        </div>
      </div>

      {/* Professional Summary */}
      {summary && (
        <div className="mb-6">
          <h2 
            className="text-black font-bold mb-2"
            style={{ 
              fontSize: '13pt',
              fontWeight: 'bold',
              margin: '0 0 8pt 0',
              textTransform: 'uppercase',
              letterSpacing: '0.5pt'
            }}
          >
            PROFESSIONAL SUMMARY
          </h2>
          <div 
            className="text-black"
            style={{ 
              fontSize: '11pt',
              lineHeight: '1.4',
              textAlign: 'left',
              margin: '0 0 12pt 0'
            }}
          >
            {summary}
          </div>
        </div>
      )}

      {/* Professional Experience */}
      {workExperience.length > 0 && (
        <div className="mb-6">
          <h2 
            className="text-black font-bold mb-2"
            style={{ 
              fontSize: '13pt',
              fontWeight: 'bold',
              margin: '0 0 8pt 0',
              textTransform: 'uppercase',
              letterSpacing: '0.5pt'
            }}
          >
            PROFESSIONAL EXPERIENCE
          </h2>
          
          {workExperience.map((job, index) => (
            <div key={job.id} className="mb-4" style={{ marginBottom: index === workExperience.length - 1 ? '12pt' : '16pt' }}>
              <div className="mb-1">
                <div 
                  className="text-black font-bold"
                  style={{ 
                    fontSize: '11pt',
                    fontWeight: 'bold',
                    margin: '0'
                  }}
                >
                  {job.jobTitle}
                </div>
                <div 
                  className="text-black"
                  style={{ 
                    fontSize: '11pt',
                    margin: '2pt 0'
                  }}
                >
                  {job.company}{job.location && `, ${job.location}`}
                </div>
                <div 
                  className="text-black"
                  style={{ 
                    fontSize: '11pt',
                    margin: '2pt 0 6pt 0'
                  }}
                >
                  {job.startDate} - {job.endDate}
                </div>
              </div>
              
              {job.responsibilities.length > 0 && (
                <div style={{ marginLeft: '0' }}>
                  {job.responsibilities
                    .filter(resp => resp.trim())
                    .map((responsibility, respIndex) => (
                    <div 
                      key={respIndex} 
                      className="text-black"
                      style={{ 
                        fontSize: '11pt',
                        margin: '3pt 0',
                        textAlign: 'left',
                        lineHeight: '1.3'
                      }}
                    >
                      • {responsibility}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-6">
          <h2 
            className="text-black font-bold mb-2"
            style={{ 
              fontSize: '13pt',
              fontWeight: 'bold',
              margin: '0 0 8pt 0',
              textTransform: 'uppercase',
              letterSpacing: '0.5pt'
            }}
          >
            EDUCATION
          </h2>
          
          {education.map((edu, index) => (
            <div key={edu.id} className="mb-3" style={{ marginBottom: index === education.length - 1 ? '12pt' : '12pt' }}>
              <div 
                className="text-black font-bold"
                style={{ 
                  fontSize: '11pt',
                  fontWeight: 'bold',
                  margin: '0'
                }}
              >
                {edu.degree}
              </div>
              <div 
                className="text-black"
                style={{ 
                  fontSize: '11pt',
                  margin: '2pt 0'
                }}
              >
                {edu.institution}{edu.location && `, ${edu.location}`}
              </div>
              <div 
                className="text-black"
                style={{ 
                  fontSize: '11pt',
                  margin: '2pt 0'
                }}
              >
                {edu.graduationYear}
              </div>
              {edu.gpa && (
                <div 
                  className="text-black"
                  style={{ 
                    fontSize: '11pt',
                    margin: '2pt 0'
                  }}
                >
                  GPA: {edu.gpa}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Courses and Certifications - Only if user has added them */}
      {coursesAndCertifications.length > 0 && (
        <div className="mb-6">
          <h2 
            className="text-black font-bold mb-2"
            style={{ 
              fontSize: '13pt',
              fontWeight: 'bold',
              margin: '0 0 8pt 0',
              textTransform: 'uppercase',
              letterSpacing: '0.5pt'
            }}
          >
            COURSES & CERTIFICATIONS
          </h2>
          
          {coursesAndCertifications.map((item, index) => (
            <div 
              key={item.id} 
              className="text-black mb-1"
              style={{ 
                fontSize: '11pt',
                margin: '3pt 0',
                lineHeight: '1.3'
              }}
            >
              {item.title} - {item.provider} ({item.date})
              {item.description && (
                <div 
                  style={{ 
                    fontSize: '11pt',
                    margin: '2pt 0 0 0',
                    color: '#000000'
                  }}
                >
                  {item.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ATSProResumePreview;
