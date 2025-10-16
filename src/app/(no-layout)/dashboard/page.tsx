"use client";

import GalleryDashboard from "@/components/gallery-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTable } from "@/components/users-table";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("user");

  return (
    <div className="flex justify-center">
      <div className="w-full">
        <a className="df hover:cursor-pointer flex gap-2 mb-6" href="/">
          <ArrowLeft />
          <span>Home</span>
        </a>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
