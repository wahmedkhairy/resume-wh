import React, { useState, useEffect } from "react";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Star, Plus, Trash2, BarChart, Wand2 } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  level: number;
}

interface SkillsBarProps {
  initialSkills?: Skill[];
  onSkillsChange?: (skills: Skill[]) => void;
}

// Fallback skill recommendation function that analyzes text content
const recommendSkillsFallback = (experienceText: string): Skill[] => {
  if (!experienceText.trim()) return [];
  
  const commonTechSkills = [
    { keyword: "react", name: "React", level: 85 },
    { keyword: "typescript", name: "TypeScript", level: 75 },
    { keyword: "javascript", name: "JavaScript", level: 80 },
    { keyword: "html", name: "HTML", level: 90 },
    { keyword: "css", name: "CSS", level: 85 },
    { keyword: "tailwind", name: "Tailwind CSS", level: 80 },
    { keyword: "node", name: "Node.js", level: 70 },
    { keyword: "express", name: "Express.js", level: 65 },
    { keyword: "sql", name: "SQL", level: 70 },
    { keyword: "nosql", name: "NoSQL", level: 65 },
    { keyword: "mongo", name: "MongoDB", level: 70 },
    { keyword: "api", name: "RESTful APIs", level: 75 },
    { keyword: "graphql", name: "GraphQL", level: 70 },
    { keyword: "redux", name: "Redux", level: 75 },
    { keyword: "aws", name: "AWS", level: 65 },
    { keyword: "azure", name: "Microsoft Azure", level: 60 },
    { keyword: "docker", name: "Docker", level: 65 },
    { keyword: "kubernetes", name: "Kubernetes", level: 60 },
    { keyword: "git", name: "Git", level: 85 },
    { keyword: "agile", name: "Agile Methodologies", level: 80 },
    { keyword: "scrum", name: "Scrum", level: 75 }
  ];
  
  const text = experienceText.toLowerCase();
  const recommendedSkills: Skill[] = [];
  
  commonTechSkills.forEach(skill => {
    if (text.includes(skill.keyword)) {
      recommendedSkills.push({
        id: Date.now() + Math.random().toString(),
        name: skill.name,
        level: skill.level
      });
    }
  });
  
  // Add some general skills based on the type of experience
  if (text.includes("lead") || text.includes("manager") || text.includes("direct")) {
    recommendedSkills.push({
      id: Date.now() + Math.random().toString(),
      name: "Leadership",
      level: 85
    });
  }
  
  if (text.includes("team") || text.includes("collaborat")) {
    recommendedSkills.push({
      id: Date.now() + Math.random().toString(),
      name: "Team Collaboration",
      level: 90
    });
  }
  
  // If we couldn't find any skills, add some generic ones
  if (recommendedSkills.length === 0) {
    recommendedSkills.push(
      {
        id: Date.now() + Math.random().toString(),
        name: "Problem Solving",
        level: 85
      },
      {
        id: Date.now() + Math.random().toString(),
        name: "Communication",
        level: 80
      },
      {
        id: Date.now() + Math.random().toString(),
        name: "Critical Thinking",
        level: 85
      }
    );
  }
  
  return recommendedSkills;
};

