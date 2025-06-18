
import React from "react";
import ATSScanner from "@/components/ATSScanner";
import ATSPerformanceTracker from "@/components/ATSPerformanceTracker";
import LiveATSSimulator from "@/components/LiveATSSimulator";
import CallToAction from "@/components/CallToAction";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ATSSectionProps {
  resumeData?: {
    personalInfo?: any;
    summary?: string;
    workExperience?: any[];
    education?: any[];
    skills?: any[];
    coursesAndCertifications?: any[];
  };
}

const ATSSection: React.FC<ATSSectionProps> = ({ resumeData }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">ATS Optimization Suite</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Maximize your job application success with our comprehensive ATS analysis tools. 
          Get real-time feedback and optimize your resume for any job posting.
        </p>
      </div>

      <Tabs defaultValue="simulator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="simulator">Live Simulator</TabsTrigger>
          <TabsTrigger value="analysis">ATS Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="simulator" className="space-y-6">
          <LiveATSSimulator resumeData={resumeData} />
          <CallToAction 
            variant="export" 
            urgency={true}
            className="mt-8"
          />
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-2xl font-bold mb-4">ATS Compatibility Overview</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-2">ATS Compatibility Score</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
                    <p className="text-sm text-muted-foreground">Your resume is ATS-friendly</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">Keyword Optimization</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">72%</div>
                    <p className="text-sm text-muted-foreground">Consider adding more relevant keywords</p>
                  </div>
                </div>
              </div>
              
              <ATSScanner resumeData={resumeData} />
            </div>
          </div>
          <CallToAction 
            variant="upgrade" 
            title="Get Advanced ATS Insights"
            description="Unlock detailed keyword analysis, industry-specific optimization, and real-time ATS simulation for unlimited job postings."
          />
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <ATSPerformanceTracker resumeData={resumeData} />
          <CallToAction 
            variant="success" 
            title="Optimize Your Performance"
            description="Your resume performance analysis is complete. Download your optimized resume and start applying with confidence."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ATSSection;
