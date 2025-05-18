
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <FileText className="h-16 w-16 text-resume-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-resume-primary">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">Oops! This page doesn't exist</p>
        <p className="mb-8 text-gray-500">We couldn't find the page you were looking for. Let's get you back to resume building.</p>
        <Button asChild>
          <a href="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Dashboard
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
