import SEOHead from "@/components/SEOHead";

// Add this at the top of your FreeATSScanner component:
<SEOHead 
  title="Free ATS Resume Scanner - Check Resume ATS Compatibility | Resume Builder"
  description="Free ATS resume scanner and checker. Test if your resume passes applicant tracking systems. Get instant ATS compatibility score and optimization tips."
  canonicalUrl="/free-ats-scanner"
  keywords="free ATS resume scan, ATS resume checker, check if resume passes ATS, optimize resume for ATS, resume scanner online"
/>
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import FreeATSScanner from "@/components/FreeATSScanner";

const FreeATSScannerPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <SEOHead
        title="Free ATS Scanner - Test Your Resume for ATS Compatibility"
        description="Free ATS resume scan and checker to evaluate your resume's ATS compatibility. Our online resume scanner tests if your resume passes ATS with an ATS score calculator."
        canonicalUrl="https://resumewh.com/free-ats-scanner"
        keywords="free resume maker, ATS resume builder, best ATS-friendly resume template 2025, optimize resume keywords for finance jobs, ATS resume checker, free ATS resume scan, resume scanner online, ATS score calculator, is my resume ATS-friendly, ATS compatibility test"
        ogTitle="Free ATS Scanner - Test Your Resume for ATS Compatibility"
        ogDescription="Upload your resume for a free ATS compatibility test. Our resume scanner checks if your resume passes ATS and provides an ATS score with improvement suggestions."
        ogUrl="https://resumewh.com/free-ats-scanner"
        twitterTitle="Free ATS Scanner - Test Your Resume for ATS Compatibility"
        twitterDescription="Free ATS resume scan to check if your resume passes applicant tracking systems. AI-powered resume check with instant feedback."
      />
      <Header />
      
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">🆓 Free ATS Scanner</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Upload your resume and get instant feedback on its ATS compatibility. 
                Our scanner analyzes format, keywords, and structure to help you improve your chances of getting through applicant tracking systems.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <FreeATSScanner />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FreeATSScannerPage;
