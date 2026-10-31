import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Palette, Sun, Moon, Smartphone, Settings } from "lucide-react";
import { useAuth, getDisplayName, getAvatarUrl } from "@/lib/auth-hook";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMood } from "@/lib/mood-store";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useTheme, toggleTheme } from "@/lib/theme-store";
import { useShake } from "@/lib/shake-store";
import { usePlayer } from "@/lib/player-store";

export function ProfileMenu() {
  const { user } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { enabled: moodOn, toggle: toggleMood } = useMood();
  const theme = useTheme();
  const isDark = theme === "dark";
  const shakeOn = useShake((s) => s.enabled);
  const shakeSupported = useShake((s) => s.supported);
  const toggleShake = useShake((s) => s.toggle);
  if (!user) return null;
  const name = getDisplayName(user);
  const avatar = getAvatarUrl(user);
  const initial = (name[0] || "U").toUpperCase();

  const logout = async () => {
    await supabase.auth.signOut();
    qc.clear();
    nav({ to: "/login" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 p-0">
          <Avatar className="h-9 w-9">
            {avatar && <AvatarImage src={avatar} alt={name} />}
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">{initial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="font-semibold truncate">{name}</span>
          <span className="text-xs font-normal text-muted-foreground truncate">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => { e.preventDefault(); toggleMood(); }}
          className="flex items-center justify-between gap-3"
        >
          <span className="flex items-center">
            <Palette className={cn("h-4 w-4 mr-2 transition-colors", moodOn ? "text-primary" : "text-muted-foreground")} />
            Mood lights
          </span>
          <Switch checked={moodOn} onCheckedChange={() => toggleMood()} onClick={(e) => e.stopPropagation()} />
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => { e.preventDefault(); toggleTheme(); }}
          className="flex items-center justify-between gap-3"
        >
          <span className="flex items-center">
            {isDark
              ? <Moon className="h-4 w-4 mr-2 text-primary transition-colors" />
              : <Sun className="h-4 w-4 mr-2 text-primary transition-colors" />}
            {isDark ? "Dark mode" : "Light mode"}
          </span>
          <Switch checked={isDark} onCheckedChange={() => toggleTheme()} onClick={(e) => e.stopPropagation()} />
        </DropdownMenuItem>
        {shakeSupported && (
          <DropdownMenuItem
            onSelect={(e) => { e.preventDefault(); void toggleShake(); }}
            className="flex items-center justify-between gap-3"
          >
            <span className="flex items-center">
              <Smartphone className={cn("h-4 w-4 mr-2 transition-colors", shakeOn ? "text-primary" : "text-muted-foreground")} />
              Shake for volume
            </span>
            <Switch checked={shakeOn} onCheckedChange={() => void toggleShake()} onClick={(e) => e.stopPropagation()} />
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings" onClick={() => closeNowPlaying()} className="cursor-pointer">
            <Settings className="h-4 w-4 mr-2" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4 mr-2" />Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}