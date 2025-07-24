
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface IndexingOptimizerProps {
  children: React.ReactNode;
}

const IndexingOptimizer: React.FC<IndexingOptimizerProps> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Ensure proper meta tags are set dynamically
    const updateMetaTags = () => {
      // Update robots meta tag
      let robotsMeta = document.querySelector('meta[name="robots"]');
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'index, follow, max-image-preview:large');

      // Update canonical URL based on current path
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      
      // Ensure canonical URL is properly formatted (no trailing slash for non-root paths)
      let canonicalPath = location.pathname;
      if (canonicalPath.length > 1 && canonicalPath.endsWith('/')) {
        canonicalPath = canonicalPath.slice(0, -1);
      }
      const canonicalUrl = `https://resumewh.com${canonicalPath}`;
      canonicalLink.setAttribute('href', canonicalUrl);

      // Add hreflang for internationalization support
      let hrefLangMeta = document.querySelector('link[hreflang="en"]');
      if (!hrefLangMeta) {
        hrefLangMeta = document.createElement('link');
        hrefLangMeta.setAttribute('rel', 'alternate');
        hrefLangMeta.setAttribute('hreflang', 'en');
        hrefLangMeta.setAttribute('href', canonicalUrl);
        document.head.appendChild(hrefLangMeta);
      }

      // Update Open Graph URL
      let ogUrlMeta = document.querySelector('meta[property="og:url"]');
      if (ogUrlMeta) {
        ogUrlMeta.setAttribute('content', canonicalUrl);
      }
    };

    // Add internal linking optimization
    const optimizeInternalLinks = () => {
      const links = document.querySelectorAll('a[href^="/"]');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.includes('#') && !href.includes('?')) {
          // Ensure internal links don't have trailing slashes for consistency
          if (href.length > 1 && href.endsWith('/')) {
            link.setAttribute('href', href.slice(0, -1));
          }
        }
      });
    };

    // Add structured data for breadcrumbs if applicable
    const addBreadcrumbStructuredData = () => {
      const pathSegments = location.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        const breadcrumbList = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://resumewh.com/"
            }
          ]
        };

        pathSegments.forEach((segment, index) => {
          const name = segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          const url = `https://resumewh.com/${pathSegments.slice(0, index + 1).join('/')}`;
          
          breadcrumbList.itemListElement.push({
            "@type": "ListItem",
            "position": index + 2,
            "name": name,
            "item": url
          });
        });

        // Remove existing breadcrumb structured data
        const existingScript = document.querySelector('script[type="application/ld+json"][data-breadcrumb]');
        if (existingScript) {
          existingScript.remove();
        }

        // Add new breadcrumb structured data
        const script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('data-breadcrumb', 'true');
        script.textContent = JSON.stringify(breadcrumbList);
        document.head.appendChild(script);
      }
    };

    // Execute optimizations
    updateMetaTags();
    optimizeInternalLinks();
    addBreadcrumbStructuredData();

    // Track page views for analytics (if needed)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: location.pathname,
        page_title: document.title
      });
    }

  }, [location.pathname]);

  return <>{children}</>;
};

export default IndexingOptimizer;
