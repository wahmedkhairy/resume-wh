
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface RedirectRule {
  from: string;
  to: string;
  permanent?: boolean;
}

interface RedirectHandlerProps {
  redirectRules: RedirectRule[];
}

const RedirectHandler: React.FC<RedirectHandlerProps> = ({ redirectRules }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    const matchingRule = redirectRules.find(rule => rule.from === currentPath);
    
    if (matchingRule) {
      // For permanent redirects (301), we use replace to avoid back button issues
      navigate(matchingRule.to, { replace: matchingRule.permanent !== false });
    }
  }, [location.pathname, navigate, redirectRules]);

  return null; // This component doesn't render anything
};

export default RedirectHandler;
