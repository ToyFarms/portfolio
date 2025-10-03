import React from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import ProfileEdit from "@/components/profile-edit";

interface ProfilePageProps {
  session: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function ProfilePage({ session }: ProfilePageProps) {
  if (!session) {
    return <div className="flex justify-center">Not logged in</div>;
  }

  return <ProfileEdit session={session} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, {});
  
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};
