
import React from "react";

interface TailoredResumeNoticeProps {
  onSwitchToOriginal: () => void;
}

const TailoredResumeNotice: React.FC<TailoredResumeNoticeProps> = ({
  onSwitchToOriginal,
}) => {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-blue-900 dark:text-blue-100">Targeted Resume Active</h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            You're viewing a targeted version of your resume.
          </p>
        </div>
        <button
          onClick={onSwitchToOriginal}
          className="text-blue-600 hover:text-blue-800 text-sm underline"
        >
          Switch to Original
        </button>
      </div>
    </div>
  );
};

export default TailoredResumeNotice;
