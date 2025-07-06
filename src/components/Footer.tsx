
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Resume Tools */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Resume Tools</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Online Resume Builder</li>
              <li>Free ATS Scanner</li>
              <li>Targeted Resume Generator</li>
              <li>ATS Resume Checker</li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Resume Success Stories</li>
              <li>Resume Builder Pricing</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
            <div className="text-gray-600">
              <p>Egypt Resume Builder</p>
              <p>Professional CV Maker</p>
              <p>AI-Powered Resume Generator</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-600">
          <p>&copy; 2025 ResumeWH.com. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
