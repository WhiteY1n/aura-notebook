import { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/hooks/useTheme";
import { User, Palette, Brain, FileText, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Form states
  const [profile, setProfile] = useState({
    name: "User",
    email: "user@example.com",
  });
  const [aiModel, setAiModel] = useState("gemini-1.5-pro");
  const [renderOptions, setRenderOptions] = useState({
    showPageNumbers: true,
    showHighlights: true,
    compactView: false,
  });

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile settings have been saved.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deleted",
      description: "Your account has been scheduled for deletion.",
      variant: "destructive",
    });
    setDeleteDialogOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav title="Settings" showSearch={false} />

      <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6">
        {/* Profile Settings */}
        <Card variant="elevated" className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Manage your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleSaveProfile}>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card variant="elevated" className="animate-fade-in" style={{ animationDelay: "50ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how the app looks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose your preferred color scheme
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI Model Settings */}
        <Card variant="elevated" className="animate-fade-in" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Model Preference
            </CardTitle>
            <CardDescription>
              Select your preferred AI model for document analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>AI Model</Label>
              <Select value={aiModel} onValueChange={setAiModel}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                  <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                  <SelectItem value="gpt-4.1">GPT-4.1</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Different models offer varying speed and accuracy trade-offs
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Document Rendering Options */}
        <Card variant="elevated" className="animate-fade-in" style={{ animationDelay: "150ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Document Rendering
            </CardTitle>
            <CardDescription>
              Configure how documents are displayed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Page Numbers</Label>
                <p className="text-xs text-muted-foreground">
                  Display page numbers in document viewer
                </p>
              </div>
              <Switch
                checked={renderOptions.showPageNumbers}
                onCheckedChange={(checked) =>
                  setRenderOptions({ ...renderOptions, showPageNumbers: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Highlights</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically highlight important sections
                </p>
              </div>
              <Switch
                checked={renderOptions.showHighlights}
                onCheckedChange={(checked) =>
                  setRenderOptions({ ...renderOptions, showHighlights: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compact View</Label>
                <p className="text-xs text-muted-foreground">
                  Reduce spacing for denser content display
                </p>
              </div>
              <Switch
                checked={renderOptions.compactView}
                onCheckedChange={(checked) =>
                  setRenderOptions({ ...renderOptions, compactView: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card variant="outline" className="border-destructive/50 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    Delete Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
