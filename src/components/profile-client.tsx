"use client";

import { Session } from "next-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import ProfileImage from "./profile-image";

export function ProfileClient({ session }: { session: Session | null }) {
  if (!session) {
    return <p>Not logged in</p>;
  }

  const user = session.user;
  const [open, setOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 hover:bg-muted/10 outline-none">
            <span className="hidden sm:inline">{user.name ?? user.email}</span>
            <ProfileImage user={user} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-48 p-1">
          <DropdownMenuItem>
            <a className="w-full df" href="/profile">
              <button className="w-full">Profile</button>
            </a>
          </DropdownMenuItem>

          {user.role === "admin" && (
            <DropdownMenuItem>
              <a className="w-full df" href="/dashboard">
                <button className="w-full">Dashboard</button>
              </a>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="outline-none w-full text-white"
                  variant="destructive"
                  onClick={() => setOpen(true)}
                >
                  Log out
                </Button>
              </AlertDialogTrigger>
            </AlertDialog>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will log you out of your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <a href="/api/logout">Continue</a>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
