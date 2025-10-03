import { auth } from "@/lib/auth";
import { User } from "lucide-react";
import { ProfileClient } from "./profile-client";

export default async function Profile() {
  const session = await auth();
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
