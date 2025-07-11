
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
    <div className="w-full">
      <Select 
        value={value} 
        onValueChange={onChange}
        onOpenChange={(open) => {
          if (open) {
            // Prevent any scrolling when opening
            document.body.style.overflow = 'hidden';
          } else {
            document.body.style.overflow = 'auto';
          }
        }}
      >
        <SelectTrigger 
          className="w-full"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onFocus={(e) => {
            e.preventDefault();
            e.currentTarget.blur();
          }}
        >
          <SelectValue placeholder="Select experience type" />
        </SelectTrigger>
        <SelectContent 
          position="popper"
          sideOffset={5}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            document.body.style.overflow = 'auto';
          }}
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