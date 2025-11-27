"use client";

import GalleryDashboard from "@/components/gallery-dashboard";
import ProjectsDashboard from "@/components/projects-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTable } from "@/components/users-table";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get("tab") || "user";
  const [activeTab, setActiveTab] = useState(initialTab);

  const onTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);

    router.replace(`?${params.toString()}`);
  };

  useEffect(() => {
    const tab = searchParams.get("tab") || "user";
    setActiveTab(tab);
  }, [searchParams]);

  return (
    <div className="flex justify-center">
      <div className="w-full">
        <a className="df hover:cursor-pointer flex gap-2 mb-6" href="/">
          <ArrowLeft />
          <span>Home</span>
        </a>

        <Tabs value={activeTab} onValueChange={onTabChange}>
          <div className="flex flex-col sm:flex-row gap-6">
            <TabsList className="flex-row sm:flex-col gap-2 w-full sm:w-44 mt-8">
              <TabsTrigger
                value="user"
                className="w-full justify-start py-2 px-3 rounded-md text-sm"
              >
                User
              </TabsTrigger>
              <TabsTrigger
                value="gallery"
                className="w-full justify-start py-2 px-3 text-sm"
              >
                Gallery
              </TabsTrigger>
              <TabsTrigger
                value="projects"
                className="w-full justify-start py-2 px-3 text-sm"
              >
                Projects
              </TabsTrigger>
            </TabsList>

            <div
              aria-hidden="true"
              className="hidden sm:block w-px bg-gray-200 dark:bg-gray-700"
            />

            <div className="flex-1">
              <TabsContent
                value="user"
                forceMount
                hidden={activeTab !== "user"}
              >
                <UsersTable />
              </TabsContent>

              <TabsContent
                value="gallery"
                forceMount
                hidden={activeTab !== "gallery"}
              >
                <GalleryDashboard />
              </TabsContent>

              <TabsContent
                value="projects"
                forceMount
                hidden={activeTab !== "projects"}
              >
                <ProjectsDashboard />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
