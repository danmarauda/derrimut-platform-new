"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { Id } from "../../../../convex/_generated/dataModel";

export default function EventDetailPage() {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as Id<"events">;

  const event = useQuery(api.events.getEventById, user?.id ? { eventId } : "skip");
  const media = useQuery(api.events.getEventMedia, user?.id ? { eventId, limit: 6 } : "skip");

  const rsvpToEvent = useMutation(api.events.rsvpToEvent);

  const handleRSVP = async (status: "going" | "maybe" | "not_going") => {
    try {
      await rsvpToEvent({ eventId, status });
      toast.success(`RSVP ${status === "going" ? "confirmed" : "updated"}!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to RSVP");
    }
  };

  if (!user) {
    router.push("/");
    return null;
  }

  if (!event) {
    return (
      <UserLayout title="Event" subtitle="Loading...">
        <div className="animate-pulse">
          <div className="h-32 bg-white/5 rounded-lg"></div>
        </div>
      </UserLayout>
    );
  }

  const eventTypeLabels = {
    workshop: "Workshop",
    seminar: "Seminar",
    social: "Social",
    competition: "Competition",
    charity: "Charity",
    class: "Class",
  };

  return (
    <UserLayout title={event.title} subtitle={event.description}>
      <div className="space-y-6">
        {/* Event Header */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-6">
            {event.image && (
              <Image
                src={event.image}
                alt={event.title}
                width={800}
                height={400}
                className="rounded-lg w-full h-64 object-cover mb-4"
              />
            )}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-white">{event.title}</h1>
                  <Badge variant="secondary">
                    {eventTypeLabels[event.eventType]}
                  </Badge>
                </div>
                <p className="text-white/70">{event.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-white/70">
                <Calendar className="h-4 w-4" />
                {new Date(event.startDate).toLocaleDateString()} at{" "}
                {new Date(event.startDate).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              {event.locationDetails && (
                <div className="flex items-center gap-2 text-white/70">
                  <MapPin className="h-4 w-4" />
                  {event.locationDetails}
                </div>
              )}
              <div className="flex items-center gap-2 text-white/70">
                <Users className="h-4 w-4" />
                {event.goingCount || 0} going
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RSVP Actions */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle>RSVP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                onClick={() => handleRSVP("going")}
                variant={event.rsvpStatus === "going" ? "default" : "outline"}
                className={event.rsvpStatus === "going" ? "bg-green-600" : ""}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Going
              </Button>
              <Button
                onClick={() => handleRSVP("maybe")}
                variant={event.rsvpStatus === "maybe" ? "default" : "outline"}
                className={event.rsvpStatus === "maybe" ? "bg-yellow-600" : ""}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Maybe
              </Button>
              <Button
                onClick={() => handleRSVP("not_going")}
                variant={event.rsvpStatus === "not_going" ? "default" : "outline"}
                className={event.rsvpStatus === "not_going" ? "bg-red-600" : ""}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Can't Go
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Event Media Preview */}
        {media && media.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Event Media
                </CardTitle>
                <Link href={`/events/${eventId}/media`}>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {media.slice(0, 6).map((item) => (
                  <div key={item._id} className="relative aspect-square rounded-lg overflow-hidden bg-white/5">
                    {item.type === "photo" ? (
                      <Image
                        src={item.url}
                        alt={item.caption || "Event photo"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <video src={item.url} className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attendees */}
        {event.rsvps && event.rsvps.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle>Attendees ({event.goingCount})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {event.rsvps
                  .filter((r: any) => r.status === "going")
                  .map((rsvp: any) => (
                    <div
                      key={rsvp._id}
                      className="flex items-center gap-2 p-2 bg-white/5 rounded-lg"
                    >
                      <Image
                        src={rsvp.userImage || "/default-avatar.png"}
                        alt={rsvp.userName}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <span className="text-white text-sm">{rsvp.userName}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </UserLayout>
  );
}

