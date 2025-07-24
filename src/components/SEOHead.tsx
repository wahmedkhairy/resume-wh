
import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: string;
  noindex?: boolean;
  nofollow?: boolean;
  additionalMeta?: Array<{
    name?: string;
    property?: string;
    content: string;
  }>;
}

const SEOHead: React.FC<SEOHeadProps> = ({ 
  title, 
  description, 
  canonicalUrl,
  keywords,
  ogTitle,
  ogDescription,
  ogUrl,
  ogImage = "https://resumewh.com/src/assets/og-image-1200x630.png",
  twitterTitle,
  twitterDescription,
  twitterImage = "https://resumewh.com/src/assets/og-image-1200x630.png",
  twitterCard = "summary_large_image",
  noindex = false,
  nofollow = false,
  additionalMeta = [] 
}) => {
  // Ensure canonical URL is always absolute
  const absoluteCanonicalUrl = canonicalUrl.startsWith('http') 
    ? canonicalUrl 
    : `https://resumewh.com${canonicalUrl}`;

  // Build robots meta content
  const robotsContent = [];
  if (noindex) robotsContent.push('noindex');
  else robotsContent.push('index');
  if (nofollow) robotsContent.push('nofollow');
  else robotsContent.push('follow');

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical URL - Critical for duplicate content issues */}
      <link rel="canonical" href={absoluteCanonicalUrl} />
      
      {/* Robots directive */}
      <meta name="robots" content={robotsContent.join(', ')} />
      <meta name="googlebot" content={robotsContent.join(', ')} />
      
      {/* Enhanced SEO meta tags */}
      <meta name="author" content="Resume Builder" />
      <meta name="publisher" content="resumewh.com" />
      <meta name="copyright" content="© 2025 resumewh.com. All rights reserved." />
      <meta name="language" content="en-US" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      
      {/* Open Graph tags */}
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:url" content={ogUrl || absoluteCanonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Resume Builder - Professional ATS-Optimized Resume Templates" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Resume Builder" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@resumewh" />
      <meta name="twitter:creator" content="@resumewh" />
      <meta name="twitter:title" content={twitterTitle || title} />
      <meta name="twitter:description" content={twitterDescription || description} />
      <meta name="twitter:image" content={twitterImage} />
      <meta name="twitter:image:alt" content="Resume Builder - Professional ATS-Optimized Resume Templates" />
      
      {/* Additional structured data for better indexing */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Resume Builder",
          "description": description,
          "url": absoluteCanonicalUrl,
          "logo": "https://resumewh.com/src/assets/og-image-1200x630.png",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Any",
          "offers": {
            "@type": "Offer",
            "category": "SaaS",
            "price": "0",
            "priceCurrency": "USD"
          },
          "author": {
            "@type": "Organization",
            "name": "Resume Builder",
            "url": "https://resumewh.com"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Resume Builder",
            "logo": {
              "@type": "ImageObject",
              "url": "https://resumewh.com/src/assets/og-image-1200x630.png"
            }
          }
        })}
      </script>
      
      {additionalMeta.map((meta, index) => (
        <meta key={index} {...meta} />
      ))}
    </Helmet>
  );
};

export default SEOHead;
