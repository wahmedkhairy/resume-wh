
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
  responsibilityFormat?: 'bullets' | 'paragraph';
  experienceType?: 'internship' | 'full-time' | 'remote';
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
  // Fixed summary text when empty
  const displaySummary = summary || "Generate your professional summary using AI by clicking the 'Generate Summary' button.";

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg relative" style={{ fontFamily: 'Times New Roman, serif' }}>
      {watermark && (
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <div className="text-6xl font-bold text-gray-400 rotate-45">
            ResumeWH.com
          </div>
        </div>
      )}
      
      {/* Header Section */}
      <div className="text-center mb-8">
        {personalInfo.name && (
          <h1 className="font-bold text-black mb-3" style={{ fontSize: '20pt' }}>
            {personalInfo.name}
          </h1>
        )}
        
        <div className="text-black mb-2" style={{ fontSize: '12pt' }}>
          {personalInfo.jobTitle && personalInfo.location && (
            <span>{personalInfo.jobTitle} | {personalInfo.location}</span>
          )}
          {personalInfo.jobTitle && !personalInfo.location && (
            <span>{personalInfo.jobTitle}</span>
          )}
          {!personalInfo.jobTitle && personalInfo.location && (
            <span>{personalInfo.location}</span>
          )}
        </div>
        
        <div className="text-black" style={{ fontSize: '12pt' }}>
          {personalInfo.email && personalInfo.phone && (
            <span>{personalInfo.email} | {personalInfo.phone}</span>
          )}
          {personalInfo.email && !personalInfo.phone && (
            <span>{personalInfo.email}</span>
          )}
          {!personalInfo.email && personalInfo.phone && (
            <span>{personalInfo.phone}</span>
          )}
        </div>
      </div>

      {/* Summary Section - Always show */}
      <div className="mb-8">
        <h2 className="font-bold text-black mb-3 border-b border-black" style={{ fontSize: '14pt' }}>
          Summary
        </h2>
        <div className="text-black leading-relaxed" style={{ fontSize: '12pt' }}>
          {displaySummary}
        </div>
      </div>

      {/* Experience Section */}
      {workExperience.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold text-black mb-3 border-b border-black" style={{ fontSize: '14pt' }}>
            Experience
          </h2>
          {workExperience.map((job, index) => (
            <div key={job.id} className="mb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-black" style={{ fontSize: '14pt' }}>
                    {job.jobTitle} - {job.company}
                  </h3>
                </div>
              </div>
              
              <div className="text-black italic mb-3" style={{ fontSize: '12pt' }}>
                {job.startDate} - {job.endDate}
              </div>
              
              {job.responsibilities.length > 0 && (
                <div className="text-black" style={{ fontSize: '12pt' }}>
                  {job.responsibilityFormat === 'paragraph' ? (
                    <div className="leading-relaxed">{job.responsibilities[0]}</div>
                  ) : (
                    <div className="space-y-1">
                      {job.responsibilities.map((responsibility, idx) => (
                        <div key={idx} className="leading-relaxed">
                          {responsibility}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education Section */}
      {education.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold text-black mb-3 border-b border-black" style={{ fontSize: '14pt' }}>
            Education
          </h2>
          {education.map((edu, index) => (
            <div key={edu.id} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-black" style={{ fontSize: '14pt' }}>
                    {edu.degree}
                  </h3>
                  <p className="text-black" style={{ fontSize: '12pt' }}>
                    {edu.institution}
                  </p>
                  {edu.gpa && (
                    <p className="text-black" style={{ fontSize: '12pt' }}>
                      GPA: {edu.gpa}
                    </p>
                  )}
                </div>
                <div className="text-right text-black italic" style={{ fontSize: '12pt' }}>
                  <p>{edu.graduationYear}</p>
                  {edu.location && <p>{edu.location}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Courses and Certifications Section */}
      {coursesAndCertifications.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-black mb-3 border-b border-black" style={{ fontSize: '14pt' }}>
            Certifications & Courses
          </h2>
          {coursesAndCertifications.map((course, index) => (
            <div key={course.id} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-black" style={{ fontSize: '14pt' }}>
                    {course.title}
                  </h3>
                  <p className="text-black" style={{ fontSize: '12pt' }}>
                    {course.provider}
                  </p>
                  {course.description && (
                    <p className="text-black mt-1" style={{ fontSize: '12pt' }}>
                      {course.description}
                    </p>
                  )}
                </div>
                <div className="text-black italic" style={{ fontSize: '12pt' }}>
                  <p>{course.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassicResumeTemplate;
