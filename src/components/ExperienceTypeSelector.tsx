
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExperienceTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ExperienceTypeSelector: React.FC<ExperienceTypeSelectorProps> = ({
  value,
  onChange
}) => {
  const handleValueChange = (newValue: string) => {
    // Prevent any potential form submission or navigation
    onChange(newValue);
  };

  return (
    <div onClick={(e) => e.preventDefault()}>
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger 
          className="w-full"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <SelectValue placeholder="Select experience type" />
        </SelectTrigger>
        <SelectContent 
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <SelectItem value="full-time">Full Time Job</SelectItem>
          <SelectItem value="remote">Remote Job</SelectItem>
          <SelectItem value="internship">Internship</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ExperienceTypeSelector;
