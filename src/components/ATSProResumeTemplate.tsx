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
  writingStyle?: "bullet" | "paragraph";
}

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string;
  startDate: string;
  endDate: string;
  url?: string;
  writingStyle?: "bullet" | "paragraph";
}

interface ATSProResumeTemplateProps {
  watermark?: boolean;
  personalInfo: PersonalInfo;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  coursesAndCertifications: Course[];
  projects: Project[];
}

const ATSProResumeTemplate: React.FC<ATSProResumeTemplateProps> = ({
  watermark = false,
  personalInfo,
  summary,
  workExperience,
  education,
  coursesAndCertifications,
  projects,
}) => {
  const renderProjectDescription = (description: string, writingStyle?: "bullet" | "paragraph") => {
    if (!description.trim()) return null;

    if (writingStyle === "paragraph") {
      return (
        <div 
          style={{ 
            fontSize: '11pt',
            margin: '6pt 0 0 0',
            color: '#000000',
            lineHeight: '1.2'
          }}
        >
          {description}
        </div>
      );
    }

    // For bullet points, split description by line breaks
    const lines = description.split('\n').filter(line => line.trim());
    const bulletPoints: string[] = [];
    
    lines.forEach(line => {
      const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
      if (cleanLine) {
        bulletPoints.push(cleanLine);
      }
    });

    if (!bulletPoints.length) return null;

    return (
      <ul style={{ margin: '6pt 0 0 0', paddingLeft: '18pt', listStyleType: 'disc' }}>
        {bulletPoints.map((point, index) => (
          <li 
            key={index}
            style={{ 
              fontSize: '11pt',
              margin: '3pt 0',
              color: '#000000',
              lineHeight: '1.2'
            }}
          >
            {point}
          </li>
        ))}
      </ul>
    );
  };

  const renderCourseDescription = (description: string, writingStyle?: "bullet" | "paragraph") => {
    if (!description.trim()) return null;

    if (writingStyle === "paragraph") {
      return (
        <div 
          style={{ 
            fontSize: '11pt',
            margin: '6pt 0 0 0',
            color: '#000000',
            lineHeight: '1.2'
          }}
        >
          {description}
        </div>
      );
    }

    // For bullet points, split description by line breaks
    const lines = description.split('\n').filter(line => line.trim());
    const bulletPoints: string[] = [];
    
    lines.forEach(line => {
      const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
      if (cleanLine) {
        bulletPoints.push(cleanLine);
      }
    });

    if (!bulletPoints.length) return null;

    return (
      <ul style={{ margin: '6pt 0 0 0', paddingLeft: '18pt', listStyleType: 'disc' }}>
        {bulletPoints.map((point, index) => (
          <li 
            key={index}
            style={{ 
              fontSize: '11pt',
              margin: '3pt 0',
              color: '#000000',
              lineHeight: '1.2'
            }}
          >
            {point}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div 
      className="ats-resume-container bg-white relative"
      style={{ 
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '11pt',
        lineHeight: '1.15',
        color: '#000000',
        padding: '0.5in',
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

      {/* Header Section - ATS Optimized */}
      <header style={{ marginBottom: '20pt' }}>
        <h1 
          style={{ 
            fontSize: '16pt',
            fontWeight: 'bold',
            margin: '0 0 8pt 0',
            textAlign: 'center',
            color: '#000000',
            textTransform: 'uppercase',
            letterSpacing: '1pt'
          }}
        >
          {personalInfo.name || "FULL NAME"}
        </h1>
        
        {personalInfo.jobTitle && (
          <div 
            style={{ 
              fontSize: '12pt',
              margin: '0 0 12pt 0',
              textAlign: 'center',
              color: '#000000'
            }}
          >
            {personalInfo.jobTitle}
          </div>
        )}
        
        <div 
          style={{ 
            fontSize: '11pt',
            textAlign: 'center',
            color: '#000000',
            lineHeight: '1.2'
          }}
        >
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.phone && personalInfo.email && <span> | </span>}
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {(personalInfo.phone || personalInfo.email) && personalInfo.location && <span> | </span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </header>

      {/* Professional Summary Section */}
      {summary && (
        <section style={{ marginBottom: '20pt' }}>
          <h2 
            style={{ 
              fontSize: '12pt',
              fontWeight: 'bold',
              margin: '0 0 8pt 0',
              color: '#000000',
              textTransform: 'uppercase',
              borderBottom: '1pt solid #000000',
              paddingBottom: '2pt'
            }}
          >
            PROFESSIONAL SUMMARY
          </h2>
          <div 
            style={{ 
              fontSize: '11pt',
              lineHeight: '1.3',
              textAlign: 'justify',
              margin: '0',
              color: '#000000'
            }}
          >
            {summary}
          </div>
        </section>
      )}

      {/* Professional Experience Section */}
      <section style={{ marginBottom: '20pt' }}>
        <h2 
          style={{ 
            fontSize: '12pt',
            fontWeight: 'bold',
            margin: '0 0 12pt 0',
            color: '#000000',
            textTransform: 'uppercase',
            borderBottom: '1pt solid #000000',
            paddingBottom: '2pt'
          }}
        >
          PROFESSIONAL EXPERIENCE
        </h2>
        
        {workExperience.length > 0 ? workExperience.map((job, index) => (
          <div key={job.id} style={{ marginBottom: '16pt' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4pt' }}>
              <div style={{ flex: 1 }}>
                <div 
                  style={{ 
                    fontSize: '11pt',
                    fontWeight: 'bold',
                    margin: '0',
                    color: '#000000'
                  }}
                >
                  {job.jobTitle}
                </div>
                <div 
                  style={{ 
                    fontSize: '11pt',
                    margin: '2pt 0',
                    color: '#000000'
                  }}
                >
                  {job.company}
                  {job.location && `, ${job.location}`}
                </div>
              </div>
              <div 
                style={{ 
                  fontSize: '11pt',
                  margin: '0',
                  color: '#000000',
                  fontWeight: 'bold'
                }}
              >
                {job.startDate} - {job.endDate}
              </div>
            </div>
            
            {job.responsibilities.length > 0 && (
              <ul style={{ margin: '6pt 0 0 0', paddingLeft: '18pt', listStyleType: 'disc' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4pt' }}>
              <div style={{ flex: 1 }}>
                <div 
                  style={{ 
                    fontSize: '11pt',
                    fontWeight: 'bold',
                    margin: '0',
                    color: '#000000'
                  }}
                >
                  Senior Frontend Developer
                </div>
                <div 
                  style={{ 
                    fontSize: '11pt',
                    margin: '2pt 0',
                    color: '#000000'
                  }}
                >
                  Tech Solutions Inc.
                </div>
              </div>
              <div 
                style={{ 
                  fontSize: '11pt',
                  margin: '0',
                  color: '#000000',
                  fontWeight: 'bold'
                }}
              >
                January 2020 - Present
              </div>
            </div>
            
            <ul style={{ margin: '6pt 0 0 0', paddingLeft: '18pt', listStyleType: 'disc' }}>
              <li 
                style={{ 
                  fontSize: '11pt',
                  margin: '3pt 0',
                  color: '#000000',
                  lineHeight: '1.2'
                }}
              >
                Led development of company's flagship SaaS product using React and TypeScript
              </li>
              <li 
                style={{ 
                  fontSize: '11pt',
                  margin: '3pt 0',
                  color: '#000000',
                  lineHeight: '1.2'
                }}
              >
                Improved application performance by 40% through code optimization
              </li>
              <li 
                style={{ 
                  fontSize: '11pt',
                  margin: '3pt 0',
                  color: '#000000',
                  lineHeight: '1.2'
                }}
              >
                Collaborated with cross-functional teams to deliver high-quality user experiences
              </li>
            </ul>
          </div>
        )}
      </section>

      {/* Projects Section */}
      {projects.length > 0 && (
        <section style={{ marginBottom: '20pt' }}>
          <h2 
            style={{ 
              fontSize: '12pt',
              fontWeight: 'bold',
              margin: '0 0 12pt 0',
              color: '#000000',
              textTransform: 'uppercase',
              borderBottom: '1pt solid #000000',
              paddingBottom: '2pt'
            }}
          >
            PROJECTS
          </h2>
          
          {projects.map((project, index) => (
            <div key={project.id} style={{ marginBottom: '16pt' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4pt' }}>
                <div style={{ flex: 1 }}>
                  <div 
                    style={{ 
                      fontSize: '11pt',
                      fontWeight: 'bold',
                      margin: '0',
                      color: '#000000'
                    }}
                  >
                    {project.title}
                  </div>
                  <div 
                    style={{ 
                      fontSize: '11pt',
                      margin: '2pt 0',
                      color: '#000000'
                    }}
                  >
                    {project.technologies}
                    {project.url && ` | ${project.url}`}
                  </div>
                </div>
                <div 
                  style={{ 
                    fontSize: '11pt',
                    margin: '0',
                    color: '#000000',
                    fontWeight: 'bold'
                  }}
                >
                  {project.startDate} - {project.endDate}
                </div>
              </div>
              
              {renderProjectDescription(project.description, project.writingStyle)}
            </div>
          ))}
        </section>
      )}

      {/* Courses & Certifications Section - Now only shows user data when available */}
      {coursesAndCertifications.length > 0 && (
        <section style={{ marginBottom: '20pt' }}>
          <h2 
            style={{ 
              fontSize: '12pt',
              fontWeight: 'bold',
              margin: '0 0 12pt 0',
              color: '#000000',
              textTransform: 'uppercase',
              borderBottom: '1pt solid #000000',
              paddingBottom: '2pt'
            }}
          >
            COURSES & CERTIFICATIONS
          </h2>
          
          {coursesAndCertifications.map((item, index) => (
            <div key={item.id} style={{ marginBottom: '16pt' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4pt' }}>
                <div style={{ flex: 1 }}>
                  <div 
                    style={{ 
                      fontSize: '11pt',
                      fontWeight: 'bold',
                      margin: '0',
                      color: '#000000'
                    }}
                  >
                    {item.title}
                  </div>
                  <div 
                    style={{ 
                      fontSize: '11pt',
                      margin: '2pt 0',
                      color: '#000000'
                    }}
                  >
                    {item.provider}
                  </div>
                </div>
                <div 
                  style={{ 
                    fontSize: '11pt',
                    margin: '0',
                    color: '#000000',
                    fontWeight: 'bold'
                  }}
                >
                  {item.date}
                </div>
              </div>
              
              {renderCourseDescription(item.description, item.writingStyle)}
            </div>
          ))}
        </section>
      )}

      {/* Education Section - Now only shows user data when available */}
      {education.length > 0 && (
        <section style={{ marginBottom: '20pt' }}>
          <h2 
            style={{ 
              fontSize: '12pt',
              fontWeight: 'bold',
              margin: '0 0 12pt 0',
              color: '#000000',
              textTransform: 'uppercase',
              borderBottom: '1pt solid #000000',
              paddingBottom: '2pt'
            }}
          >
            EDUCATION
          </h2>
          
          {education.map((edu, index) => (
            <div key={edu.id} style={{ marginBottom: '12pt' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div 
                    style={{ 
                      fontSize: '11pt',
                      fontWeight: 'bold',
                      margin: '0',
                      color: '#000000'
                    }}
                  >
                    {edu.degree}
                  </div>
                  <div 
                    style={{ 
                      fontSize: '11pt',
                      margin: '2pt 0',
                      color: '#000000'
                    }}
                  >
                    {edu.institution}
                    {edu.location && `, ${edu.location}`}
                  </div>
                  {edu.gpa && (
                    <div 
                      style={{ 
                        fontSize: '11pt',
                        margin: '2pt 0',
                        color: '#000000'
                      }}
                    >
                      GPA: {edu.gpa}
                    </div>
                  )}
                </div>
                <div 
                  style={{ 
                    fontSize: '11pt',
                    margin: '0',
                    color: '#000000',
                    fontWeight: 'bold'
                  }}
                >
                  {edu.graduationYear}
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default ATSProResumeTemplate;
