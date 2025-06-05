
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
  const getSkillColor = (level: number) => {
    if (level >= 80) return "bg-green-500";
    if (level >= 60) return "bg-blue-500";
    if (level >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div 
      className="resume-container bg-white p-8 shadow-lg relative min-h-[800px]" 
      style={{ fontFamily: 'Georgia, serif' }}
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
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {personalInfo.name || "Your Name"}
        </h1>
        <h2 className="text-xl text-gray-600 mb-4">
          {personalInfo.jobTitle || "Your Job Title"}
        </h2>
        <div className="text-gray-600 space-y-1">
          {personalInfo.location && <p>{personalInfo.location}</p>}
          {personalInfo.email && <p>{personalInfo.email}</p>}
          {personalInfo.phone && <p>{personalInfo.phone}</p>}
        </div>
      </div>

      {/* Professional Summary */}
      {summary && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
            Professional Summary
          </h3>
          <p className="text-gray-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Work Experience */}
      {workExperience.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
            Professional Experience
          </h3>
          {workExperience.map((job) => (
            <div key={job.id} className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-800">{job.jobTitle}</h4>
                  <p className="text-gray-600">{job.company}</p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>{job.startDate} - {job.endDate}</p>
                  <p>{job.location}</p>
                </div>
              </div>
              {job.responsibilities.length > 0 && (
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  {job.responsibilities
                    .filter(resp => resp.trim())
                    .map((responsibility, index) => (
                    <li key={index} className="text-sm">{responsibility}</li>
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
          <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
            Education
          </h3>
          {education.map((edu) => (
            <div key={edu.id} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-800">{edu.degree}</h4>
                  <p className="text-gray-600">{edu.institution}</p>
                  {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>{edu.graduationYear}</p>
                  <p>{edu.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
            Skills
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {skills.map((skill) => (
              <div key={skill.id} className="flex items-center">
                <span className="w-32 text-sm text-gray-700 font-medium">
                  {skill.name}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-3 ml-4">
                  <div
                    className={`h-3 rounded-full ${getSkillColor(skill.level)}`}
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-xs text-gray-600 w-8">
                  {skill.level}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Courses and Certifications */}
      {coursesAndCertifications.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
            Courses & Certifications
          </h3>
          {coursesAndCertifications.map((item) => (
            <div key={item.id} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-800">{item.title}</h4>
                  <p className="text-gray-600">{item.provider}</p>
                  {item.description && (
                    <p className="text-sm text-gray-700 mt-1">{item.description}</p>
                  )}
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>{item.date}</p>
                  <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded capitalize">
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
