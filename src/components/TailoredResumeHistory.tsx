
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, FileText, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface TailoredResume {
  id: string;
  job_description: string;
  tailored_content: any;
  original_content: any;
  created_at: string;
  expires_at: string;
}

interface TailoredResumeHistoryProps {
  currentUserId: string;
  onLoadTailoredResume: (tailoredData: any) => void;
}

const TailoredResumeHistory: React.FC<TailoredResumeHistoryProps> = ({
  currentUserId,
  onLoadTailoredResume,
}) => {
  const [tailoredResumes, setTailoredResumes] = useState<TailoredResume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadTailoredResumes = async () => {
    if (!currentUserId) return;

    try {
      const { data, error } = await supabase
        .from('tailored_resumes')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTailoredResumes(data || []);
    } catch (error) {
      console.error('Error loading tailored resumes:', error);
      toast({
        title: "Failed to Load History",
        description: "There was an error loading your tailored resume history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTailoredResumes();
  }, [currentUserId]);

  const handleDeleteTailoredResume = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tailored_resumes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTailoredResumes(prev => prev.filter(resume => resume.id !== id));
      
      toast({
        title: "Deleted Successfully",
        description: "The tailored resume has been deleted.",
      });
    } catch (error) {
      console.error('Error deleting tailored resume:', error);
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the tailored resume.",
        variant: "destructive",
      });
    }
  };

  const handleLoadTailoredResume = (tailoredData: any) => {
    onLoadTailoredResume(tailoredData);
    toast({
      title: "Tailored Resume Loaded",
      description: "The tailored resume has been loaded in the preview.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getJobTitle = (jobDescription: string) => {
    // Extract potential job title from first few lines
    const lines = jobDescription.split('\n').filter(line => line.trim());
    const firstLine = lines[0] || 'Job Position';
    
    // Truncate if too long
    if (firstLine.length > 50) {
      return firstLine.substring(0, 47) + '...';
    }
    
    return firstLine;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tailored Resume History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading history...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Tailored Resume History
        </CardTitle>
        <CardDescription>
          View and manage your previously generated tailored resumes.
          {tailoredResumes.length > 0 && " Tailored resumes expire after 48 hours."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tailoredResumes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tailored resumes yet.</p>
            <p className="text-sm">Generate your first tailored resume to see it here.</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {tailoredResumes.map((resume) => {
                const expired = isExpired(resume.expires_at);
                
                return (
                  <div
                    key={resume.id}
                    className={`border rounded-lg p-4 ${expired ? 'opacity-50 bg-muted/30' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-2 truncate">
                          {getJobTitle(resume.job_description)}
                        </h4>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Created: {formatDate(resume.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>Expires: {formatDate(resume.expires_at)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={expired ? "secondary" : "default"}>
                            {expired ? "Expired" : "Active"}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!expired && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLoadTailoredResume(resume.tailored_content)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Load
                          </Button>
                        )}
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Tailored Resume</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this tailored resume? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTailoredResume(resume.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default TailoredResumeHistory;
