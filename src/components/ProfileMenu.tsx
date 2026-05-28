import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Library, Clock } from "lucide-react";
import { useAuth, getDisplayName, getAvatarUrl } from "@/lib/auth-hook";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

export function ProfileMenu() {
  const { user } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
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
        <DropdownMenuItem asChild>
          <Link to="/library"><Library className="h-4 w-4 mr-2" />Library</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/history"><Clock className="h-4 w-4 mr-2" />Recently played</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4 mr-2" />Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}