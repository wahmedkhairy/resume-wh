import SEOHead from "@/components/SEOHead";

// Add this at the top of your NotFound component:
<SEOHead 
  title="Page Not Found - Resume Builder | 404 Error"
  description="The page you're looking for doesn't exist. Return to Resume Builder to create ATS-optimized resumes."
  canonicalUrl="/404"
  noindex={true}
/>
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft, Search, Home } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Track 404 errors for analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', '404_error', {
        page_path: location.pathname,
        page_location: window.location.href
      });
    }
  }, [location.pathname]);

  const suggestedPages = [
    { title: "Resume Builder", path: "/", description: "Create your professional resume" },
    { title: "Free ATS Scanner", path: "/free-ats-scanner", description: "Test your resume's ATS compatibility" },
    { title: "Sign In", path: "/auth", description: "Access your account" },
    { title: "Subscription Plans", path: "/subscription", description: "Upgrade your account" }
  ];

  return (
    <>
      <SEOHead
        title="Page Not Found - Resume Builder"
        description="The page you're looking for doesn't exist. Explore our resume builder, ATS scanner, and other tools to create the perfect resume."
        canonicalUrl="https://resumewh.com/404"
        noindex={true}
        nofollow={true}
      />
      
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
            <FileText className="h-20 w-20 text-resume-primary" />
          </div>
          
          <h1 className="text-6xl font-bold mb-4 text-resume-primary">404</h1>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Oops! This page doesn't exist
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            We couldn't find the page you were looking for. Let's get you back to building that perfect resume.
          </p>
          
          {/* Quick action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild className="flex items-center">
              <a href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </a>
            </Button>
            
            <Button asChild variant="outline" className="flex items-center">
              <a href="/free-ats-scanner">
                <Search className="mr-2 h-4 w-4" />
                Try ATS Scanner
              </a>
            </Button>
          </div>
          
          {/* Suggested pages */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Popular Pages
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedPages.map((page, index) => (
                <a
                  key={index}
                  href={page.path}
                  className="text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-resume-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {page.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {page.description}
                  </p>
                </a>
              ))}
            </div>
          </div>
          
          {/* Help text */}
          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            <p>If you believe this is an error, please contact our support team.</p>
            <p className="mt-2">
              Searched URL: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                {location.pathname}
              </code>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
