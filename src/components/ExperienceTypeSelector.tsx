
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

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="w-full" onClick={(e) => e.stopPropagation()}>
      <Select value={value} onValueChange={handleSelectChange}>
        <SelectTrigger 
          className="w-full"
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
          asChild={false}
          role="combobox"
          aria-expanded={false}
          tabIndex={0}
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
};

export default ExperienceTypeSelector;