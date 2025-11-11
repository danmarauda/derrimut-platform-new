"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Plus,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export default function EventsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);

  const events = useQuery(
    api.events.getEvents,
    user?.id
      ? {
          eventType: selectedType as any,
          upcomingOnly: true,
          limit: 50,
        }
      : "skip"
  );
  const userEvents = useQuery(
    api.events.getUserEvents,
    user?.id ? { status: "going" } : "skip"
  );

  const rsvpToEvent = useMutation(api.events.rsvpToEvent);

  const handleRSVP = async (eventId: string, status: "going" | "maybe" | "not_going") => {
    try {
      await rsvpToEvent({ eventId: eventId as any, status });
      toast.success(`RSVP ${status === "going" ? "confirmed" : "updated"}!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to RSVP");
    }
  };

  if (!user) {
    router.push("/");
    return null;
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
    <UserLayout title="Events & Meetups" subtitle="Join gym events and connect with members">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1"></div>
          <Button
            onClick={() => router.push("/events/create")}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Event Type Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedType === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(undefined)}
            className={selectedType === undefined ? "bg-primary" : "border-white/20"}
          >
            All Events
          </Button>
          {Object.entries(eventTypeLabels).map(([type, label]) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type)}
              className={selectedType === type ? "bg-primary" : "border-white/20"}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* My Events */}
        {userEvents && userEvents.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                My Events ({userEvents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userEvents.map((event) => (
                  <Link key={event._id} href={`/events/${event._id}`}>
                    <Card className="bg-white/5 border-white/10 hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {event.image ? (
                            <Image
                              src={event.image}
                              alt={event.title}
                              width={80}
                              height={80}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-lg bg-primary/20 flex items-center justify-center">
                              <Calendar className="h-8 w-8 text-primary" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-white mb-1">{event.title}</h3>
                                <p className="text-sm text-white/60 line-clamp-2">
                                  {event.description}
                                </p>
                              </div>
                              <Badge variant="secondary">{eventTypeLabels[event.eventType]}</Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-sm text-white/60">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(event.startDate).toLocaleDateString()} at{" "}
                                {new Date(event.startDate).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              {event.locationDetails && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {event.locationDetails}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {event.goingCount || 0} going
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Events */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription className="text-white/60">
              Join events and meet other members
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events && events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card
                    key={event._id}
                    className="bg-white/5 border-white/10 hover:border-primary/50 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {event.image ? (
                          <Image
                            src={event.image}
                            alt={event.title}
                            width={80}
                            height={80}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Calendar className="h-8 w-8 text-primary" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-white mb-1">{event.title}</h3>
                              <p className="text-sm text-white/60 line-clamp-2">
                                {event.description}
                              </p>
                            </div>
                            <Badge variant="secondary">{eventTypeLabels[event.eventType]}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mb-3 text-sm text-white/60">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(event.startDate).toLocaleDateString()} at{" "}
                              {new Date(event.startDate).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            {event.locationDetails && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {event.locationDetails}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {event.goingCount || 0} going
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {event.rsvpStatus === "going" ? (
                              <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Going
                              </Badge>
                            ) : event.rsvpStatus === "maybe" ? (
                              <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Maybe
                              </Badge>
                            ) : (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleRSVP(event._id, "going")}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  Going
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRSVP(event._id, "maybe")}
                                  className="border-white/20"
                                >
                                  Maybe
                                </Button>
                                <Link href={`/events/${event._id}`}>
                                  <Button size="sm" variant="outline" className="border-white/20">
                                    View Details
                                  </Button>
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/60">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming events. Create one to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}

