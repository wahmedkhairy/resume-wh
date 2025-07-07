
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
        description="Upload your resume and get instant feedback on its ATS compatibility. Our free scanner analyzes format, keywords, and structure to help you optimize for applicant tracking systems."
        canonicalUrl="https://resumewh.com/free-ats-scanner"
        keywords="free resume maker, ATS resume builder, best ATS-friendly resume template 2025, optimize resume keywords for finance jobs"
        ogTitle="Free ATS Scanner - Test Your Resume for ATS Compatibility"
        ogDescription="Upload your resume and get instant feedback on its ATS compatibility. Our free scanner analyzes format, keywords, and structure."
        ogUrl="https://resumewh.com/free-ats-scanner"
        twitterTitle="Free ATS Scanner - Test Your Resume for ATS Compatibility"
        twitterDescription="Upload your resume and get instant feedback on its ATS compatibility."
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
