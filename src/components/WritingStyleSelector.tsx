
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { List, FileText } from "lucide-react";

interface WritingStyleSelectorProps {
  value: "bullet" | "paragraph";
  onChange: (value: "bullet" | "paragraph") => void;
  className?: string;
}

const WritingStyleSelector: React.FC<WritingStyleSelectorProps> = ({
  value,
  onChange,
  className = ""
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium">Writing Style</Label>
      <RadioGroup
        value={value}
        onValueChange={(newValue) => onChange(newValue as "bullet" | "paragraph")}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="bullet" id="bullet-style" />
          <Label htmlFor="bullet-style" className="cursor-pointer flex items-center">
            <List className="h-4 w-4 mr-1" /> Bullet Points
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="paragraph" id="paragraph-style" />
          <Label htmlFor="paragraph-style" className="cursor-pointer flex items-center">
            <FileText className="h-4 w-4 mr-1" /> Paragraph
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default WritingStyleSelector;
