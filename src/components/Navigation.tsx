
import React from 'react';
import { User, FileText, Award, Code, BookOpen, Target, CreditCard } from 'lucide-react';

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  user: any;
  subscription: any;
}

const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  setActiveSection,
  user,
  subscription
}) => {
  // Check if user can access targeted resumes
  const canAccessTargetedResumes = () => {
    if (!subscription || !user) return false;
    
    const tier = subscription.tier;
    return ['basic', 'premium', 'unlimited'].includes(tier);
  };

  const navigationItems = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'experience', label: 'Experience', icon: FileText },
    { id: 'education', label: 'Education', icon: BookOpen },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'projects', label: 'Projects', icon: FileText },
    { id: 'certifications', label: 'Certifications', icon: Award },
    ...(canAccessTargetedResumes() ? [
      { id: 'targeted-resumes', label: 'Targeted Job Resume', icon: Target }
    ] : []),
    { id: 'subscription', label: 'Subscription', icon: CreditCard }
  ];

  return (
    <nav className="w-64 bg-white shadow-md">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Resume Builder</h1>
        
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;