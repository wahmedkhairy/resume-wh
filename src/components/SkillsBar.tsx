
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Trash2, Plus } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  level: number;
}

interface SkillsBarProps {
  onSkillsChange: (skills: Skill[]) => void;
  initialSkills?: Skill[];
}

const SkillsBar: React.FC<SkillsBarProps> = ({ onSkillsChange, initialSkills = [] }) => {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [newSkill, setNewSkill] = useState({ name: "", level: 70 });

  useEffect(() => {
    setSkills(initialSkills);
  }, [initialSkills]);

  useEffect(() => {
    onSkillsChange(skills);
  }, [skills, onSkillsChange]);

  const addSkill = () => {
    if (newSkill.name.trim()) {
      const skill: Skill = {
        id: Date.now().toString(),
        name: newSkill.name.trim(),
        level: newSkill.level,
      };
      setSkills([...skills, skill]);
      setNewSkill({ name: "", level: 70 });
    }
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const updateSkillLevel = (id: string, level: number) => {
    setSkills(skills.map(skill =>
      skill.id === id ? { ...skill, level } : skill
    ));
  };

  const getLevelColor = (level: number) => {
    if (level >= 80) return "bg-green-500";
    if (level >= 60) return "bg-blue-500";
    if (level >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getLevelText = (level: number) => {
    if (level >= 80) return "Expert";
    if (level >= 60) return "Advanced";
    if (level >= 40) return "Intermediate";
    return "Beginner";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Skill */}
        <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
          <div>
            <Label htmlFor="skill-name">Add a new skill</Label>
            <Input
              id="skill-name"
              placeholder="Enter skill name"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              onKeyPress={(e) => e.key === "Enter" && addSkill()}
            />
          </div>
          <div>
            <Label>Proficiency Level: {newSkill.level}% - {getLevelText(newSkill.level)}</Label>
            <Slider
              value={[newSkill.level]}
              onValueChange={(value) => setNewSkill({ ...newSkill, level: value[0] })}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>
          <Button onClick={addSkill} disabled={!newSkill.name.trim()} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Skill
          </Button>
        </div>

        {/* Skills List */}
        {skills.length > 0 && (
          <div className="space-y-3">
            {skills.map((skill) => (
              <div key={skill.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{skill.name}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSkill(skill.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{getLevelText(skill.level)}</span>
                    <span>{skill.level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getLevelColor(skill.level)} transition-all duration-300`}
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                  <Slider
                    value={[skill.level]}
                    onValueChange={(value) => updateSkillLevel(skill.id, value[0])}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {skills.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No skills added yet. Add your first skill above!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillsBar;
