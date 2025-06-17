
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Edit, Save, X } from "lucide-react";

interface UserInfoCardProps {
  userInfo: any;
  onUserInfoUpdate: () => void;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ userInfo, onUserInfoUpdate }) => {
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(userInfo?.email || "");
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const { toast } = useToast();

  const handleEmailUpdate = async () => {
    if (!newEmail || newEmail === userInfo?.email) {
      setIsEditingEmail(false);
      return;
    }

    try {
      setIsUpdatingSettings(true);
      const { error } = await supabase.auth.updateUser({ 
        email: newEmail 
      });

      if (error) throw error;

      toast({
        title: "Email Update",
        description: "Please check your email to confirm the change.",
      });
      
      setIsEditingEmail(false);
      onUserInfoUpdate();
    } catch (error) {
      console.error('Error updating email:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update email.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Information
        </CardTitle>
        <CardDescription>Your account details and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            {isEditingEmail ? (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  size="sm" 
                  onClick={handleEmailUpdate}
                  disabled={isUpdatingSettings}
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setIsEditingEmail(false);
                    setNewEmail(userInfo?.email || "");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm flex-1">{userInfo?.email}</p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setIsEditingEmail(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Account Created</label>
            <p className="text-sm mt-1">
              {userInfo?.created_at ? new Date(userInfo.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">User ID</label>
          <p className="text-xs font-mono text-muted-foreground mt-1 break-all">
            {userInfo?.id}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfoCard;
