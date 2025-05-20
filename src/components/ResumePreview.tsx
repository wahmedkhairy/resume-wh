
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PersonalInfo } from "./PersonalInfoBar";

interface ResumePreviewProps {
  watermark?: boolean;
  personalInfo?: PersonalInfo;
  summary?: string;
  experience?: string;
  education?: string;
  skills?: Array<{id: string; name: string; level: number}>;
  coursesAndCertifications?: Array<{
    id: string;
    title: string;
    provider: string;
    date: string;
    description: string;
    type: "course" | "certification";
  }>;
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
  experience,
  education,
  skills,
  coursesAndCertifications
}) => {
  return (
    <Card className="h-full relative overflow-auto bg-white">
      <CardContent className="p-6 resume-container text-black">
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
            <h2 className="text-black font-bold text-lg border-b border-gray-300 pb-1 mb-2">Summary</h2>
            <p className="mb-4 text-black">
              {summary || "Passionate frontend developer with 5+ years of experience building responsive web applications using React, TypeScript, and modern CSS frameworks. Committed to creating exceptional user experiences through clean, efficient code and intuitive design."}
            </p>
          </div>
          
          {/* Experience Section */}
          <div className="mb-4">
            <h2 className="text-black font-bold text-lg border-b border-gray-300 pb-1 mb-2">Experience</h2>
            {experience ? (
              <div className="mb-4 text-black">
                {experience.split('\n\n').map((job, index) => {
                  const lines = job.split('\n');
                  const title = lines[0] || '';
                  const period = lines[1] || '';
                  const details = lines.slice(2).filter(l => l.trim());
                  
                  return (
                    <div key={index} className="mb-3">
                      <h3 className="font-semibold text-black">{title}</h3>
                      <p className="text-sm text-black">{period}</p>
                      <ul className="pl-5 list-disc mt-1">
                        {details.map((detail, i) => (
                          <li key={i} className="text-black">
                            {detail.replace(/^- /, '')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mb-4 text-black">
                <h3 className="font-semibold text-black">Senior Frontend Developer - Tech Solutions Inc.</h3>
                <p className="text-sm text-black">January 2020 - Present</p>
                <ul className="pl-5 list-disc mt-1 text-black">
                  <li>Led development of company's flagship SaaS product using React and TypeScript</li>
                  <li>Improved application performance by <span className="ats-highlight">40%</span> through code optimization and efficient state management</li>
                  <li>Collaborated with UX designers to implement responsive interfaces across all devices</li>
                  <li>Mentored junior developers and conducted code reviews to ensure code quality</li>
                </ul>
                
                <h3 className="font-semibold mt-3 text-black">Frontend Developer - Digital Agency XYZ</h3>
                <p className="text-sm text-black">June 2018 - December 2019</p>
                <ul className="pl-5 list-disc mt-1 text-black">
                  <li>Developed and maintained websites for 15+ clients using React, Vue and vanilla JavaScript</li>
                  <li>Implemented CI/CD pipelines resulting in <span className="ats-highlight">30% faster</span> deployment times</li>
                  <li>Created custom analytics dashboard that increased client retention by 25%</li>
                </ul>
              </div>
            )}
          </div>
          
          {/* Skills section - only shown when skills are provided */}
          {skills && skills.length > 0 && (
            <div className="mb-4">
              <h2 className="text-black font-bold text-lg border-b border-gray-300 pb-1 mb-2">Skills</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {skills.map(skill => (
                  <div key={skill.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-black">{skill.name}</span>
                      <span className="font-medium text-black">{skill.level}%</span>
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
            <h2 className="text-black font-bold text-lg border-b border-gray-300 pb-1 mb-2">Education</h2>
            <div className="text-black">
              {education ? (
                education.split('\n\n').map((edu, index) => {
                  const lines = edu.split('\n');
                  const degree = lines[0] || '';
                  const details = lines.slice(1);
                  
                  return (
                    <div key={index} className="mb-2">
                      <h3 className="font-semibold text-black">{degree}</h3>
                      {details.map((detail, i) => (
                        <p key={i} className="text-sm text-black">{detail}</p>
                      ))}
                    </div>
                  );
                })
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
              <h2 className="text-black font-bold text-lg border-b border-gray-300 pb-1 mb-2">Courses & Certifications</h2>
              <div className="space-y-2">
                {coursesAndCertifications.map(item => (
                  <div key={item.id}>
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
