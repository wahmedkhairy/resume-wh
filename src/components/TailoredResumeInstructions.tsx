
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, CheckCircle, FileText, User, Briefcase, GraduationCap, Award, Target } from "lucide-react";

const TailoredResumeInstructions: React.FC = () => {
  const requiredInfo = [
    {
      icon: User,
      title: "Personal Information",
      description: "Complete your full name, email, phone, and location",
      location: "Personal Information section at the top of the editor",
      status: "required"
    },
    {
      icon: Briefcase,
      title: "Work Experience",
      description: "Add at least 1-2 relevant job positions with detailed responsibilities",
      location: "Work Experience section in the editor",
      status: "required"
    },
    {
      icon: GraduationCap,
      title: "Education Background",
      description: "Include your educational qualifications and degrees",
      location: "Education section in the editor",
      status: "required"
    },
    {
      icon: Award,
      title: "Skills & Certifications",
      description: "List your technical and soft skills, plus any certifications",
      location: "Skills and Courses & Certifications sections",
      status: "recommended"
    },
    {
      icon: FileText,
      title: "Professional Summary",
      description: "Write a brief summary of your professional background",
      location: "Summary section (auto-generated or custom)",
      status: "recommended"
    }
  ];

  const targetingTips = [
    "Include the complete job posting with requirements and responsibilities",
    "Copy the exact job title and key skills mentioned",
    "Add company information if available for better context",
    "Include preferred qualifications and nice-to-have skills",
    "Mention specific technologies, tools, or methodologies required"
  ];

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" />
          How to Create the Perfect Targeted Resume
        </CardTitle>
        <CardDescription>
          Follow these steps to ensure your resume is perfectly tailored to your target job
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: Complete Your Resume Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
            Complete Your Resume Information
          </h3>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Before generating a targeted resume, make sure all your information is complete in the resume editor on the left side of this page.
            </AlertDescription>
          </Alert>

          <div className="grid gap-3">
            {requiredInfo.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <item.icon className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{item.title}</span>
                    <Badge variant={item.status === 'required' ? 'destructive' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {item.description}
                  </p>
                  <p className="text-xs text-blue-600">
                    📍 Location: {item.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Prepare the Job Description */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
            Prepare the Complete Job Description
          </h3>
          
          <p className="text-sm text-muted-foreground">
            For the best results, provide the complete job posting in the "Job Description" text area below. Include:
          </p>
          
          <div className="grid gap-2">
            {targetingTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Generate and Review */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
            Generate and Review Your Targeted Resume
          </h3>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Pro Tip:</strong> After generating your targeted resume, review the changes in the preview on the right. 
              The AI will emphasize relevant experience, add matching keywords, and restructure content to align with the job requirements.
            </p>
          </div>
        </div>

        {/* What Gets Tailored */}
        <div className="space-y-3">
          <h4 className="font-medium text-green-700">✨ What Our AI Will Optimize:</h4>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p>• <strong>Keywords:</strong> Match important terms from the job posting</p>
            <p>• <strong>Experience:</strong> Highlight most relevant work experience</p>
            <p>• <strong>Skills:</strong> Emphasize skills mentioned in the job requirements</p>
            <p>• <strong>Summary:</strong> Rewrite to align with the target role</p>
            <p>• <strong>Achievements:</strong> Restructure bullet points for maximum impact</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TailoredResumeInstructions;
