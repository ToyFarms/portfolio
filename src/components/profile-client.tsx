"use client";

import { Session } from "next-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfileClient({ session }: { session: Session }) {
  const user = session.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 hover:bg-muted/10 outline-none">
          <span className="hidden sm:inline">{user.name ?? user.email}</span>
          <Avatar>
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback>
              <UserIcon />
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-48 transition-all duration-500"
      >
        <DropdownMenuItem>
          <a className="w-full" href="/profile">
            Profile
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <a className="w-full" href="/api/logout">
            Log out
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
