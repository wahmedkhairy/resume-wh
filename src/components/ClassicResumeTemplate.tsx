
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

interface ClassicResumeTemplateProps {
  watermark?: boolean;
  personalInfo: PersonalInfo;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  coursesAndCertifications: Course[];
}

const ClassicResumeTemplate: React.FC<ClassicResumeTemplateProps> = ({
  watermark = false,
  personalInfo,
  summary,
  workExperience,
  education,
  coursesAndCertifications,
}) => {
  return (
    <div 
      className="resume-container bg-white relative"
      style={{ 
        fontFamily: 'Times, "Times New Roman", serif',
        fontSize: '12pt',
        lineHeight: '1.4',
        color: '#000000',
        padding: '1in',
        margin: '0',
        maxWidth: '8.5in',
        minHeight: '11in',
        boxSizing: 'border-box'
      }}
      data-resume-preview="true"
    >
      {/* Watermark for non-premium users */}
      {watermark && (
        <div className="watermark absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-gray-200 text-6xl font-bold transform rotate-45 opacity-10">
            DEMO VERSION
          </div>
        </div>
      )}

      {/* Header Section */}
      <header style={{ textAlign: 'center', marginBottom: '24pt' }}>
        <h1 
          style={{ 
            fontSize: '18pt',
            fontWeight: 'bold',
            margin: '0 0 8pt 0',
            textTransform: 'uppercase',
            letterSpacing: '2pt',
            color: '#000000'
          }}
        >
          {personalInfo.name || "NAME"}
        </h1>
        
        {personalInfo.jobTitle && (
          <div 
            style={{ 
              fontSize: '14pt',
              margin: '0 0 12pt 0',
              fontStyle: 'italic',
              color: '#000000'
            }}
          >
            {personalInfo.jobTitle}
          </div>
        )}
        
        <div 
          style={{ 
            fontSize: '12pt',
            color: '#000000',
            lineHeight: '1.2'
          }}
        >
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.location && personalInfo.email && <span> | </span>}
          {personalInfo.email && (
            <span style={{ textDecoration: 'underline' }}>{personalInfo.email}</span>
          )}
          {(personalInfo.location || personalInfo.email) && personalInfo.phone && <span> | </span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
        </div>
      </header>

      {/* Professional Summary Section */}
      {summary && (
        <section style={{ marginBottom: '24pt' }}>
          <div 
            style={{ 
              fontSize: '12pt',
              lineHeight: '1.5',
              textAlign: 'justify',
              margin: '0',
              color: '#000000',
              fontStyle: 'italic'
            }}
          >
            {summary}
          </div>
        </section>
      )}

      {/* Work Experience Section */}
      {workExperience.length > 0 && (
        <section style={{ marginBottom: '24pt' }}>
          <h2 
            style={{ 
              fontSize: '14pt',
              fontWeight: 'bold',
              margin: '0 0 16pt 0',
              color: '#000000',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '1pt'
            }}
          >
            WORK EXPERIENCE
          </h2>
          
          {workExperience.map((job, index) => (
            <div key={job.id} style={{ marginBottom: '20pt' }}>
              <div style={{ marginBottom: '8pt' }}>
                <div 
                  style={{ 
                    fontSize: '12pt',
                    fontWeight: 'bold',
                    margin: '0 0 2pt 0',
                    color: '#000000'
                  }}
                >
                  {job.jobTitle} - {job.startDate} to {job.endDate}
                </div>
                <div 
                  style={{ 
                    fontSize: '12pt',
                    margin: '0 0 8pt 0',
                    color: '#000000',
                    fontStyle: 'italic'
                  }}
                >
                  {job.company}
                  {job.location && `, ${job.location}`}
                </div>
                
                <div 
                  style={{ 
                    fontSize: '12pt',
                    margin: '0 0 8pt 0',
                    color: '#000000',
                    fontStyle: 'italic',
                    lineHeight: '1.4'
                  }}
                >
                  Briefly describe what the company does as well as the purpose of your role.
                </div>
              </div>
              
              {job.responsibilities.length > 0 && (
                <ul style={{ margin: '0', paddingLeft: '20pt', listStyleType: 'disc' }}>
                  {job.responsibilities
                    .filter(resp => resp.trim())
                    .map((responsibility, respIndex) => (
                    <li 
                      key={respIndex} 
                      style={{ 
                        fontSize: '12pt',
                        margin: '4pt 0',
                        color: '#000000',
                        lineHeight: '1.4'
                      }}
                    >
                      {responsibility}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education Section */}
      {education.length > 0 && (
        <section style={{ marginBottom: '24pt' }}>
          <h2 
            style={{ 
              fontSize: '14pt',
              fontWeight: 'bold',
              margin: '0 0 16pt 0',
              color: '#000000',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '1pt'
            }}
          >
            EDUCATION
          </h2>
          
          {education.map((edu, index) => (
            <div key={edu.id} style={{ marginBottom: '12pt' }}>
              <div 
                style={{ 
                  fontSize: '12pt',
                  fontWeight: 'bold',
                  margin: '0',
                  color: '#000000',
                  textTransform: 'uppercase'
                }}
              >
                {edu.degree} / {edu.institution} / {edu.graduationYear}
              </div>
              {edu.gpa && (
                <div 
                  style={{ 
                    fontSize: '12pt',
                    margin: '2pt 0 0 0',
                    color: '#000000'
                  }}
                >
                  GPA: {edu.gpa}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Certifications and Courses Section */}
      {coursesAndCertifications.length > 0 && (
        <section style={{ marginBottom: '24pt' }}>
          <h2 
            style={{ 
              fontSize: '14pt',
              fontWeight: 'bold',
              margin: '0 0 16pt 0',
              color: '#000000',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '1pt'
            }}
          >
            TRAINING OR CERTIFICATION
          </h2>
          
          {coursesAndCertifications.map((item, index) => (
            <div key={item.id} style={{ marginBottom: '8pt' }}>
              <div 
                style={{ 
                  fontSize: '12pt',
                  fontWeight: 'bold',
                  margin: '0',
                  color: '#000000',
                  textTransform: 'uppercase'
                }}
              >
                {item.title} / {item.provider} / {item.date}
              </div>
              {item.description && (
                <div 
                  style={{ 
                    fontSize: '12pt',
                    margin: '2pt 0',
                    color: '#000000',
                    fontStyle: 'italic'
                  }}
                >
                  {item.description}
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default ClassicResumeTemplate;
