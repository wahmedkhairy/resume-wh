
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="text-gray-600">
          <p className="font-semibold mb-2">ResumeWH.com</p>
          <p>Professional Resume Builder - Create ATS-optimized resumes that get you hired faster</p>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
          <p className="mt-4 text-sm">&copy; 2025 ResumeWH.com. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
