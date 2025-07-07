
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
      
      {/* Header - Exact format from image */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">{personalInfo.name || "Your Name"}</h1>
        <p className="text-lg text-black mb-3">{personalInfo.jobTitle || "Job Title"} | {personalInfo.location || "Location"}</p>
        <p className="text-base text-black">{personalInfo.email || "email@example.com"} | {personalInfo.phone || "Phone Number"}</p>
      </div>

      {/* Summary Section - Exact format from image */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-black mb-2 border-b-2 border-black pb-1">Summary</h2>
        <p className="text-base text-black leading-relaxed">
          {summary || "Generate your professional summary using AI by clicking the 'Generate Summary' button."}
        </p>
      </div>

      {/* Experience Section - Exact format from image */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-black mb-4 border-b-2 border-black pb-1">Experience</h2>
        {workExperience.length > 0 ? workExperience.map((exp) => (
          <div key={exp.id} className="mb-6">
            <div className="mb-2">
              <h3 className="text-lg font-bold text-black">{exp.jobTitle || "Job Title"} - {exp.company || "Company Name"}</h3>
              {exp.experienceType && (
                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded ml-2">
                  {getExperienceTypeDisplay(exp.experienceType)}
                </span>
              )}
              <p className="text-base text-black italic">{exp.startDate || "Start"} - {exp.endDate || "End"}</p>
            </div>
            
            {exp.responsibilities && exp.responsibilities.length > 0 && (
              <div className="ml-0">
                {exp.writingStyle === "paragraph" ? (
                  <p className="text-base text-black leading-relaxed">
                    {formatResponsibilities(exp.responsibilities, exp.writingStyle)}
                  </p>
                ) : (
                  <ul className="list-none space-y-1">
                    {(formatResponsibilities(exp.responsibilities, exp.writingStyle) as string[]).map((resp: string, index: number) => (
                      resp.trim() && <li key={index} className="text-base text-black">• {resp.trim()}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )) : (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-black">Senior Frontend Developer - Tech Solutions Inc.</h3>
            <p className="text-base text-black italic">January 2020 - Present</p>
            <ul className="list-none space-y-1 mt-2">
              <li className="text-base text-black">• Led development of company's flagship SaaS product using React and TypeScript</li>
              <li className="text-base text-black">• Improved application performance by <strong>40%</strong> through code optimization and efficient state management</li>
              <li className="text-base text-black">• Collaborated with cross-functional teams to deliver high-quality user experiences</li>
            </ul>
          </div>
        )}
      </div>

      {/* Education Section - Exact format from image */}
      {education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-black mb-4 border-b-2 border-black pb-1">Education</h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-4">
              <h3 className="text-lg font-bold text-black">{edu.degree || "Degree"}</h3>
              <p className="text-base text-black">{edu.institution || "Institution"} - {edu.graduationYear || "Year"}</p>
              <p className="text-base text-black">{edu.location || "Location"}</p>
              {edu.gpa && <p className="text-base text-black">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Courses & Certifications Section */}
      {coursesAndCertifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-black mb-4 border-b-2 border-black pb-1">Courses & Certifications</h2>
          {coursesAndCertifications.map((course) => (
            <div key={course.id} className="mb-4">
              <div className="mb-1">
                <h3 className="text-lg font-bold text-black">{course.title || "Course/Certification Title"}</h3>
                <p className="text-base text-black">{course.provider || "Provider"} - {course.date || "Date"}</p>
              </div>
              
              {course.description && (
                <div className="ml-0">
                  {course.writingStyle === "bullets" && course.description.includes("•") ? (
                    <ul className="list-none space-y-1">
                      {(formatDescription(course.description, course.writingStyle) as string[]).map((point: string, index: number) => (
                        point.trim() && <li key={index} className="text-base text-black">• {point.trim()}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-base text-black leading-relaxed">{course.description}</p>
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
