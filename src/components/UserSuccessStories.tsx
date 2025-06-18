
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, TrendingUp, Users, CheckCircle } from "lucide-react";

interface SuccessStory {
  id: string;
  name: string;
  title: string;
  company: string;
  image: string;
  story: string;
  improvement: string;
  rating: number;
  industry: string;
  timeToSuccess: string;
}

const UserSuccessStories: React.FC = () => {
  const successStories: SuccessStory[] = [
    {
      id: "1",
      name: "Ahmed Hassan",
      title: "Software Engineer",
      company: "Microsoft",
      image: "photo-1618160702438-9b02ab6515c9",
      story: "After using Resume Builder's ATS optimization, I landed my dream job at Microsoft! The targeted resume feature helped me tailor my application perfectly.",
      improvement: "3x more interview calls",
      rating: 5,
      industry: "Technology",
      timeToSuccess: "2 weeks"
    },
    {
      id: "2",
      name: "Sarah Al-Rashid",
      title: "Marketing Manager",
      company: "Emirates",
      image: "photo-1582562124811-c09040d0a901",
      story: "The ATS analysis showed me exactly what keywords I was missing. Within a month, I got hired at Emirates with a 40% salary increase!",
      improvement: "40% salary increase",
      rating: 5,
      industry: "Aviation",
      timeToSuccess: "1 month"
    },
    {
      id: "3",
      name: "Omar Khalil",
      title: "Financial Analyst",
      company: "NBE Bank",
      image: "photo-1721322800607-8c38375eef04",
      story: "Resume Builder's professional templates and keyword optimization got me noticed by top recruiters. Highly recommend for MENA professionals!",
      improvement: "5x recruiter reach-outs",
      rating: 5,
      industry: "Finance",
      timeToSuccess: "3 weeks"
    }
  ];

  const stats = [
    { icon: Users, label: "Success Stories", value: "2,500+" },
    { icon: TrendingUp, label: "Avg. Salary Increase", value: "35%" },
    { icon: CheckCircle, label: "Interview Success Rate", value: "78%" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Join thousands of professionals who landed their dream jobs using our ATS-optimized resume builder
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="p-6">
              <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Success Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {successStories.map((story) => (
          <Card key={story.id} className="h-full hover:shadow-lg transition-shadow">
            <CardContent className="p-6 space-y-4">
              {/* Profile */}
              <div className="flex items-center gap-3">
                <img
                  src={`https://images.unsplash.com/${story.image}?w=64&h=64&fit=crop&crop=face`}
                  alt={story.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold">{story.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {story.title} at {story.company}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1">
                {[...Array(story.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Story */}
              <div className="relative">
                <Quote className="h-6 w-6 text-muted-foreground/30 absolute -top-2 -left-1" />
                <p className="text-sm italic pl-4 leading-relaxed">{story.story}</p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {story.industry}
                </Badge>
                <Badge variant="outline" className="text-xs text-green-700 border-green-200">
                  {story.improvement}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {story.timeToSuccess}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center pt-8">
        <h3 className="text-xl font-semibold mb-2">Ready to Write Your Success Story?</h3>
        <p className="text-muted-foreground mb-4">
          Join thousands of professionals who transformed their careers with our platform
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Start Building Your Resume
          </button>
          <button className="border border-input bg-background hover:bg-accent hover:text-accent-foreground px-6 py-3 rounded-lg font-medium transition-colors">
            View More Stories
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSuccessStories;
