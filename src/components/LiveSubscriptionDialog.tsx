
import React from "react";
import { useNavigate } from "react-router-dom";

interface LiveSubscriptionDialogProps {
  children: React.ReactNode;
}

const LiveSubscriptionDialog: React.FC<LiveSubscriptionDialogProps> = ({ children }) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/subscription");
  };

  return (
    <div onClick={handleClick} className="cursor-pointer w-full">
      {children}
    </div>
  );
};

export default LiveSubscriptionDialog;
