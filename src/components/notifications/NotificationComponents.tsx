"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  CheckCircle2,
  Trophy,
  Target,
  Calendar,
  ShoppingCart,
  Users,
  Settings,
  X
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

/**
 * Notification Item Component
 */
export function NotificationItem({ notification }: { notification: any }) {
  const markRead = useMutation(api.notifications.markNotificationRead);
  
  const getIcon = () => {
    const iconMap: Record<string, any> = {
      achievement: Trophy,
      challenge: Target,
      class_reminder: Calendar,
      booking: ShoppingCart,
      social: Users,
      system: Settings,
    };
    const Icon = iconMap[notification.type] || Bell;
    return <Icon className="h-4 w-4" />;
  };
  
  const handleMarkRead = async () => {
    try {
      await markRead({ notificationId: notification._id });
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };
  
  return (
    <div
      className={`p-4 rounded-lg border transition-colors ${
        notification.read
          ? "bg-white/5 border-white/10"
          : "bg-white/10 border-white/20"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${notification.read ? "text-white/50" : "text-white/90"}`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={`font-semibold mb-1 ${notification.read ? "text-white/70" : "text-white"}`}>
                {notification.title}
              </h4>
              <p className={`text-sm mb-2 ${notification.read ? "text-white/50" : "text-white/70"}`}>
                {notification.message}
              </p>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                {notification.type && (
                  <>
                    <span>•</span>
                    <Badge variant="standard" className="text-xs capitalize">
                      {notification.type.replace(/_/g, " ")}
                    </Badge>
                  </>
                )}
              </div>
            </div>
            {!notification.read && (
              <Button
                variant="tertiary"
                size="sm"
                onClick={handleMarkRead}
                className="shrink-0"
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          {notification.link && (
            <Link href={notification.link}>
              <Button variant="secondary" size="sm" className="mt-2">
                View Details
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Notifications List Component
 */
export function NotificationsList() {
  const { user } = useUser();
  const notifications = useQuery(
    api.notifications.getUserNotifications,
    user?.id ? { clerkId: user.id, limit: 50 } : "skip"
  );
  
  const markAllRead = useMutation(api.notifications.markAllNotificationsRead);
  
  const handleMarkAllRead = async () => {
    try {
      await markAllRead({});
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };
  
  if (!notifications) {
    return (
      <Card variant="premium">
        <CardContent className="py-12">
          <div className="text-center">
            <Bell className="h-12 w-12 text-white/30 mx-auto mb-4 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  if (notifications.length === 0) {
    return (
      <Card variant="premium">
        <CardContent className="py-12">
          <div className="text-center">
            <Bell className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No Notifications
            </h3>
            <p className="text-white/70 text-sm">
              You're all caught up!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-white/70">
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </div>
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
            Mark All Read
          </Button>
        </div>
      )}
      
      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationItem key={notification._id} notification={notification} />
        ))}
      </div>
    </div>
  );
}

/**
 * Notification Bell Component
 * Shows notification count and dropdown
 */
export function NotificationBell() {
  const { user } = useUser();
  const unreadCount = useQuery(
    api.notifications.getUnreadNotificationCount,
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  return (
    <Link href="/notifications" className="relative">
      <Button variant="tertiary" size="sm" className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>
    </Link>
  );
}
