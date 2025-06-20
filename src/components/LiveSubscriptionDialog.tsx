
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface LiveSubscriptionDialogProps {
  children: React.ReactNode;
}

const LiveSubscriptionDialog: React.FC<LiveSubscriptionDialogProps> = ({ children }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/subscription");
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
    </div>
  );
};

export default LiveSubscriptionDialog;
