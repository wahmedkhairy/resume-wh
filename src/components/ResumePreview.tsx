
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

interface Skill {
  id: string;
  name: string;
  level: number;
}

interface Course {
  id: string;
  title: string;
  provider: string;
  date: string;
  description: string;
  type: "course" | "certification";
}

interface ResumePreviewProps {
  watermark?: boolean;
  personalInfo: PersonalInfo;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  coursesAndCertifications: Course[];
  onSummaryChange?: (summary: string) => void;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({
  watermark = false,
  personalInfo,
  summary,
  workExperience,
  education,
  skills,
  coursesAndCertifications,
}) => {
  return (
    <div 
      className="resume-container bg-white p-8 shadow-lg relative min-h-[800px]" 
      style={{ fontFamily: 'Arial, sans-serif' }}
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

      {/* Header */}
      <div className="mb-6 pb-4 border-b-2 border-blue-600">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {personalInfo.name || "Your Name"}
        </h1>
        <h2 className="text-xl text-blue-600 mb-3">
          {personalInfo.jobTitle || "Your Job Title"}
        </h2>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {personalInfo.location && <span>📍 {personalInfo.location}</span>}
          {personalInfo.email && <span>✉️ {personalInfo.email}</span>}
          {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
        </div>
      </div>

      {/* Professional Summary */}
      {summary && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-blue-600 mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
            Professional Summary
          </h3>
          <p className="text-gray-700 leading-relaxed text-justify">{summary}</p>
        </div>
      )}

      {/* Work Experience */}
      {workExperience.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-blue-600 mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
            Professional Experience
          </h3>
          {workExperience.map((job) => (
            <div key={job.id} className="mb-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{job.jobTitle}</h4>
                  <p className="text-blue-600 font-semibold">{job.company}</p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p className="font-medium">{job.startDate} - {job.endDate}</p>
                  <p>{job.location}</p>
                </div>
              </div>
              {job.responsibilities.length > 0 && (
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  {job.responsibilities
                    .filter(resp => resp.trim())
                    .map((responsibility, index) => (
                    <li key={index} className="text-sm leading-relaxed">{responsibility}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-blue-600 mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
            Education
          </h3>
          {education.map((edu) => (
            <div key={edu.id} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-900">{edu.degree}</h4>
                  <p className="text-blue-600 font-semibold">{edu.institution}</p>
                  {edu.gpa && <p className="text-sm text-gray-600 mt-1">GPA: {edu.gpa}</p>}
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p className="font-medium">{edu.graduationYear}</p>
                  <p>{edu.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Courses and Certifications */}
      {coursesAndCertifications.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-blue-600 mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
            Courses & Certifications
          </h3>
          {coursesAndCertifications.map((item) => (
            <div key={item.id} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-900">{item.title}</h4>
                  <p className="text-blue-600 font-semibold">{item.provider}</p>
                  {item.description && (
                    <p className="text-sm text-gray-700 mt-1">{item.description}</p>
                  )}
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p className="font-medium">{item.date}</p>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded capitalize mt-1">
                    {item.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumePreview;
