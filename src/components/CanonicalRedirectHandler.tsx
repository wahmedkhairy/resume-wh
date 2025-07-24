import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface CanonicalRedirectHandlerProps {
  preferredDomain?: string;
  forceHttps?: boolean;
  removeWww?: boolean;
}

const CanonicalRedirectHandler: React.FC<CanonicalRedirectHandlerProps> = ({
  preferredDomain = 'resumewh.com',
  forceHttps = true,
  removeWww = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const currentUrl = new URL(window.location.href);
    const protocol = currentUrl.protocol;
    const hostname = currentUrl.hostname;
    const pathname = currentUrl.pathname;
    const search = currentUrl.search;
    const hash = currentUrl.hash;
    
    let shouldRedirect = false;
    let newUrl = '';
    
    // Check if we need to redirect to HTTPS
    if (forceHttps && protocol === 'http:') {
      shouldRedirect = true;
    }
    
    // Check if we need to remove www
    if (removeWww && hostname.startsWith('www.')) {
      shouldRedirect = true;
    }
    
    // Check if hostname doesn't match preferred domain
    const targetHostname = removeWww ? preferredDomain : hostname;
    const cleanHostname = hostname.replace(/^www\./, '');
    
    if (cleanHostname !== preferredDomain && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
      shouldRedirect = true;
    }
    
    if (shouldRedirect) {
      const targetProtocol = forceHttps ? 'https:' : protocol;
      newUrl = `${targetProtocol}//${preferredDomain}${pathname}${search}${hash}`;
      
      console.log('CanonicalRedirectHandler: Redirecting to canonical URL:', newUrl);
      
      // Perform a 301 redirect by replacing the current location
      window.location.replace(newUrl);
      return;
    }
    
    // Handle trailing slash normalization
    if (pathname.length > 1 && pathname.endsWith('/')) {
      const newPath = pathname.slice(0, -1);
      console.log('CanonicalRedirectHandler: Removing trailing slash:', newPath);
      navigate(newPath + search + hash, { replace: true });
      return;
    }
    
  }, [navigate, location.pathname, location.search, preferredDomain, forceHttps, removeWww]);

  return null;
};

export default CanonicalRedirectHandler;