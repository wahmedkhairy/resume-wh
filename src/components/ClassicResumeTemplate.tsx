
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
      <div className="text-center mb-6 border-b border-gray-300 pb-4">
        {personalInfo.name && (
          <h1 className="font-bold text-gray-900 mb-2" style={{ fontSize: '18pt' }}>
            {personalInfo.name}
          </h1>
        )}
        
        <div className="flex flex-wrap justify-center items-center gap-2 text-gray-700" style={{ fontSize: '11pt' }}>
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
          <h2 className="font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1" style={{ fontSize: '13pt' }}>
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-gray-700 leading-relaxed" style={{ fontSize: '11pt' }}>
            {summary}
          </p>
        </div>
      )}

      {/* Work Experience */}
      {workExperience.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1" style={{ fontSize: '13pt' }}>
            PROFESSIONAL EXPERIENCE
          </h2>
          {workExperience.map((job, index) => (
            <div key={job.id} className={`mb-4 ${index !== workExperience.length - 1 ? 'border-b border-gray-100 pb-4' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900" style={{ fontSize: '11pt' }}>
                    {job.jobTitle}
                    {job.experienceType && (
                      <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                        {job.experienceType === 'full-time' ? 'Full-time' : 
                         job.experienceType === 'internship' ? 'Internship' : 'Remote'}
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-700 font-medium" style={{ fontSize: '11pt' }}>
                    {job.company}
                  </p>
                </div>
                <div className="text-right text-gray-600" style={{ fontSize: '11pt' }}>
                  <p>{job.startDate} - {job.endDate}</p>
                  {job.location && <p>{job.location}</p>}
                </div>
              </div>
              
              {job.responsibilities.length > 0 && (
                <div className="text-gray-700" style={{ fontSize: '11pt' }}>
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
          <h2 className="font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1" style={{ fontSize: '13pt' }}>
            EDUCATION
          </h2>
          {education.map((edu, index) => (
            <div key={edu.id} className={`mb-3 ${index !== education.length - 1 ? 'border-b border-gray-100 pb-3' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900" style={{ fontSize: '11pt' }}>
                    {edu.degree}
                  </h3>
                  <p className="text-gray-700" style={{ fontSize: '11pt' }}>
                    {edu.institution}
                  </p>
                  {edu.gpa && (
                    <p className="text-gray-600" style={{ fontSize: '11pt' }}>
                      GPA: {edu.gpa}
                    </p>
                  )}
                </div>
                <div className="text-right text-gray-600" style={{ fontSize: '11pt' }}>
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
          <h2 className="font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1" style={{ fontSize: '13pt' }}>
            CERTIFICATIONS & COURSES
          </h2>
          {coursesAndCertifications.map((course, index) => (
            <div key={course.id} className={`mb-3 ${index !== coursesAndCertifications.length - 1 ? 'border-b border-gray-100 pb-3' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900" style={{ fontSize: '11pt' }}>
                    {course.title}
                  </h3>
                  <p className="text-gray-700" style={{ fontSize: '11pt' }}>
                    {course.provider}
                  </p>
                  {course.description && (
                    <p className="text-gray-600 mt-1" style={{ fontSize: '11pt' }}>
                      {course.description}
                    </p>
                  )}
                </div>
                <div className="text-gray-600" style={{ fontSize: '11pt' }}>
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
