
import React from "react";

interface ExperienceTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ExperienceTypeSelector: React.FC<ExperienceTypeSelectorProps> = ({
  value,
  onChange
}) => {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(e.target.value);
  };

  return (
    <div className="w-full">
      <select
        value={value}
        onChange={handleSelectChange}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
          backgroundPosition: 'right 0.5rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.5rem'
        }}
      >
        <option value="" disabled>
          Select experience type
        </option>
        <option value="full-time">Full Time Job</option>
        <option value="remote">Remote Job</option>
        <option value="internship">Internship</option>
      </select>
    </div>
  );
};

export default ExperienceTypeSelector;