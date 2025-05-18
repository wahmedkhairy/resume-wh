
import React, { useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";

interface Skill {
  id: string;
  name: string;
  level: number;
}

const SkillsBar = () => {
  const [skills, setSkills] = useState<Skill[]>([
    { id: "1", name: "React", level: 85 },
    { id: "2", name: "TypeScript", level: 75 },
    { id: "3", name: "CSS/Tailwind", level: 90 },
  ]);
  const [newSkill, setNewSkill] = useState("");
  const [newLevel, setNewLevel] = useState(50);
  const [isPolishing, setIsPolishing] = useState(false);
  const { toast } = useToast();

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
      
      const { data, error } = await supabase.functions.invoke('polish-resume', {
        body: { content: experienceText, action: "recommend-skills" },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.recommendations) {
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
                <span className="text-sm w-8 text-right">
                  {skill.level}%
                </span>
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
            <span className="text-sm w-8 text-right">
              {newLevel}%
            </span>
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
