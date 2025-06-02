
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PersonalInfo } from "./PersonalInfoBar";
import { Edit3, Check, X } from "lucide-react";

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

interface ResumePreviewProps {
  watermark?: boolean;
  personalInfo?: PersonalInfo;
  summary?: string;
  workExperience?: WorkExperience[];
  education?: Education[];
  skills?: Array<{id: string; name: string; level: number}>;
  coursesAndCertifications?: Array<{
    id: string;
    title: string;
    provider: string;
    date: string;
    description: string;
    type: "course" | "certification";
  }>;
  onSummaryChange?: (summary: string) => void;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ 
  watermark = true,
  personalInfo = {
    name: "John Doe",
    jobTitle: "Frontend Developer",
    location: "New York, NY",
    email: "john@example.com",
    phone: "(123) 456-7890"
  },
  summary,
  workExperience = [],
  education = [],
  skills,
  coursesAndCertifications,
  onSummaryChange
}) => {
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState(summary || "");

  const handleSaveSum = () => {
    if (onSummaryChange) {
      onSummaryChange(editedSummary);
    }
    setIsEditingSummary(false);
  };

  const handleCancelEdit = () => {
    setEditedSummary(summary || "");
    setIsEditingSummary(false);
  };

  // Dynamic title logic for Courses & Certifications
  const getCoursesAndCertificationsTitle = () => {
    if (!coursesAndCertifications || coursesAndCertifications.length === 0) {
      return "Courses & Certifications";
    }
    
    const hasCourses = coursesAndCertifications.some(item => item.type === "course");
    const hasCertifications = coursesAndCertifications.some(item => item.type === "certification");
    
    if (hasCourses && hasCertifications) {
      return "Courses & Certifications";
    } else if (hasCourses) {
      return "Courses";
    } else if (hasCertifications) {
      return "Certifications";
    }
    
    return "Courses & Certifications";
  };

  return (
    <Card className="h-full relative bg-white">
      <CardContent className="p-6 resume-container text-black h-full">
        {watermark && (
          <div className="watermark absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl text-gray-200 font-bold opacity-20 rotate-45 pointer-events-none">
            DEMO
          </div>
        )}
        
        <div className="resume-content relative z-10">
          <h1 className="text-2xl font-bold text-center mb-2 text-black">{personalInfo.name}</h1>
          <p className="text-center text-black mb-4">
            {personalInfo.jobTitle} | {personalInfo.location} | {personalInfo.email} | {personalInfo.phone}
          </p>
          
          {/* Summary Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-black font-bold text-lg border-b border-black pb-1 flex-1">Summary</h2>
              {summary && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditedSummary(summary);
                    setIsEditingSummary(true);
                  }}
                  className="ml-2"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
            </div>
            {isEditingSummary ? (
              <div className="space-y-2">
                <Textarea
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  className="min-h-[100px] text-black"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveSum}>
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mb-4 text-black">
                {summary || "Generate your professional summary using AI by clicking the 'Generate Summary' button."}
              </p>
            )}
          </div>
          
          {/* Experience Section */}
          <div className="mb-4">
            <h2 className="text-black font-bold text-lg border-b border-black pb-1 mb-2">Experience</h2>
            {workExperience && workExperience.length > 0 ? (
              <div className="mb-4 text-black">
                {workExperience.map((job) => (
                  <div key={job.id} className="mb-3">
                    <h3 className="font-semibold text-black">{job.jobTitle} - {job.company}</h3>
                    <p className="text-sm text-black">{job.startDate} - {job.endDate} | {job.location}</p>
                    <ul className="pl-5 list-disc mt-1">
                      {job.responsibilities.filter(resp => resp.trim()).map((responsibility, i) => (
                        <li key={i} className="text-black">
                          {responsibility}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-4 text-black">
                <h3 className="font-semibold text-black">Senior Frontend Developer - Tech Solutions Inc.</h3>
                <p className="text-sm text-black">January 2020 - Present</p>
                <ul className="pl-5 list-disc mt-1 text-black">
                  <li className="text-black">Led development of company's flagship SaaS product using React and TypeScript</li>
                  <li className="text-black">Improved application performance by <span className="font-semibold text-black">40%</span> through code optimization and efficient state management</li>
                  <li className="text-black">Collaborated with UX designers to implement responsive interfaces across all devices</li>
                  <li className="text-black">Mentored junior developers and conducted code reviews to ensure code quality</li>
                </ul>
                
                <h3 className="font-semibold mt-3 text-black">Frontend Developer - Digital Agency XYZ</h3>
                <p className="text-sm text-black">June 2018 - December 2019</p>
                <ul className="pl-5 list-disc mt-1 text-black">
                  <li className="text-black">Developed and maintained websites for 15+ clients using React, Vue and vanilla JavaScript</li>
                  <li className="text-black">Implemented CI/CD pipelines resulting in <span className="font-semibold text-black">30% faster</span> deployment times</li>
                  <li className="text-black">Created custom analytics dashboard that increased client retention by 25%</li>
                </ul>
              </div>
            )}
          </div>
          
          {/* Skills section - only shown when skills are provided */}
          {skills && skills.length > 0 && (
            <div className="mb-4">
              <h2 className="text-black font-bold text-lg border-b border-black pb-1 mb-2">Skills</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {skills.map(skill => (
                  <div key={skill.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-black">{skill.name}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-green-500 h-1.5 rounded-full" 
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Education section - always shown */}
          <div className="mb-4">
            <h2 className="text-black font-bold text-lg border-b border-black pb-1 mb-2">Education</h2>
            <div className="text-black">
              {education && education.length > 0 ? (
                education.map((edu) => (
                  <div key={edu.id} className="mb-2">
                    <h3 className="font-semibold text-black">{edu.degree}</h3>
                    <p className="text-sm text-black">{edu.institution} - {edu.graduationYear}</p>
                    {edu.location && <p className="text-sm text-black">{edu.location}</p>}
                    {edu.gpa && <p className="text-sm text-black">GPA: {edu.gpa}</p>}
                  </div>
                ))
              ) : (
                <div>
                  <h3 className="font-semibold text-black">Bachelor of Science in Computer Science</h3>
                  <p className="text-sm text-black">New York University - 2018</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Courses & Certifications - only shown when available */}
          {(coursesAndCertifications && coursesAndCertifications.length > 0) && (
            <div className="mb-4">
              <h2 className="text-black font-bold text-lg border-b border-black pb-1 mb-2">{getCoursesAndCertificationsTitle()}</h2>
              <div className="space-y-2">
                {coursesAndCertifications.map(item => (
                  <div key={item.id} className="text-black">
                    <h3 className="font-semibold text-black">{item.title}</h3>
                    <p className="text-sm text-black">{item.provider} - {item.date}</p>
                    <p className="text-sm text-black">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumePreview;
