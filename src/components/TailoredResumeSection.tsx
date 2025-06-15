
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TailoredResumeGenerator from "./TailoredResumeGenerator";
import TailoredResumeHistory from "./TailoredResumeHistory";

interface TailoredResumeSectionProps {
  resumeData: any;
  currentUserId: string;
  isPremiumUser: boolean;
  currentSubscription: any;
  onTailoredResumeGenerated: (tailoredData: any) => void;
}

const TailoredResumeSection: React.FC<TailoredResumeSectionProps> = ({
  resumeData,
  currentUserId,
  isPremiumUser,
  currentSubscription,
  onTailoredResumeGenerated,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Targeted Job Resume Generator</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Transform your resume for specific job applications. Our AI analyzes job descriptions 
          and targets your content to highlight the most relevant experience and skills.
        </p>
      </div>

      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generator">Generate Targeted Resume</TabsTrigger>
          <TabsTrigger value="history">My Targeted Resumes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generator" className="space-y-6">
          <TailoredResumeGenerator
            resumeData={resumeData}
            currentUserId={currentUserId}
            isPremiumUser={isPremiumUser}
            currentSubscription={currentSubscription}
            onTailoredResumeGenerated={onTailoredResumeGenerated}
          />
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <TailoredResumeHistory
            currentUserId={currentUserId}
            onLoadTailoredResume={onTailoredResumeGenerated}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TailoredResumeSection;
