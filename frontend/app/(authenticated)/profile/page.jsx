"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import useAuthStore from "@/lib/store/auth-store";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
  const { user, isAuthenticated, fetchUser, updateProfile, updatePassword } =
    useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "Software engineer passionate about problem-solving and algorithms.",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    notifications: {
      email: true,
      marketing: false,
      security: true,
      updates: true,
    },
  });

  const router = useRouter();

  // Fetch user data when component mounts
  useEffect(() => {
    // If not authenticated, redirect immediately
    if (!isAuthenticated) {
      router.replace("/auth/signin");
      return;
    }
    // Only fetch user if authenticated
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        await fetchUser();
      } catch (error) {
        router.replace("/auth/signin");
        // Handle error if user data fails to load
        console.error("Failed to load user data:", error);
        toast({
          title: "Error",
          description: "Failed to load your profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, [isAuthenticated]);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio:
          user.bio ||
          "Software engineer passionate about problem-solving and algorithms.",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        notifications: {
          email: true,
          marketing: false,
          security: true,
          updates: true,
        },
      });

      setSkills(user.skills || []);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleNotificationChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      setNewSkill("");

      // Update skills in the backend
      updateProfile({
        skills: updatedSkills,
      })
        .then(() => {
          toast({
            title: "Skill Added",
            description: `${newSkill.trim()} has been added to your skills.`,
          });
        })
        .catch((error) => {
          // Revert the skills array if the update fails
          setSkills(skills);
          toast({
            title: "Error",
            description: "Failed to add skill. Please try again.",
            variant: "destructive",
          });
        });
    }
  };

  const removeSkill = (skillToRemove) => {
    const updatedSkills = skills.filter((skill) => skill !== skillToRemove);
    setSkills(updatedSkills);

    // Update skills in the backend
    updateProfile({
      skills: updatedSkills,
    })
      .then(() => {
        toast({
          title: "Skill Removed",
          description: `${skillToRemove} has been removed from your skills.`,
        });
      })
      .catch((error) => {
        // Revert the skills array if the update fails
        setSkills(skills);
        toast({
          title: "Error",
          description: "Failed to remove skill. Please try again.",
          variant: "destructive",
        });
      });
  };
  const handleProfileUpdate = (e) => {
    e.preventDefault();

    const userData = {
      name: formData.name,
      email: formData.email,
      bio: formData.bio,
    };

    // Call the auth store function to update the profile
    updateProfile(userData)
      .then(() => {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
        setIsEditing(false);

        // Refresh user data
        fetchUser();
      })
      .catch((error) => {
        toast({
          title: "Update Failed",
          description:
            error.message || "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      });
  };
  const handlePasswordChange = (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    // Call the auth store function to update the password
    updatePassword(formData.currentPassword, formData.newPassword)
      .then(() => {
        toast({
          title: "Password Updated",
          description: "Your password has been changed successfully.",
        });

        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      })
      .catch((error) => {
        toast({
          title: "Update Failed",
          description:
            error.message || "Failed to update password. Please try again.",
          variant: "destructive",
        });
      });
  };
  return (
    <div className="container py-6 max-w-5xl">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Stats Card */}
          <div className="w-full md:w-1/3">
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-center flex-col">
                  <Avatar className="h-24 w-24 mb-2">
                    <AvatarImage
                      src={user?.profileImage || ""}
                      alt={user?.name}
                    />
                    <AvatarFallback className="text-2xl">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">
                    {user?.name || "User Name"}
                  </CardTitle>
                  <CardDescription className="text-center mt-1">
                    {user?.bio || "No bio provided"}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Profile Completion</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Member Since
                      </span>
                      <span className="text-sm font-medium">
                        {user?.memberSince
                          ? format(new Date(user.memberSince), "MMMM yyyy")
                          : "Not available"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Questions Solved
                      </span>
                      <span className="text-sm font-medium">142</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Streak
                      </span>
                      <span className="text-sm font-medium">7 days</span>
                    </div>
                  </div>
                  <Separator />

                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </Badge>
                    ))}
                    <div className="flex items-center gap-1">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add skill"
                        className="h-7 text-xs min-w-[100px] max-w-[150px]"
                        onKeyPress={(e) => e.key === "Enter" && addSkill()}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={addSkill}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-2/3">
            <Tabs
              defaultValue="profile"
              className="w-full"
              onValueChange={setActiveTab}
              value={activeTab}
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                          Update your personal details
                        </CardDescription>
                      </div>
                      <Button
                        variant={isEditing ? "outline" : "default"}
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? "Cancel" : "Edit Profile"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full min-h-[100px] p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {isEditing && (
                        <Button type="submit" className="w-full">
                          Save Changes
                        </Button>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Account Tab */}
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Linked Accounts</h3>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-slate-100 p-2 rounded-full">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-blue-600"
                            >
                              <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"></path>
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">GitHub</h4>
                            <p className="text-xs text-muted-foreground">
                              Connected
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Disconnect
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-slate-100 p-2 rounded-full">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-red-500"
                            >
                              <path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12z"></path>
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Google</h4>
                            <p className="text-xs text-muted-foreground">
                              Not Connected
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Connect
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Data and Privacy</h3>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium">Data Export</h4>
                            <p className="text-xs text-muted-foreground">
                              Download a copy of your data
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Export
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium">
                              Account Deletion
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Permanently delete your account
                            </p>
                          </div>
                          <Button variant="destructive" size="sm">
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your password and security options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <h3 className="text-lg font-medium">Change Password</h3>

                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">
                          Current Password
                        </Label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                        />
                      </div>

                      <Button type="submit">Update Password</Button>
                    </form>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Two-Factor Authentication
                      </h3>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">
                            Two-Factor Authentication
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Button variant="outline">Setup 2FA</Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Session Management
                      </h3>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-md">
                          <div>
                            <h4 className="text-sm font-medium">
                              Current Session
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Windows • Chrome • Last active: Now
                            </p>
                          </div>
                          <Badge>Current</Badge>
                        </div>

                        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-md">
                          <div>
                            <h4 className="text-sm font-medium">
                              Mobile Session
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              iOS • Safari • Last active: 2 days ago
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Sign Out
                          </Button>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full">
                        Sign Out of All Sessions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Manage how you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-medium">
                            Email Notifications
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Receive email notifications
                          </p>
                        </div>
                        <Switch
                          checked={formData.notifications.email}
                          onCheckedChange={(checked) =>
                            handleNotificationChange("email", checked)
                          }
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-medium">
                            Security Alerts
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Receive security notifications
                          </p>
                        </div>
                        <Switch
                          checked={formData.notifications.security}
                          onCheckedChange={(checked) =>
                            handleNotificationChange("security", checked)
                          }
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-medium">
                            Product Updates
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Receive updates about new features
                          </p>
                        </div>
                        <Switch
                          checked={formData.notifications.updates}
                          onCheckedChange={(checked) =>
                            handleNotificationChange("updates", checked)
                          }
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-medium">
                            Marketing Emails
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Receive marketing emails
                          </p>
                        </div>
                        <Switch
                          checked={formData.notifications.marketing}
                          onCheckedChange={(checked) =>
                            handleNotificationChange("marketing", checked)
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => {
                        toast.success("Preferences Saved", {
                          description:
                            "Your notification preferences have been updated.",
                          id: "preferences-saved",
                          duration: 3000,
                        });
                      }}
                    >
                      Save Preferences
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
