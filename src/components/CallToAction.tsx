import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Crown, Download, Zap, CheckCircle, Clock, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LiveSubscriptionDialog from "./LiveSubscriptionDialog";

interface CallToActionProps {
  variant?: 'export' | 'upgrade' | 'start' | 'success';
  title?: string;
  description?: string;
  primaryAction?: string;
  secondaryAction?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  showBenefits?: boolean;
  urgency?: boolean;
  className?: string;
}

const CallToAction: React.FC<CallToActionProps> = ({
  variant = 'start',
  title,
  description,
  primaryAction,
  secondaryAction,
  onPrimaryClick,
  onSecondaryClick,
  showBenefits = true,
  urgency = false,
  className = ""
}) => {
  const { toast } = useToast();

  const getVariantConfig = () => {
    switch (variant) {
      case 'export':
        return {
          icon: Download,
          title: title || "Ready to Export Your Professional Resume?",
          description: description || "Download your ATS-optimized resume in PDF or Word format and start applying to your dream jobs today.",
          primaryAction: primaryAction || "Export Resume",
          secondaryAction: secondaryAction || "Preview First",
          bgGradient: "from-blue-50 to-indigo-50",
          iconColor: "text-blue-600",
          benefits: [
            "ATS-compatible formatting",
            "Professional design",
            "Multiple file formats"
          ]
        };
      
      case 'upgrade':
        return {
          icon: Crown,
          title: title || "Unlock Premium Features",
          description: description || "Get unlimited exports, AI-powered optimizations, and priority support to land your dream job faster.",
          primaryAction: primaryAction || "Upgrade Now",
          secondaryAction: secondaryAction || "View Plans",
          bgGradient: "from-yellow-50 to-orange-50",
          iconColor: "text-yellow-600",
          benefits: [
            "Unlimited resume exports",
            "AI-powered optimization",
            "Premium templates",
            "Priority support"
          ]
        };
      
      case 'success':
        return {
          icon: CheckCircle,
          title: title || "Your Resume is Ready!",
          description: description || "Congratulations! Your professional resume has been optimized and is ready to help you land interviews.",
          primaryAction: primaryAction || "Download Now",
          secondaryAction: secondaryAction || "Make Changes",
          bgGradient: "from-green-50 to-emerald-50",
          iconColor: "text-green-600",
          benefits: [
            "85%+ ATS compatibility",
            "Keyword optimized",
            "Professional formatting"
          ]
        };
      
      default: // 'start'
        return {
          icon: Zap,
          title: title || "Create Your Professional Resume in Minutes",
          description: description || "Build an ATS-optimized resume that gets noticed by recruiters and hiring managers. Join thousands of successful job seekers.",
          primaryAction: primaryAction || "Start Building",
          secondaryAction: secondaryAction || "See Examples",
          bgGradient: "from-purple-50 to-pink-50",
          iconColor: "text-purple-600",
          benefits: [
            "ATS-optimized templates",
            "Real-time optimization",
            "Expert guidance"
          ]
        };
    }
  };

  const config = getVariantConfig();

  const handlePrimaryClick = () => {
    console.log(`CallToAction: ${variant} primary button clicked`);
    
    if (onPrimaryClick) {
      onPrimaryClick();
    } else {
      // Default actions based on variant
      switch (variant) {
        case 'export':
          toast({
            title: "Export Started",
            description: "Your resume export is being prepared...",
          });
          break;
        case 'success':
          toast({
            title: "Download Started",
            description: "Your optimized resume is being downloaded...",
          });
          break;
        case 'start':
          window.scrollTo({ top: 0, behavior: 'smooth' });
          toast({
            title: "Let's Get Started!",
            description: "Begin building your professional resume above.",
          });
          break;
        default:
          toast({
            title: "Action Triggered",
            description: "Your request is being processed...",
          });
      }
    }
  };

  const handleSecondaryClick = () => {
    console.log(`CallToAction: ${variant} secondary button clicked`);
    
    if (onSecondaryClick) {
      onSecondaryClick();
    } else {
      // Default secondary actions
      toast({
        title: "Feature Coming Soon",
        description: "This feature will be available shortly!",
      });
    }
  };

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${config.bgGradient} opacity-50`} />
      <CardContent className="relative p-8">
        <div className="text-center space-y-6">
          {/* Icon and Urgency Badge */}
          <div className="flex flex-col items-center gap-3">
            <div className={`p-3 rounded-full bg-white shadow-sm ${config.iconColor}`}>
              <config.icon className="h-8 w-8" />
            </div>
            {urgency && (
              <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                <Clock className="h-3 w-3 mr-1" />
                Limited Time
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-gray-900">{config.title}</h3>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {config.description}
            </p>
          </div>

          {/* Benefits */}
          {showBenefits && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
              {config.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            {variant === 'upgrade' ? (
              <LiveSubscriptionDialog>
                <Button size="lg" className="font-semibold bg-blue-600 hover:bg-blue-700">
                  <Crown className="mr-2 h-4 w-4" />
                  {config.primaryAction}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </LiveSubscriptionDialog>
            ) : (
              <Button 
                size="lg" 
                onClick={handlePrimaryClick}
                className="font-semibold"
              >
                {variant === 'export' && <Download className="mr-2 h-4 w-4" />}
                {variant === 'success' && <CheckCircle className="mr-2 h-4 w-4" />}
                {variant === 'start' && <Zap className="mr-2 h-4 w-4" />}
                {config.primaryAction}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            
            {config.secondaryAction && (
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleSecondaryClick}
                className="font-medium"
              >
                {config.secondaryAction}
              </Button>
            )}
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500 pt-4">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>2,500+ Success Stories</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>78% Interview Rate</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>2 Min Setup</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallToAction;
