
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface RedirectRule {
  from: string;
  to: string;
  permanent?: boolean;
  type?: 'exact' | 'prefix' | 'pattern';
}

interface RedirectHandlerProps {
  redirectRules?: RedirectRule[];
}

// Define comprehensive redirect rules to fix indexing issues
const DEFAULT_REDIRECT_RULES: RedirectRule[] = [
  // Handle common duplicate URL patterns
  { from: '/index.html', to: '/', permanent: true, type: 'exact' },
  { from: '/index.php', to: '/', permanent: true, type: 'exact' },
  { from: '/home', to: '/', permanent: true, type: 'exact' },
  { from: '/Home', to: '/', permanent: true, type: 'exact' },
  
  // Handle trailing slash inconsistencies (301 redirects)
  { from: '/auth/', to: '/auth', permanent: true, type: 'exact' },
  { from: '/free-ats-scanner/', to: '/free-ats-scanner', permanent: true, type: 'exact' },
  { from: '/subscription/', to: '/subscription', permanent: true, type: 'exact' },
  { from: '/terms-of-service/', to: '/terms-of-service', permanent: true, type: 'exact' },
  { from: '/privacy-policy/', to: '/privacy-policy', permanent: true, type: 'exact' },
  { from: '/payment-success/', to: '/payment-success', permanent: true, type: 'exact' },
  { from: '/payment-cancelled/', to: '/payment-cancelled', permanent: true, type: 'exact' },
  
  // Handle case sensitivity issues
  { from: '/AUTH', to: '/auth', permanent: true, type: 'exact' },
  { from: '/Auth', to: '/auth', permanent: true, type: 'exact' },
  { from: '/FREE-ATS-SCANNER', to: '/free-ats-scanner', permanent: true, type: 'exact' },
  { from: '/Free-ATS-Scanner', to: '/free-ats-scanner', permanent: true, type: 'exact' },
  { from: '/TERMS-OF-SERVICE', to: '/terms-of-service', permanent: true, type: 'exact' },
  { from: '/Terms-Of-Service', to: '/terms-of-service', permanent: true, type: 'exact' },
  { from: '/PRIVACY-POLICY', to: '/privacy-policy', permanent: true, type: 'exact' },
  { from: '/Privacy-Policy', to: '/privacy-policy', permanent: true, type: 'exact' },
  
  // Handle old URL patterns that might exist
  { from: '/resume-builder', to: '/', permanent: true, type: 'exact' },
  { from: '/ats-scanner', to: '/free-ats-scanner', permanent: true, type: 'exact' },
  { from: '/login', to: '/auth', permanent: true, type: 'exact' },
  { from: '/signup', to: '/auth', permanent: true, type: 'exact' },
  { from: '/register', to: '/auth', permanent: true, type: 'exact' },
  
  // Handle admin redirects - case sensitivity only
  { from: '/admin/', to: '/admin', permanent: true, type: 'exact' },
  { from: '/Admin', to: '/admin', permanent: true, type: 'exact' },
  { from: '/ADMIN', to: '/admin', permanent: true, type: 'exact' },
  
  // Handle payment page redirects
  { from: '/success', to: '/payment-success', permanent: true, type: 'exact' },
  { from: '/cancel', to: '/payment-cancelled', permanent: true, type: 'exact' },
  { from: '/cancelled', to: '/payment-cancelled', permanent: true, type: 'exact' },
];

const RedirectHandler: React.FC<RedirectHandlerProps> = ({ 
  redirectRules = DEFAULT_REDIRECT_RULES 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    const currentSearch = location.search;
    const fullCurrentPath = currentPath + currentSearch;
    
    console.log('RedirectHandler: Checking path:', fullCurrentPath);
    
    // Find matching redirect rule
    const matchingRule = redirectRules.find(rule => {
      switch (rule.type) {
        case 'prefix':
          return currentPath.startsWith(rule.from);
        case 'pattern':
          try {
            const regex = new RegExp(rule.from);
            return regex.test(currentPath);
          } catch {
            return false;
          }
        case 'exact':
        default:
          return rule.from === currentPath;
      }
    });
    
    if (matchingRule) {
      console.log('RedirectHandler: Redirecting from', currentPath, 'to', matchingRule.to);
      
      // For permanent redirects (301), use replace to avoid back button issues
      // This helps with SEO by telling search engines the content has moved permanently
      const shouldReplace = matchingRule.permanent !== false;
      
      // Preserve query parameters if they exist
      const targetUrl = matchingRule.to + currentSearch;
      
      navigate(targetUrl, { 
        replace: shouldReplace,
        state: { 
          redirectedFrom: currentPath,
          redirectType: matchingRule.permanent ? '301' : '302'
        }
      });
    }
  }, [location.pathname, location.search, navigate, redirectRules]);

  return null; // This component doesn't render anything
};

export default RedirectHandler;
