
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Briefcase, MapPin, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PersonalInfoBarProps {
  onInfoChange?: (info: PersonalInfo) => void;
  initialInfo?: PersonalInfo;
}

export interface PersonalInfo {
  name: string;
  jobTitle: string;
  location: string;
  email: string;
  phone: string;
}

const PersonalInfoBar: React.FC<PersonalInfoBarProps> = ({ 
  onInfoChange,
  initialInfo = { 
    name: "", 
    jobTitle: "", 
    location: "", 
    email: "", 
    phone: "" 
  }
}) => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(initialInfo);
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (field: keyof PersonalInfo, value: string) => {
    // Validate email field if it's being changed
    if (field === "email" && value && !validateEmail(value)) {
      toast({
        title: "Invalid Email Format",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
    }

    const updatedInfo = { ...personalInfo, [field]: value };
    setPersonalInfo(updatedInfo);
    if (onInfoChange) {
      onInfoChange(updatedInfo);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Add your contact and personal details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                placeholder="John Doe"
                className="pl-9"
                value={personalInfo.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title <span className="text-sm text-muted-foreground">(Optional)</span></Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="jobTitle"
                placeholder="Frontend Developer"
                className="pl-9"
                value={personalInfo.jobTitle}
                onChange={(e) => handleChange("jobTitle", e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="location"
                placeholder="New York, NY"
                className="pl-9"
                value={personalInfo.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                placeholder="john@example.com"
                className="pl-9"
                type="email"
                value={personalInfo.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                placeholder="(123) 456-7890"
                className="pl-9"
                value={personalInfo.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoBar;
