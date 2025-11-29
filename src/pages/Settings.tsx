import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/hooks/useTheme";
import { ArrowLeft, Moon, Sun, Trash2 } from "lucide-react";

export default function Settings() {
  const { theme, setTheme, isDark } = useTheme();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profile, setProfile] = useState({ name: "User", email: "user@example.com" });
  const [aiModel, setAiModel] = useState("gemini-1.5-pro");
  const [showHighlights, setShowHighlights] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link to="/dashboard"><Button variant="ghost" size="icon-sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <h1 className="font-semibold text-foreground">Settings</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setTheme(isDark ? "light" : "dark")}>{isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</Button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Card><CardHeader><CardTitle>Profile</CardTitle><CardDescription>Manage your account</CardDescription></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label>Name</Label><Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div><div className="space-y-2"><Label>Email</Label><Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Appearance</CardTitle></CardHeader><CardContent><div className="space-y-2"><Label>Theme</Label><Select value={theme} onValueChange={setTheme}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem><SelectItem value="system">System</SelectItem></SelectContent></Select></div></CardContent></Card>
        <Card><CardHeader><CardTitle>AI Model</CardTitle></CardHeader><CardContent><Select value={aiModel} onValueChange={setAiModel}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem><SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem><SelectItem value="gpt-4.1">GPT-4.1</SelectItem><SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem></SelectContent></Select></CardContent></Card>
        <Card><CardHeader><CardTitle>Document Settings</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between"><div><Label>Auto-save notes</Label><p className="text-sm text-muted-foreground">Save automatically</p></div><Switch checked={autoSave} onCheckedChange={setAutoSave} /></div><Separator /><div className="flex items-center justify-between"><div><Label>Show highlights</Label><p className="text-sm text-muted-foreground">Display highlights</p></div><Switch checked={showHighlights} onCheckedChange={setShowHighlights} /></div></CardContent></Card>
        <Card className="border-destructive/50"><CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle></CardHeader><CardContent><Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}><DialogTrigger asChild><Button variant="destructive"><Trash2 className="h-4 w-4 mr-2" />Delete account</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Delete account?</DialogTitle><DialogDescription>This cannot be undone.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={() => setDeleteDialogOpen(false)}>Delete</Button></DialogFooter></DialogContent></Dialog></CardContent></Card>
      </main>
    </div>
  );
}