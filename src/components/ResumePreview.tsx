
import React from 'react';
import { ResumeData } from '../types/ResumeTypes';

interface ResumePreviewProps {
  resumeData: ResumeData;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {resumeData.personalInfo.fullName || 'Your Name'}
          </h1>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            {resumeData.personalInfo.email && (
              <span>{resumeData.personalInfo.email}</span>
            )}
            {resumeData.personalInfo.phone && (
              <span>{resumeData.personalInfo.phone}</span>
            )}
            {resumeData.personalInfo.address && (
              <span>{resumeData.personalInfo.address}</span>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-600 mt-2">
            {resumeData.personalInfo.linkedin && (
              <a href={resumeData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            )}
            {resumeData.personalInfo.github && (
              <a href={resumeData.personalInfo.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            )}
          </div>
        </div>

        {/* Summary */}
        {resumeData.summary && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1">
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
          </div>
        )}

        {/* Skills */}
        {resumeData.skills.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {resumeData.workExperience.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">
              Work Experience
            </h2>
            <div className="space-y-4">
              {resumeData.workExperience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{exp.jobTitle}</h3>
                      <p className="text-gray-600">{exp.company}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{exp.startDate} - {exp.endDate}</p>
                      {exp.location && <p>{exp.location}</p>}
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 mt-2 leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {resumeData.projects.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">
              Projects
            </h2>
            <div className="space-y-4">
              {resumeData.projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Project →
                      </a>
                    )}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-2">{project.description}</p>
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {resumeData.education.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">
              Education
            </h2>
            <div className="space-y-3">
              {resumeData.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{edu.degree}</h3>
                      {edu.field && <p className="text-gray-600">{edu.field}</p>}
                      <p className="text-gray-600">{edu.school}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{edu.year}</p>
                      {edu.gpa && <p>GPA: {edu.gpa}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {resumeData.certifications.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">
              Certifications
            </h2>
            <div className="space-y-3">
              {resumeData.certifications.map((cert) => (
                <div key={cert.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{cert.name}</h3>
                      <p className="text-gray-600">{cert.issuer}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{cert.date}</p>
                      {cert.url && (
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Certificate →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
