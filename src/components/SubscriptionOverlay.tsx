
import React from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface SubscriptionOverlayProps {
  onClose: () => void;
}

const SubscriptionOverlay: React.FC<SubscriptionOverlayProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="mr-2 h-5 w-5 text-resume-primary" />
            Unlock Premium Features
          </CardTitle>
          <CardDescription>
            Subscribe to access all premium features and export your ATS-optimized resume
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-bold mb-2">Pro Plan - $12.99/month</h3>
              <ul className="text-sm space-y-2">
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-resume-success" />
                  Unlimited resume exports
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-resume-success" />
                  AI-powered content polish
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-resume-success" />
                  Advanced ATS optimization
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-resume-success" />
                  No watermarks on exports
                </li>
              </ul>
              <Button className="w-full mt-4">Subscribe Now</Button>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-bold mb-2">Enterprise Plan - $29.99/month</h3>
              <ul className="text-sm space-y-2">
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-resume-success" />
                  All Pro features
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-resume-success" />
                  Team collaboration
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-resume-success" />
                  API access
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-resume-success" />
                  Priority support
                </li>
              </ul>
              <Button className="w-full mt-4">Contact Sales</Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={onClose}>
            Continue with Free Plan
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default SubscriptionOverlay;
