
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
      <div className="text-center mb-6">
        {personalInfo.name && (
          <h1 className="font-bold text-gray-900 mb-2" style={{ fontSize: '24pt' }}>
            {personalInfo.name}
          </h1>
        )}
        
        <div className="flex flex-wrap justify-center items-center gap-2 text-gray-700" style={{ fontSize: '12pt' }}>
          {personalInfo.jobTitle && (
            <span>{personalInfo.jobTitle}</span>
          )}
          {personalInfo.jobTitle && (personalInfo.location || personalInfo.email || personalInfo.phone) && (
            <span>•</span>
          )}
          {personalInfo.location && (
            <span>{personalInfo.location}</span>
          )}
          {personalInfo.location && (personalInfo.email || personalInfo.phone) && (
            <span>•</span>
          )}
          {personalInfo.email && (
            <span>{personalInfo.email}</span>
          )}
          {personalInfo.email && personalInfo.phone && (
            <span>•</span>
          )}
          {personalInfo.phone && (
            <span>{personalInfo.phone}</span>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {summary && (
        <div className="mb-6">
          <h2 className="font-bold text-gray-900 mb-3 underline" style={{ fontSize: '16pt' }}>
            Summary
          </h2>
          <p className="text-gray-700 leading-relaxed" style={{ fontSize: '12pt' }}>
            {summary}
          </p>
        </div>
      )}

      {/* Work Experience */}
      {workExperience.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-gray-900 mb-3 underline" style={{ fontSize: '16pt' }}>
            Experience
          </h2>
          {workExperience.map((job, index) => (
            <div key={job.id} className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900" style={{ fontSize: '14pt' }}>
                    {job.jobTitle} - {job.company}
                  </h3>
                </div>
                <div className="text-right text-gray-600 italic" style={{ fontSize: '12pt' }}>
                  <p>{job.startDate} - {job.endDate}</p>
                </div>
              </div>
              
              {job.responsibilities.length > 0 && (
                <div className="text-gray-700 ml-4" style={{ fontSize: '12pt' }}>
                  {job.responsibilityFormat === 'paragraph' ? (
                    <p className="leading-relaxed">{job.responsibilities[0]}</p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1">
                      {job.responsibilities.map((responsibility, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {responsibility}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-gray-900 mb-3 underline" style={{ fontSize: '16pt' }}>
            Education
          </h2>
          {education.map((edu, index) => (
            <div key={edu.id} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900" style={{ fontSize: '14pt' }}>
                    {edu.degree}
                  </h3>
                  <p className="text-gray-700" style={{ fontSize: '12pt' }}>
                    {edu.institution}
                  </p>
                  {edu.gpa && (
                    <p className="text-gray-600" style={{ fontSize: '12pt' }}>
                      GPA: {edu.gpa}
                    </p>
                  )}
                </div>
                <div className="text-right text-gray-600 italic" style={{ fontSize: '12pt' }}>
                  <p>{edu.graduationYear}</p>
                  {edu.location && <p>{edu.location}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Courses and Certifications */}
      {coursesAndCertifications.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-gray-900 mb-3 underline" style={{ fontSize: '16pt' }}>
            Certifications & Courses
          </h2>
          {coursesAndCertifications.map((course, index) => (
            <div key={course.id} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900" style={{ fontSize: '14pt' }}>
                    {course.title}
                  </h3>
                  <p className="text-gray-700" style={{ fontSize: '12pt' }}>
                    {course.provider}
                  </p>
                  {course.description && (
                    <p className="text-gray-600 mt-1" style={{ fontSize: '12pt' }}>
                      {course.description}
                    </p>
                  )}
                </div>
                <div className="text-gray-600 italic" style={{ fontSize: '12pt' }}>
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
