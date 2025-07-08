
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
  writingStyle?: "bullet" | "paragraph";
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
  coursesAndCertifications
}) => {
  const formatResponsibilities = (responsibilities: string[], writingStyle: "bullet" | "paragraph" = "bullet") => {
    const filteredResponsibilities = responsibilities.filter(resp => resp.trim());
    
    if (filteredResponsibilities.length === 0) return null;
    
    if (writingStyle === "paragraph") {
      // Join all responsibilities into a single paragraph
      const combinedText = filteredResponsibilities.join('. ').replace(/\.\./g, '.');
      return <p className="text-sm text-gray-700 leading-relaxed">{combinedText}</p>;
    } else {
      // Display as bullet points, but handle cases where user already added bullets
      return (
        <ul className="text-sm text-gray-700 space-y-1">
          {filteredResponsibilities.map((responsibility, index) => {
            // Clean up the responsibility text and handle existing bullets
            let cleanText = responsibility.trim();
            // Remove existing bullet points or dashes at the start
            cleanText = cleanText.replace(/^[•\-\*\+]\s*/, '');
            
            return (
              <li key={index} className="flex items-start">
                <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></span>
                <span className="leading-relaxed">{cleanText}</span>
              </li>
            );
          })}
        </ul>
      );
    }
  };

  const formatDescription = (description: string, writingStyle: "bullet" | "paragraph" = "bullet") => {
    if (!description.trim()) return null;
    
    if (writingStyle === "paragraph") {
      return <p className="text-sm text-gray-700 leading-relaxed">{description}</p>;
    } else {
      // Split by lines or bullet points for bullet format
      const lines = description.split(/\n|•/).filter(line => line.trim());
      
      if (lines.length === 1) {
        // Single line, display as paragraph
        return <p className="text-sm text-gray-700 leading-relaxed">{description}</p>;
      }
      
      return (
        <ul className="text-sm text-gray-700 space-y-1">
          {lines.map((line, index) => {
            const cleanText = line.trim().replace(/^[•\-\*\+]\s*/, '');
            if (!cleanText) return null;
            
            return (
              <li key={index} className="flex items-start">
                <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></span>
                <span className="leading-relaxed">{cleanText}</span>
              </li>
            );
          }).filter(Boolean)}
        </ul>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg relative overflow-hidden" style={{ minHeight: '11in' }}>
      {watermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-gray-200 text-6xl font-bold transform rotate-45 opacity-20">
            RESUME BUILDER
          </div>
        </div>
      )}
      
      <div className="p-8 relative z-20">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-200 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {personalInfo.name || "Your Name"}
          </h1>
          {personalInfo.jobTitle && (
            <h2 className="text-xl text-gray-600 mb-3">{personalInfo.jobTitle}</h2>
          )}
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-600">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
          </div>
        </div>

        {/* Professional Summary */}
        {summary && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-3">
              PROFESSIONAL SUMMARY
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Work Experience */}
        {workExperience.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">
              PROFESSIONAL EXPERIENCE
            </h3>
            <div className="space-y-4">
              {workExperience.map((job) => (
                <div key={job.id} className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">{job.jobTitle}</h4>
                      <p className="text-gray-600 font-medium">{job.company}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>{job.startDate} - {job.endDate}</p>
                      {job.location && <p>{job.location}</p>}
                    </div>
                  </div>
                  {formatResponsibilities(job.responsibilities, job.writingStyle)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">
              EDUCATION
            </h3>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800">{edu.degree}</h4>
                    <p className="text-gray-600">{edu.institution}</p>
                    {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>{edu.graduationYear}</p>
                    {edu.location && <p>{edu.location}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Courses & Certifications */}
        {coursesAndCertifications.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">
              COURSES & CERTIFICATIONS
            </h3>
            <div className="space-y-3">
              {coursesAndCertifications.map((course) => (
                <div key={course.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h4 className="font-semibold text-gray-800">{course.title}</h4>
                      <p className="text-gray-600">{course.provider}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>{course.date}</p>
                    </div>
                  </div>
                  {course.description && (
                    <div className="mt-2">
                      {formatDescription(course.description, course.writingStyle)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassicResumeTemplate;
