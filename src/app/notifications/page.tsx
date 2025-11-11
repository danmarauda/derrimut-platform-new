"use client";

import { useUser } from "@clerk/nextjs";
import { NotificationsList } from "@/components/notifications";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  const { user } = useUser();
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white/70">
          Please sign in to view notifications
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Bell className="h-8 w-8" />
          Notifications
        </h1>
        <p className="text-white/70">
          Stay updated with your fitness journey
        </p>
      </div>
      
      <NotificationsList />
    </div>
  );
}
