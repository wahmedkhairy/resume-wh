
import React from "react";
import NewSubscriptionDialog from "./NewSubscriptionDialog";

interface LiveSubscriptionDialogProps {
  children: React.ReactNode;
}

const LiveSubscriptionDialog: React.FC<LiveSubscriptionDialogProps> = ({ children }) => {
  return <NewSubscriptionDialog>{children}</NewSubscriptionDialog>;
};

export default LiveSubscriptionDialog;
