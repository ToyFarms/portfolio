"use client";

import { useSession } from "next-auth/react";
import { User } from "lucide-react";
import { ProfileClient } from "./profile-client";

export default function Profile() {
  const { data: session } = useSession();
  if (!session) {
    return (
      <div className="flex gap-3 items-center">
        <p>Not logged in</p>
        <User />
      </div>
    );
  }

  return <ProfileClient session={session}/>
}
