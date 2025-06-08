
import React from "react";

interface AntiTheftProtectionProps {
  isActive: boolean;
  userId: string;
  sessionId: string;
}

const AntiTheftProtection: React.FC<AntiTheftProtectionProps> = ({ 
  isActive, 
  userId, 
  sessionId 
}) => {
  if (!isActive) {
    return null;
  }

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10"
      data-anti-theft="true"
    >
      {/* Watermark */}
      <div className="watermark absolute inset-0 flex items-center justify-center opacity-10 select-none">
        <div className="text-6xl font-bold text-gray-500 transform rotate-45">
          DEMO VERSION
        </div>
      </div>
    </div>
  );
};

export default AntiTheftProtection;
