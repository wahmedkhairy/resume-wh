import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfServiceSection: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Terms of Service
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </CardHeader>
        
        <CardContent className="prose max-w-none space-y-6">
          <section>
            <h3 className="text-2xl font-semibold mb-4">Acceptance of Terms</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              By accessing and using ResumeWH.com, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">Service Description</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              ResumeWH.com provides an online resume building platform that allows users to create, edit, and export professional resumes. Our service includes various templates, ATS optimization tools, and premium features.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">User Accounts</h3>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                To access certain features of our service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">Acceptable Use</h3>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                You agree not to use the service to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Upload false, misleading, or fraudulent information</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit harmful code or malicious software</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use the service for commercial purposes without authorization</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">Intellectual Property</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The service and its original content, features, and functionality are owned by ResumeWH.com and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">Payment Terms</h3>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                For premium services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>All fees are non-refundable unless otherwise stated</li>
                <li>Subscription fees are billed in advance on a recurring basis</li>
                <li>You may cancel your subscription at any time</li>
                <li>Price changes will be communicated in advance</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">Limitation of Liability</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              In no event shall ResumeWH.com be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses resulting from your use of the service.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">Termination</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users of the service, us, or third parties.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">Contact Information</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
              <br />
              Email: resumebuilder.wh@gmail.com
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsOfServiceSection;