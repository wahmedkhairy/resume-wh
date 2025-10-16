import React from "react";
import SEOHead from "@/components/SEOHead";
import SitemapUploader from "@/components/SitemapUploader";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Admin = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Admin - Sitemap Management | ResumeWH"
        description="Upload and manage your sitemap.xml file for better SEO optimization."
        canonicalUrl="https://resumewh.com/admin"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your site's SEO settings and configurations</p>
        </div>

        <SitemapUploader />
      </div>
    </div>
  );
};

export default Admin;