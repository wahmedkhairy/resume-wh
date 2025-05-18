
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ResumePreviewProps {
  watermark?: boolean;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ watermark = true }) => {
  return (
    <Card className="h-full relative overflow-hidden">
      <CardContent className="p-6 resume-container">
        {watermark && (
          <div className="watermark">DEMO</div>
        )}
        
        <div className="resume-content">
          <h1 className="text-2xl font-bold text-center mb-2">John Doe</h1>
          <p className="text-center text-gray-600 mb-4">Frontend Developer | New York, NY | john@example.com | (123) 456-7890</p>
          
          <h2>Summary</h2>
          <p>
            Passionate frontend developer with 5+ years of experience building responsive web applications using
            React, TypeScript, and modern CSS frameworks. Committed to creating exceptional user experiences
            through clean, efficient code and intuitive design.
          </p>
          
          <h2>Experience</h2>
          <h3>Senior Frontend Developer - Tech Solutions Inc.</h3>
          <p className="text-sm text-gray-600">January 2020 - Present</p>
          <ul>
            <li>Led development of company's flagship SaaS product using React and TypeScript</li>
            <li>Improved application performance by <span className="ats-highlight">40%</span> through code optimization and efficient state management</li>
            <li>Collaborated with UX designers to implement responsive interfaces across all devices</li>
            <li>Mentored junior developers and conducted code reviews to ensure code quality</li>
          </ul>
          
          <h3>Frontend Developer - Digital Agency XYZ</h3>
          <p className="text-sm text-gray-600">June 2018 - December 2019</p>
          <ul>
            <li>Developed and maintained websites for 15+ clients using React, Vue and vanilla JavaScript</li>
            <li>Implemented CI/CD pipelines resulting in <span className="ats-highlight">30% faster</span> deployment times</li>
            <li>Created custom analytics dashboard that increased client retention by 25%</li>
          </ul>
          
          <h2>Education</h2>
          <h3>Bachelor of Science in Computer Science</h3>
          <p className="text-sm text-gray-600">New York University - 2018</p>
          
          <h2>Skills</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>React</span>
                <span>85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>TypeScript</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "75%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CSS/Tailwind</span>
                <span>90%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: "90%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Next.js</span>
                <span>80%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "80%" }}></div>
              </div>
            </div>
          </div>
          
          <h2>Courses & Certifications</h2>
          <div className="space-y-2">
            <div>
              <h3>AWS Certified Solutions Architect</h3>
              <p className="text-sm text-gray-600">Amazon Web Services - 2023</p>
              <p className="text-sm">Professional certification for designing distributed systems on AWS</p>
            </div>
            <div>
              <h3>Advanced React Development</h3>
              <p className="text-sm text-gray-600">Frontend Masters - 2024</p>
              <p className="text-sm">Comprehensive course covering advanced React patterns, hooks, and performance optimization</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumePreview;
