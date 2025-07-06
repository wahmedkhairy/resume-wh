
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              ResumeWH - Professional Resume Builder
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Create <strong>ATS-optimized resumes</strong> with our AI-powered resume builder. 
              Build professional CVs that pass applicant tracking systems and get you hired faster. 
              Free resume templates for all career levels.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded">ATS Resume Builder</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">AI Resume Generator</span>
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Free CV Maker</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Resume Tools</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Online Resume Builder
                </Link>
              </li>
              <li>
                <Link to="/free-ats-scanner" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Free ATS Scanner
                </Link>
              </li>
              <li>
                <a href="/#tailor" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Targeted Resume Generator
                </a>
              </li>
              <li>
                <a href="/#ats" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  ATS Resume Checker
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a href="/#success-stories" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Resume Success Stories
                </a>
              </li>
              <li>
                <Link to="/subscription" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Resume Builder Pricing
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* SEO-rich bottom section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Professional Resume Builder for 2025</strong> - Create job-winning resumes with our 
              <span className="font-medium"> ATS-optimized templates</span>. Export to PDF and Word formats. 
              Perfect for freshers and experienced professionals seeking career advancement.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} ResumeWH.com. All rights reserved.
            </p>
            <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>🇪🇬 Egypt Resume Builder</span>
              <span>•</span>
              <span>💼 Professional CV Maker</span>
              <span>•</span>
              <span>🤖 AI-Powered</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
