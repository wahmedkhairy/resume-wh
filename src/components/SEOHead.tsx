
import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl: string;
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
  additionalMeta = [] 
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:image" content="/lovable-uploads/a962d0b8-93d6-44ee-bf91-1cb5a307f7c3.png" />
      <meta name="twitter:image" content="/lovable-uploads/a962d0b8-93d6-44ee-bf91-1cb5a307f7c3.png" />
      {additionalMeta.map((meta, index) => (
        <meta key={index} {...meta} />
      ))}
    </Helmet>
  );
};

export default SEOHead;
