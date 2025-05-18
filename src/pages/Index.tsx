
import React, { useState } from "react";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import SectionEditor from "@/components/SectionEditor";
import ResumePreview from "@/components/ResumePreview";
import ATSScanner from "@/components/ATSScanner";
import KeywordMatcher from "@/components/KeywordMatcher";
import SubscriptionOverlay from "@/components/SubscriptionOverlay";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const Index = () => {
  const [showSubscription, setShowSubscription] = useState(false);

  const handleExport = () => {
    setShowSubscription(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <Navigation />
      
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Editor */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex justify-between items-center">
                <h1 className="text-xl font-bold">Resume Editor</h1>
                <Button onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Resume
                </Button>
              </div>
              
              <SectionEditor
                title="Professional Summary"
                description="A brief overview of your professional background and key strengths"
                placeholder="Experienced software developer with expertise in..."
                initialContent="Passionate frontend developer with 5+ years of experience building responsive web applications using React, TypeScript, and modern CSS frameworks. Committed to creating exceptional user experiences through clean, efficient code and intuitive design."
              />
              
              <SectionEditor
                title="Work Experience"
                description="List your work history in reverse chronological order"
                placeholder="Job title, company, date range, and responsibilities..."
                initialContent="Senior Frontend Developer - Tech Solutions Inc.\nJanuary 2020 - Present\n\n- Led development of company's flagship SaaS product using React and TypeScript\n- Improved application performance by 40% through code optimization and efficient state management\n- Collaborated with UX designers to implement responsive interfaces across all devices\n- Mentored junior developers and conducted code reviews to ensure code quality"
              />
              
              <KeywordMatcher />
            </div>
            
            {/* Right Column - Preview & ATS */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-4">ATS Preview</h2>
                <div className="border rounded-lg h-[500px] overflow-auto bg-white">
                  <ResumePreview watermark={true} />
                </div>
              </div>
              
              <ATSScanner />
            </div>
          </div>
        </div>
      </main>
      
      {showSubscription && (
        <SubscriptionOverlay onClose={() => setShowSubscription(false)} />
      )}
    </div>
  );
};

export default Index;
