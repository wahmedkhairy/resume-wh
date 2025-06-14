
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
        fontSize: '11pt',
        lineHeight: '1.3',
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
      <header style={{ textAlign: 'center', marginBottom: '18pt' }}>
        <h1 
          style={{ 
            fontSize: '20pt',
            fontWeight: 'bold',
            margin: '0 0 8pt 0',
            textTransform: 'uppercase',
            letterSpacing: '3pt',
            color: '#000000'
          }}
        >
          {personalInfo.name || "NAME"}
        </h1>
        
        {personalInfo.jobTitle && (
          <div 
            style={{ 
              fontSize: '12pt',
              margin: '0 0 12pt 0',
              fontWeight: 'normal',
              color: '#000000'
            }}
          >
            {personalInfo.jobTitle}
          </div>
        )}
        
        <div 
          style={{ 
            fontSize: '11pt',
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
      {summary ? (
        <section style={{ marginBottom: '20pt' }}>
          <div 
            style={{ 
              fontSize: '11pt',
              lineHeight: '1.4',
              textAlign: 'justify',
              margin: '0',
              color: '#000000',
              fontStyle: 'italic'
            }}
          >
            {summary}
          </div>
        </section>
      ) : (
        <section style={{ marginBottom: '20pt' }}>
          <div 
            style={{ 
              fontSize: '11pt',
              lineHeight: '1.4',
              textAlign: 'justify',
              margin: '0',
              color: '#000000',
              fontStyle: 'italic'
            }}
          >
            Write 2-3 concise and compelling sentences highlighting your background and education. You may want to include your most note-worthy professional accomplishment, how you will add value to a company, goals, etc. as it correlates to the position you are applying for.
          </div>
        </section>
      )}

      {/* Work Experience Section */}
      <section style={{ marginBottom: '20pt' }}>
        <h2 
          style={{ 
            fontSize: '12pt',
            fontWeight: 'bold',
            margin: '0 0 12pt 0',
            color: '#000000',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '2pt'
          }}
        >
          WORK EXPERIENCE
        </h2>
        
        {workExperience.length > 0 ? workExperience.map((job, index) => (
          <div key={job.id} style={{ marginBottom: '16pt' }}>
            <div style={{ marginBottom: '6pt' }}>
              <div 
                style={{ 
                  fontSize: '11pt',
                  fontWeight: 'bold',
                  margin: '0 0 2pt 0',
                  color: '#000000'
                }}
              >
                {job.jobTitle} – {job.startDate} to {job.endDate}
              </div>
              <div 
                style={{ 
                  fontSize: '11pt',
                  margin: '0 0 6pt 0',
                  color: '#000000',
                  fontStyle: 'italic'
                }}
              >
                {job.company}
              </div>
              
              <div 
                style={{ 
                  fontSize: '11pt',
                  margin: '0 0 6pt 0',
                  color: '#000000',
                  lineHeight: '1.4'
                }}
              >
                Briefly describe what the company does as well as the purpose of your role. You may choose to skip this step and start immediately with the bullet point list. However, just make sure to use a consistent approach
              </div>
            </div>
            
            {job.responsibilities.length > 0 && (
              <ul style={{ margin: '0', paddingLeft: '18pt', listStyleType: 'disc' }}>
                {job.responsibilities
                  .filter(resp => resp.trim())
                  .map((responsibility, respIndex) => (
                  <li 
                    key={respIndex} 
                    style={{ 
                      fontSize: '11pt',
                      margin: '3pt 0',
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
        )) : (
          <>
            <div style={{ marginBottom: '16pt' }}>
              <div style={{ marginBottom: '6pt' }}>
                <div 
                  style={{ 
                    fontSize: '11pt',
                    fontWeight: 'bold',
                    margin: '0 0 2pt 0',
                    color: '#000000'
                  }}
                >
                  Job Title – mm/yy to Present
                </div>
                <div 
                  style={{ 
                    fontSize: '11pt',
                    margin: '0 0 6pt 0',
                    color: '#000000',
                    fontStyle: 'italic'
                  }}
                >
                  Company Name
                </div>
                
                <div 
                  style={{ 
                    fontSize: '11pt',
                    margin: '0 0 6pt 0',
                    color: '#000000',
                    lineHeight: '1.4'
                  }}
                >
                  Briefly describe what the company does as well as the purpose of your role. You may choose to skip this step and start immediately with the bullet point list. However, just make sure to use a consistent approach
                </div>
              </div>
              
              <ul style={{ margin: '0', paddingLeft: '18pt', listStyleType: 'disc' }}>
                <li style={{ fontSize: '11pt', margin: '3pt 0', color: '#000000', lineHeight: '1.4' }}>
                  In a bulleted list, describe your key responsibilities in this role
                </li>
                <li style={{ fontSize: '11pt', margin: '3pt 0', color: '#000000', lineHeight: '1.4' }}>
                  Begin each bullet with an action verb (i.e., implemented, led, created)
                </li>
                <li style={{ fontSize: '11pt', margin: '3pt 0', color: '#000000', lineHeight: '1.4' }}>
                  Using measurable terms, describe project achievements and ways you created value for the company (i.e., Redesigned plant layout to improve downtime by 15%)
                </li>
                <li style={{ fontSize: '11pt', margin: '3pt 0', color: '#000000', lineHeight: '1.4' }}>
                  Ensure the verb tense you use is consistent
                </li>
                <li style={{ fontSize: '11pt', margin: '3pt 0', color: '#000000', lineHeight: '1.4' }}>
                  Highlighting your most impactful and relevant duties (3-8 bullets per job)
                </li>
              </ul>
            </div>

            <div style={{ marginBottom: '16pt' }}>
              <div style={{ marginBottom: '6pt' }}>
                <div 
                  style={{ 
                    fontSize: '11pt',
                    fontWeight: 'bold',
                    margin: '0 0 2pt 0',
                    color: '#000000'
                  }}
                >
                  Job Title – mm/yy to mm/yy
                </div>
                <div 
                  style={{ 
                    fontSize: '11pt',
                    margin: '0 0 6pt 0',
                    color: '#000000',
                    fontStyle: 'italic'
                  }}
                >
                  Company Name
                </div>
                
                <div 
                  style={{ 
                    fontSize: '11pt',
                    margin: '0 0 6pt 0',
                    color: '#000000',
                    lineHeight: '1.4'
                  }}
                >
                  Keep this step consistent with above approach
                </div>
              </div>
              
              <ul style={{ margin: '0', paddingLeft: '18pt', listStyleType: 'disc' }}>
                <li style={{ fontSize: '11pt', margin: '3pt 0', color: '#000000', lineHeight: '1.4' }}>
                  By reviewing the job description for the <u>position</u> you are applying for, how can you articulate your prior experiences to be as applicable as possible to the job you are pursuing?
                </li>
                <li style={{ fontSize: '11pt', margin: '3pt 0', color: '#000000', lineHeight: '1.4' }}>
                  Have you listed key performance indicators to show how successful you were? (i.e., cold calls made per day, percentage of sales increased, amount of cost savings)
                </li>
              </ul>
            </div>

            <div style={{ marginBottom: '16pt' }}>
              <div style={{ marginBottom: '6pt' }}>
                <div 
                  style={{ 
                    fontSize: '11pt',
                    fontWeight: 'bold',
                    margin: '0 0 2pt 0',
                    color: '#000000'
                  }}
                >
                  Job Title – mm/yy to mm/yy
                </div>
                <div 
                  style={{ 
                    fontSize: '11pt',
                    margin: '0 0 6pt 0',
                    color: '#000000',
                    fontStyle: 'italic'
                  }}
                >
                  Company Name
                </div>
                
                <div 
                  style={{ 
                    fontSize: '11pt',
                    margin: '0 0 6pt 0',
                    color: '#000000',
                    lineHeight: '1.4'
                  }}
                >
                  Keep this step consistent with above approach
                </div>
              </div>
              
              <ul style={{ margin: '0', paddingLeft: '18pt', listStyleType: 'disc' }}>
                <li style={{ fontSize: '11pt', margin: '3pt 0', color: '#000000', lineHeight: '1.4' }}>
                  Make sure to not cut out any prior jobs that might not seem relevant as this could be confusing and be seen as large gap in employment to employers
                </li>
                <li style={{ fontSize: '11pt', margin: '3pt 0', color: '#000000', lineHeight: '1.4' }}>
                  Time to add a couple more details below and you will be application ready!
                </li>
              </ul>
            </div>
          </>
        )}
      </section>

      {/* Education Section */}
      <section style={{ marginBottom: '20pt' }}>
        <h2 
          style={{ 
            fontSize: '12pt',
            fontWeight: 'bold',
            margin: '0 0 12pt 0',
            color: '#000000',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '2pt'
          }}
        >
          EDUCATION
        </h2>
        
        {education.length > 0 ? education.map((edu, index) => (
          <div key={edu.id} style={{ marginBottom: '8pt' }}>
            <div 
              style={{ 
                fontSize: '11pt',
                fontWeight: 'bold',
                margin: '0',
                color: '#000000',
                textTransform: 'uppercase'
              }}
            >
              {edu.degree} / {edu.institution} / {edu.graduationYear}
            </div>
            {coursesAndCertifications.length > 0 && (
              <div 
                style={{ 
                  fontSize: '11pt',
                  fontWeight: 'bold',
                  margin: '4pt 0 0 0',
                  color: '#000000',
                  textTransform: 'uppercase'
                }}
              >
                TRAINING OR CERTIFICATION / {coursesAndCertifications[0]?.provider || 'INSTITUTION'} / {coursesAndCertifications[0]?.date || 'YYYY'}
              </div>
            )}
          </div>
        )) : (
          <div style={{ marginBottom: '8pt' }}>
            <div 
              style={{ 
                fontSize: '11pt',
                fontWeight: 'bold',
                margin: '0',
                color: '#000000',
                textTransform: 'uppercase'
              }}
            >
              DEGREE IN MAJOR / INSTITUTION / YYYY
            </div>
            <div 
              style={{ 
                fontSize: '11pt',
                fontWeight: 'bold',
                margin: '4pt 0 0 0',
                color: '#000000',
                textTransform: 'uppercase'
              }}
            >
              TRAINING OR CERTIFICATION / INSTITUTION / YYYY
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ClassicResumeTemplate;
