import React from "react";
import Navigation from "@/components/Navigation";
import { ProfileEdit } from "@/components/ProfileEdit";
import PageTransition from "@/components/transitions/PageTransition";
import { BackButton } from "@/components/ui/back-button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <BackButton to="/" />
            
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-foreground">
                My Profile
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Update your personal information and contact details
              </p>
            </div>
            
            <ProfileEdit />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;