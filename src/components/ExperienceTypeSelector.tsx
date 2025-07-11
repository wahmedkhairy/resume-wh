
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
  const handleSelectChange = (selectedValue: string) => {
    onChange(selectedValue);
  };

  return (
    <div className="w-full">
      <Select value={value} onValueChange={handleSelectChange}>
        <SelectTrigger 
          className="w-full"
          type="button"
          onPointerDown={(e) => e.preventDefault()}
        >
          <SelectValue placeholder="Select experience type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="full-time">Full Time Job</SelectItem>
          <SelectItem value="remote">Remote Job</SelectItem>
          <SelectItem value="internship">Internship</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ExperienceTypeSelector;