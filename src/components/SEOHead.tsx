
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
  ogImage = "/lovable-uploads/a962d0b8-93d6-44ee-bf91-1cb5a307f7c3.png",
  twitterTitle,
  twitterDescription,
  twitterImage = "/lovable-uploads/a962d0b8-93d6-44ee-bf91-1cb5a307f7c3.png",
  twitterCard = "summary_large_image",
  additionalMeta = [] 
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph tags */}
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:url" content={ogUrl || canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle || title} />
      <meta name="twitter:description" content={twitterDescription || description} />
      <meta name="twitter:image" content={twitterImage} />
      <meta name="twitter:site" content="@lovable_dev" />
      
      {additionalMeta.map((meta, index) => (
        <meta key={index} {...meta} />
      ))}
    </Helmet>
  );
};

export default SEOHead;
