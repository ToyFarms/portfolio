import React from "react";
import { auth } from "@/lib/auth";
import ProfileEdit from "@/components/profile-edit";

export default async function Page() {
  const session = await auth();
  if (!session) {
    return <p>Not logged in</p>;
  }

  return <ProfileEdit session={session} />;
}
