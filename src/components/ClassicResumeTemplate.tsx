
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
        fontFamily: 'serif',
        fontSize: '11pt',
        lineHeight: '1.15',
        color: '#000000',
        padding: '0.5in',
        margin: '0 auto',
        maxWidth: '8.5in',
        minHeight: '11in',
        boxSizing: 'border-box',
        textAlign: 'center'
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

      {/* Header */}
      <header style={{ marginBottom: '20pt' }}>
        <h1 
          style={{ 
            fontSize: '16pt',
            fontWeight: 'bold',
            margin: '0 0 8pt 0',
            color: '#000000'
          }}
        >
          {personalInfo.name || "Your Name"}
        </h1>
        
        {personalInfo.jobTitle && (
          <div 
            style={{ 
              fontSize: '12pt',
              margin: '0 0 8pt 0',
              color: '#000000'
            }}
          >
            {personalInfo.jobTitle}
            {personalInfo.location && <span> | {personalInfo.location}</span>}
          </div>
        )}
        
        <div 
          style={{ 
            fontSize: '11pt',
            color: '#000000',
            lineHeight: '1.2'
          }}
        >
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.email && personalInfo.phone && <span> | </span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
        </div>
      </header>

      {/* Summary Section */}
      <section style={{ marginBottom: '20pt', textAlign: 'left' }}>
        <h2 
          style={{ 
            fontSize: '12pt',
            fontWeight: 'bold',
            margin: '0 0 8pt 0',
            color: '#000000',
            textAlign: 'left',
            borderBottom: '1pt solid #cccccc',
            paddingBottom: '2pt'
          }}
        >
          Summary
        </h2>
        
        <div 
          style={{ 
            fontSize: '11pt',
            lineHeight: '1.3',
            margin: '0',
            color: '#000000',
            textAlign: 'left'
          }}
        >
          {summary || "Generate your professional summary using AI by clicking the 'Generate Summary' button."}
        </div>
      </section>

      {/* Experience Section */}
      <section style={{ marginBottom: '20pt', textAlign: 'left' }}>
        <h2 
          style={{ 
            fontSize: '12pt',
            fontWeight: 'bold',
            margin: '0 0 12pt 0',
            color: '#000000',
            textAlign: 'left',
            borderBottom: '1pt solid #cccccc',
            paddingBottom: '2pt'
          }}
        >
          Experience
        </h2>
        
        {workExperience.length > 0 ? workExperience.map((job, index) => (
          <div key={job.id} style={{ marginBottom: '16pt' }}>
            <h3 
              style={{ 
                fontSize: '11pt',
                fontWeight: 'bold',
                margin: '0 0 4pt 0',
                color: '#000000'
              }}
            >
              {job.jobTitle} - {job.company}
            </h3>
            
            <div 
              style={{ 
                fontSize: '11pt',
                margin: '0 0 6pt 0',
                color: '#000000',
                fontStyle: 'italic'
              }}
            >
              {job.startDate} - {job.endDate}
              {job.location && <span> | {job.location}</span>}
            </div>
            
            {job.responsibilities.length > 0 && (
              <ul style={{ margin: '0', paddingLeft: '18pt' }}>
                {job.responsibilities
                  .filter(resp => resp.trim())
                  .map((responsibility, respIndex) => (
                  <li 
                    key={respIndex} 
                    style={{ 
                      fontSize: '11pt',
                      margin: '3pt 0',
                      color: '#000000',
                      lineHeight: '1.2'
                    }}
                  >
                    {responsibility}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )) : (
          <div style={{ marginBottom: '16pt' }}>
            <h3 
              style={{ 
                fontSize: '11pt',
                fontWeight: 'bold',
                margin: '0 0 4pt 0',
                color: '#000000'
              }}
            >
              Senior Frontend Developer - Tech Solutions Inc.
            </h3>
            
            <div 
              style={{ 
                fontSize: '11pt',
                margin: '0 0 6pt 0',
                color: '#000000',
                fontStyle: 'italic'
              }}
            >
              January 2020 - Present
            </div>
            
            <ul style={{ margin: '0', paddingLeft: '18pt' }}>
              <li style={{ fontSize: '11pt', margin: '3pt 0', color: '#000000', lineHeight: '1.2' }}>
                Led development of company's flagship SaaS product using React and TypeScript
              </li>
              <li style={{ fontSize: '11pt', margin: '3pt 0', color: '#000000', lineHeight: '1.2' }}>
                Improved application performance by <strong>40%</strong> through code optimization and efficient state management
              </li>
              <li style={{ fontSize: '11pt', margin: '3pt 0', color: '#000000', lineHeight: '1.2' }}>
                Collaborated with cross-functional teams to deliver high-quality user experiences
              </li>
            </ul>
          </div>
        )}
      </section>

      {/* Education Section */}
      {(education.length > 0 || coursesAndCertifications.length > 0) && (
        <section style={{ marginBottom: '20pt', textAlign: 'left' }}>
          <h2 
            style={{ 
              fontSize: '12pt',
              fontWeight: 'bold',
              margin: '0 0 12pt 0',
              color: '#000000',
              textAlign: 'left',
              borderBottom: '1pt solid #cccccc',
              paddingBottom: '2pt'
            }}
          >
            Education
          </h2>
          
          {education.length > 0 ? education.map((edu, index) => (
            <div key={edu.id} style={{ marginBottom: '12pt' }}>
              <div 
                style={{ 
                  fontSize: '11pt',
                  fontWeight: 'bold',
                  margin: '0 0 4pt 0',
                  color: '#000000'
                }}
              >
                {edu.degree}
              </div>
              <div 
                style={{ 
                  fontSize: '11pt',
                  margin: '0',
                  color: '#000000'
                }}
              >
                {edu.institution} - {edu.graduationYear}
                {edu.location && <span> | {edu.location}</span>}
              </div>
            </div>
          )) : (
            <div style={{ marginBottom: '12pt' }}>
              <div 
                style={{ 
                  fontSize: '11pt',
                  fontWeight: 'bold',
                  margin: '0 0 4pt 0',
                  color: '#000000'
                }}
              >
                Bachelor of Science in Computer Science
              </div>
              <div 
                style={{ 
                  fontSize: '11pt',
                  margin: '0',
                  color: '#000000'
                }}
              >
                University Name - 2020
              </div>
            </div>
          )}

          {coursesAndCertifications.length > 0 && (
            <>
              <h3 
                style={{ 
                  fontSize: '11pt',
                  fontWeight: 'bold',
                  margin: '16pt 0 8pt 0',
                  color: '#000000'
                }}
              >
                Courses & Certifications
              </h3>
              {coursesAndCertifications.map((item, index) => (
                <div key={item.id} style={{ marginBottom: '8pt' }}>
                  <div 
                    style={{ 
                      fontSize: '11pt',
                      fontWeight: 'bold',
                      margin: '0',
                      color: '#000000'
                    }}
                  >
                    {item.title} - {item.provider} ({item.date})
                  </div>
                </div>
              ))}
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default ClassicResumeTemplate;
