
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
  experienceType?: "fulltime" | "remote" | "internship";
  writingStyle?: "bullets" | "paragraph";
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
  writingStyle?: "bullets" | "paragraph";
}

interface ClassicResumePreviewProps {
  watermark?: boolean;
  personalInfo: PersonalInfo;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  coursesAndCertifications: Course[];
}

const ClassicResumePreview: React.FC<ClassicResumePreviewProps> = ({
  watermark = false,
  personalInfo,
  summary,
  workExperience,
  education,
  coursesAndCertifications,
}) => {
  const getExperienceTypeDisplay = (type?: string) => {
    switch (type) {
      case "fulltime":
        return "Full Time";
      case "remote":
        return "Remote";
      case "internship":
        return "Internship";
      default:
        return "";
    }
  };

  const formatResponsibilities = (responsibilities: string[], writingStyle?: string) => {
    if (writingStyle === "paragraph") {
      return responsibilities[0] || "";
    }
    return responsibilities;
  };

  const formatDescription = (description: string, writingStyle?: string) => {
    if (writingStyle === "bullets" && description) {
      // Split by bullet points or newlines and format as list
      const points = description.split(/[•\n]/).filter(point => point.trim());
      return points;
    }
    return description;
  };

  return (
    <div className="bg-white p-8 shadow-sm relative min-h-[11in] max-w-[8.5in] mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      {watermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div 
            className="text-gray-200 text-6xl font-bold transform rotate-45 select-none"
            style={{ opacity: 0.1 }}
          >
            DEMO
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-gray-800 pb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">{personalInfo.name || "Your Name"}</h1>
        <p className="text-lg text-gray-600 mb-2">{personalInfo.jobTitle || "Job Title"}</p>
        <div className="text-sm text-gray-600 space-x-4">
          <span>{personalInfo.location || "Location"}</span>
          <span>•</span>
          <span>{personalInfo.email || "email@example.com"}</span>
          <span>•</span>
          <span>{personalInfo.phone || "Phone Number"}</span>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-400">PROFESSIONAL SUMMARY</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Work Experience */}
      {workExperience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-400">WORK EXPERIENCE</h2>
          {workExperience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{exp.jobTitle || "Job Title"}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-700">{exp.company || "Company Name"}</p>
                    {exp.experienceType && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {getExperienceTypeDisplay(exp.experienceType)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{exp.startDate || "Start"} - {exp.endDate || "End"}</p>
                  <p className="text-sm text-gray-600">{exp.location || "Location"}</p>
                </div>
              </div>
              
              {exp.responsibilities && exp.responsibilities.length > 0 && (
                <div className="ml-0 mt-2">
                  {exp.writingStyle === "paragraph" ? (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {formatResponsibilities(exp.responsibilities, exp.writingStyle)}
                    </p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1">
                      {(formatResponsibilities(exp.responsibilities, exp.writingStyle) as string[]).map((resp: string, index: number) => (
                        resp.trim() && <li key={index} className="text-sm text-gray-700">{resp.trim()}</li>
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
          <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-400">EDUCATION</h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{edu.degree || "Degree"}</h3>
                  <p className="text-sm text-gray-700">{edu.institution || "Institution"}</p>
                  <p className="text-sm text-gray-600">{edu.location || "Location"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{edu.graduationYear || "Year"}</p>
                  {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Courses & Certifications */}
      {coursesAndCertifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-400">COURSES & CERTIFICATIONS</h2>
          {coursesAndCertifications.map((course) => (
            <div key={course.id} className="mb-3">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{course.title || "Course/Certification Title"}</h3>
                  <p className="text-sm text-gray-700">{course.provider || "Provider"}</p>
                </div>
                <p className="text-sm text-gray-600">{course.date || "Date"}</p>
              </div>
              
              {course.description && (
                <div className="ml-0 mt-1">
                  {course.writingStyle === "bullets" && course.description.includes("•") ? (
                    <ul className="list-disc list-inside space-y-1">
                      {(formatDescription(course.description, course.writingStyle) as string[]).map((point: string, index: number) => (
                        point.trim() && <li key={index} className="text-sm text-gray-700">{point.trim()}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed">{course.description}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassicResumePreview;
