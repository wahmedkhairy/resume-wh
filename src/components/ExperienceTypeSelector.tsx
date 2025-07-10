
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
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select experience type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="full-time">Full Time Job</SelectItem>
        <SelectItem value="remote">Remote Job</SelectItem>
        <SelectItem value="internship">Internship</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default ExperienceTypeSelector;