const SkillsBar: React.FC<SkillsBarProps> = ({ initialSkills = [], onSkillsChange }) => {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [newSkill, setNewSkill] = useState("");
  const [newLevel, setNewLevel] = useState(50);
  const [isPolishing, setIsPolishing] = useState(false);
  const { toast } = useToast();

  // When skills state changes, notify parent component
  useEffect(() => {
    if (onSkillsChange) {
      onSkillsChange(skills);
    }
  }, [skills, onSkillsChange]);

  const addSkill = () => {
    if (!newSkill.trim()) {
      toast({
        title: "Empty Skill Name",
        description: "Please enter a skill name.",
        variant: "destructive",
      });
      return;
    }

    const skill = {
      id: Date.now().toString(),
      name: newSkill,
      level: newLevel,
    };

    setSkills([...skills, skill]);
    setNewSkill("");
    setNewLevel(50);
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter((skill) => skill.id !== id));
  };

  const handleSkillChange = (id: string, name: string) => {
    setSkills(
      skills.map((skill) => (skill.id === id ? { ...skill, name } : skill))
    );
  };

  const handleLevelChange = (id: string, level: number) => {
    setSkills(
      skills.map((skill) => (skill.id === id ? { ...skill, level } : skill))
    );
  };

  const handleAIRecommend = async () => {
    setIsPolishing(true);
    
    try {
      // Get the job experience info to base recommendations on
      const experienceTextarea = document.querySelector('textarea[placeholder*="Job title"]') as HTMLTextAreaElement;
      const experienceText = experienceTextarea?.value || '';
      
      if (!experienceText.trim()) {
        toast({
          title: "No Experience Data",
          description: "Please add work experience details first to get skill recommendations.",
          variant: "destructive",
        });
        setIsPolishing(false);
        return;
      }
      
      try {
        // Try to call AI API first
        const response = await fetch('/api/recommend-skills', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            content: experienceText,
            action: "recommend-skills" 
          }),
        });
        
        if (!response.ok) {
          throw new Error('API unavailable');
        }
        
        const data = await response.json();
        
        if (data?.recommendations && Array.isArray(data.recommendations)) {
          // Add recommended skills if they don't already exist
          const currentSkillNames = skills.map(s => s.name.toLowerCase());
          const newSkills = data.recommendations
            .filter((skill: {name: string; level: number}) => 
              !currentSkillNames.includes(skill.name.toLowerCase()))
            .map((skill: {name: string; level: number}) => ({
              id: Date.now() + Math.random().toString(),
              name: skill.name,
              level: skill.level,
            }));
            
          if (newSkills.length) {
            setSkills([...skills, ...newSkills]);
            toast({
              title: "Skills Recommended",
              description: `Added ${newSkills.length} relevant skills based on your experience.`,
              variant: "default",
            });
          } else {
            toast({
              title: "No New Skills",
              description: "Your skill list already covers the recommended skills.",
              variant: "default",
            });
          }
        } else {
          throw new Error('Invalid API response');
        }
      } catch (apiError) {
        console.log('API error, using fallback:', apiError);
        
        // Use fallback recommendation if API fails
        const recommendedSkills = recommendSkillsFallback(experienceText);
        const currentSkillNames = skills.map(s => s.name.toLowerCase());
        const newSkills = recommendedSkills.filter(skill => 
          !currentSkillNames.includes(skill.name.toLowerCase())
        );
        
        if (newSkills.length) {
          setSkills([...skills, ...newSkills]);
          toast({
            title: "Skills Recommended",
            description: `Added ${newSkills.length} skills based on your experience using local analysis.`,
            variant: "default",
          });
        } else {
          toast({
            title: "No New Skills",
            description: "Your skill list already covers the relevant skills for your experience.",
            variant: "default",
          });
        }
      }
    } catch (error) {
      console.error('Error getting skill recommendations:', error);
      toast({
        title: "Recommendation Failed",
        description: "There was an error getting skill recommendations.",
        variant: "destructive",
      });
    } finally {
      setIsPolishing(false);
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 80) return "bg-green-500";
    if (level >= 60) return "bg-blue-500";
    if (level >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>
          Add your technical and professional skills with proficiency levels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {skills.map((skill) => (
          <div key={skill.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Input
                value={skill.name}
                onChange={(e) => handleSkillChange(skill.id, e.target.value)}
                className="w-2/3"
                placeholder="Skill name"
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSkill(skill.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-full">
                <Slider
                  value={[skill.level]}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                  onValueChange={(value) => handleLevelChange(skill.id, value[0])}
                />
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${getLevelColor(skill.level)}`}
                style={{ width: `${skill.level}%` }}
              ></div>
            </div>
          </div>
        ))}

        <div className="flex flex-col space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a new skill"
              className="flex-1"
            />
          </div>
          <Slider
            value={[newLevel]}
            min={0}
            max={100}
            step={5}
            onValueChange={(value) => setNewLevel(value[0])}
          />
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAIRecommend}
              disabled={isPolishing}
            >
              <Wand2 className="mr-1 h-4 w-4" />
              {isPolishing ? "Recommending..." : "Recommend Skills"}
            </Button>
            <Button onClick={addSkill} size="sm">
              <Plus className="mr-1 h-4 w-4" /> Add Skill
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsBar;
