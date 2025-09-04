import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicySection: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Privacy Policy
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </CardHeader>
        
        <CardContent className="prose max-w-none space-y-6">
          <section>
            <h3 className="text-2xl font-semibold mb-4">Introduction</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Welcome to ResumeWH.com. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our resume building services.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">Information We Collect</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-medium mb-2">Personal Information</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We collect personal information that you voluntarily provide when creating your resume, including but not limited to your name, contact information, work experience, education, and skills.
                </p>
              </div>
              
              <div>
                <h4 className="text-xl font-medium mb-2">Usage Data</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We automatically collect certain information about your device and usage of our service, including IP address, browser type, operating system, and pages visited.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">How We Use Your Information</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>To provide and maintain our resume building service</li>
              <li>To process your account registration and manage your profile</li>
              <li>To generate and format your resume</li>
              <li>To provide customer support and respond to your inquiries</li>
              <li>To improve our services and user experience</li>
              <li>To send administrative information and service updates</li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">Data Security</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">Your Rights</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              You have the right to access, update, or delete your personal information. You may also request that we restrict or stop processing your data. To exercise these rights, please contact us using the information provided below.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">Contact Information</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              Email: resumebuilder.wh@gmail.com
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicySection;