
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wand2, Sparkles, TestTube, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  duration?: number;
}

const AIIntegrationTester: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testInput, setTestInput] = useState("Software Engineer with 5 years experience in React and Node.js");
  const { toast } = useToast();

  const updateTestResult = (name: string, status: 'success' | 'error', message: string, duration?: number) => {
    setTestResults(prev => prev.map(test => 
      test.name === name 
        ? { ...test, status, message, duration }
        : test
    ));
  };

  const initializeTests = () => {
    const tests: TestResult[] = [
      { name: 'Summary Generation', status: 'pending', message: 'Waiting to start...' },
      { name: 'Content Polishing', status: 'pending', message: 'Waiting to start...' },
      { name: 'Targeted Resume', status: 'pending', message: 'Waiting to start...' },
    ];
    setTestResults(tests);
  };

  const testSummaryGeneration = async () => {
    const startTime = Date.now();
    
    try {
      updateTestResult('Summary Generation', 'pending', 'Testing AI summary generation...');
      
      const mockExperience = [
        {
          id: '1',
          jobTitle: 'Software Engineer',
          company: 'Tech Corp',
          responsibilities: ['Developed React applications', 'Built REST APIs', 'Collaborated with team']
        }
      ];

      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: { 
          experience: mockExperience,
          education: [],
          skills: [],
          personalInfo: { name: 'Test User', jobTitle: 'Software Engineer' }
        }
      });
      
      const duration = Date.now() - startTime;
      
      if (error) {
        throw error;
      }
      
      if (data?.summary && data.summary.length > 50) {
        updateTestResult('Summary Generation', 'success', `Generated ${data.summary.length} characters`, duration);
      } else {
        updateTestResult('Summary Generation', 'error', 'Generated summary too short or empty', duration);
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestResult('Summary Generation', 'error', error.message || 'Unknown error', duration);
    }
  };

  const testContentPolishing = async () => {
    const startTime = Date.now();
    
    try {
      updateTestResult('Content Polishing', 'pending', 'Testing AI content polishing...');
      
      const { data, error } = await supabase.functions.invoke('polish-resume', {
        body: { 
          content: testInput,
          sectionType: 'summary'
        }
      });
      
      const duration = Date.now() - startTime;
      
      if (error) {
        throw error;
      }
      
      if (data?.polishedContent && data.polishedContent !== testInput) {
        updateTestResult('Content Polishing', 'success', `Polished content successfully (${data.polishedContent.length} chars)`, duration);
      } else {
        updateTestResult('Content Polishing', 'error', 'No meaningful polish detected', duration);
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestResult('Content Polishing', 'error', error.message || 'Unknown error', duration);
    }
  };

  const testTargetedResume = async () => {
    const startTime = Date.now();
    
    try {
      updateTestResult('Targeted Resume', 'pending', 'Testing targeted resume generation...');
      
      const mockResumeData = {
        personalInfo: { name: 'Test User', jobTitle: 'Software Engineer', email: 'test@example.com' },
        summary: testInput,
        workExperience: [
          {
            id: '1',
            jobTitle: 'Software Engineer',
            company: 'Tech Corp',
            responsibilities: ['Developed React applications', 'Built REST APIs']
          }
        ],
        education: [],
        skills: [],
        coursesAndCertifications: []
      };

      const mockJobDescription = "We are looking for a Senior React Developer with experience in TypeScript and modern frontend frameworks.";
      
      const { data, error } = await supabase.functions.invoke('tailor-resume', {
        body: {
          resumeData: mockResumeData,
          jobDescription: mockJobDescription,
          userId: 'test-user-id',
        },
      });
      
      const duration = Date.now() - startTime;
      
      if (error) {
        throw error;
      }
      
      if (data?.success && data?.tailoredContent) {
        updateTestResult('Targeted Resume', 'success', `Generated targeted resume successfully`, duration);
      } else {
        updateTestResult('Targeted Resume', 'error', data?.error || 'Failed to generate targeted resume', duration);
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestResult('Targeted Resume', 'error', error.message || 'Unknown error', duration);
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    initializeTests();
    
    try {
      await testSummaryGeneration();
      await testContentPolishing();
      await testTargetedResume();
      
      toast({
        title: "AI Tests Completed",
        description: "All AI integration tests have been executed. Check results below.",
      });
    } catch (error) {
      toast({
        title: "Test Suite Error",
        description: "An error occurred while running the test suite.",
        variant: "destructive",
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Running</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-blue-500" />
          AI Integration Tester
        </CardTitle>
        <CardDescription>
          Test all AI-powered features to ensure they are working correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Test Input (for content polishing)</label>
          <Textarea
            placeholder="Enter content to test AI polishing..."
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          onClick={runAllTests}
          disabled={isRunningTests}
          className="w-full"
        >
          {isRunningTests ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running AI Tests...
            </>
          ) : (
            <>
              <TestTube className="mr-2 h-4 w-4" />
              Run All AI Tests
            </>
          )}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Test Results:</h3>
            {testResults.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <div className="font-medium">{test.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {test.message}
                      {test.duration && ` (${test.duration}ms)`}
                    </div>
                  </div>
                </div>
                {getStatusBadge(test.status)}
              </div>
            ))}
          </div>
        )}

        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            This tester validates that all AI integrations (summary generation, content polishing, and targeted resume creation) 
            are functioning correctly. Each test makes actual API calls to verify the features work end-to-end.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default AIIntegrationTester;
