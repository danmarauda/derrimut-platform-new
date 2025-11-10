"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Users,
  MapPin,
  User,
  CheckCircle2,
  XCircle,
  Filter
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { format } from "date-fns";

/**
 * Class Card Component
 * Displays a fitness class with booking button
 */
export function ClassCard({ classItem }: { classItem: any }) {
  const { user } = useUser();
  const bookClass = useMutation(api.groupClasses.bookClass);
  const [isBooking, setIsBooking] = useState(false);
  
  const isBooked = classItem.userBooking?.status === "booked";
  const isFull = classItem.availableSpots === 0;
  
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      yoga: "text-purple-400",
      zumba: "text-pink-400",
      spin: "text-red-400",
      hiit: "text-orange-400",
      pilates: "text-blue-400",
      strength: "text-yellow-400",
      cardio: "text-green-400",
      dance: "text-indigo-400",
    };
    return colors[category] || "text-white/70";
  };
  
  const handleBook = async () => {
    try {
      setIsBooking(true);
      await bookClass({ classId: classItem._id });
      alert("Class booked successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to book class");
    } finally {
      setIsBooking(false);
    }
  };
  
  return (
    <Card variant="premium">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="capitalize">{classItem.name}</CardTitle>
            <CardDescription className="capitalize mt-1">
              {classItem.category}
            </CardDescription>
          </div>
          <Badge 
            variant={isFull ? "standard" : isBooked ? "accent" : "premium"}
            className="capitalize"
          >
            {isBooked ? "Booked" : isFull ? "Full" : `${classItem.availableSpots} spots`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {classItem.description && (
          <p className="text-sm text-white/70">{classItem.description}</p>
        )}
        
        <div className="space-y-2 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {format(new Date(classItem.startTime), "EEEE, MMM d, yyyy")}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {format(new Date(classItem.startTime), "h:mm a")} - {format(new Date(classItem.endTime), "h:mm a")} ({classItem.duration} min)
          </div>
          {classItem.instructor && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {classItem.instructor.name}
            </div>
          )}
          {classItem.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {classItem.location.name}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {classItem.bookedCount} / {classItem.capacity} booked
          </div>
        </div>
        
        {!isBooked && (
          <Button
            variant="primary"
            onClick={handleBook}
            disabled={isBooking || isFull}
            className="w-full"
          >
            {isBooking ? "Booking..." : isFull ? "Class Full" : "Book Class"}
          </Button>
        )}
        
        {isBooked && (
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">You're booked!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Classes List Component
 * Displays all available classes
 */
export function ClassesList({ locationId }: { locationId?: Id<"organizations"> }) {
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  
  const classes = useQuery(
    api.groupClasses.getActiveClasses,
    { locationId }
  );
  
  const userBookings = useQuery(
    api.groupClasses.getUserClassBookings,
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  // Merge user booking status
  const classesWithBooking = classes?.map(classItem => {
    const userBooking = userBookings?.find(
      ub => ub.classId === classItem._id && ub.status === "booked"
    );
    return { ...classItem, userBooking };
  }) || [];
  
  const categories = ["yoga", "zumba", "spin", "hiit", "pilates", "strength", "cardio", "dance"];
  
  const filteredClasses = selectedCategory
    ? classesWithBooking.filter(c => c.category === selectedCategory)
    : classesWithBooking;
  
  if (!classes) {
    return (
      <Card variant="premium">
        <CardContent className="py-12">
          <div className="text-center">
            <Clock className="h-12 w-12 text-white/30 mx-auto mb-4 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-white/70" />
          <span className="text-white/70">Filter by category:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === undefined ? "primary" : "secondary"}
            size="sm"
            onClick={() => setSelectedCategory(undefined)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "primary" : "secondary"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
      
      {filteredClasses.length === 0 ? (
        <Card variant="premium">
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                No Classes Available
              </h3>
              <p className="text-white/70 text-sm">
                {selectedCategory 
                  ? `No ${selectedCategory} classes available`
                  : "No classes scheduled"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <ClassCard key={classItem._id} classItem={classItem} />
          ))}
        </div>
      )}
    </>
  );
}

/**
 * User Class Bookings Component
 * Shows user's class bookings
 */
export function UserClassBookings() {
  const { user } = useUser();
  const bookings = useQuery(
    api.groupClasses.getUserClassBookings,
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  const cancelBooking = useMutation(api.groupClasses.cancelClassBooking);
  
  const handleCancel = async (bookingId: Id<"classBookings">) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      await cancelBooking({ bookingId });
      alert("Booking cancelled");
    } catch (error: any) {
      alert(error.message || "Failed to cancel booking");
    }
  };
  
  if (!bookings) {
    return <div className="text-white/70">Loading bookings...</div>;
  }
  
  if (bookings.length === 0) {
    return (
      <Card variant="premium">
        <CardContent className="py-12">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No Bookings
            </h3>
            <p className="text-white/70 text-sm">
              You haven't booked any classes yet
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const now = Date.now();
  const upcoming = bookings.filter(b => b.class.startTime > now && b.status === "booked");
  const past = bookings.filter(b => b.class.startTime <= now || b.status !== "booked");
  
  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Upcoming Classes</h3>
          <div className="space-y-3">
            {upcoming.map((booking) => (
              <Card key={booking._id} variant="premium">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1 capitalize">
                        {booking.class.name}
                      </div>
                      <div className="text-sm text-white/70 space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(booking.class.startTime), "EEEE, MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(booking.class.startTime), "h:mm a")} - {format(new Date(booking.class.endTime), "h:mm a")}
                        </div>
                        {booking.class.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {booking.class.location.name}
                          </div>
                        )}
                        {booking.class.instructor && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {booking.class.instructor.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant="accent">
                        {booking.status}
                      </Badge>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCancel(booking._id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {past.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Past Classes</h3>
          <div className="space-y-3">
            {past.map((booking) => (
              <Card key={booking._id} variant="premium">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1 capitalize">
                        {booking.class.name}
                      </div>
                      <div className="text-sm text-white/70 space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(booking.class.startTime), "EEEE, MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(booking.class.startTime), "h:mm a")} - {format(new Date(booking.class.endTime), "h:mm a")}
                        </div>
                      </div>
                    </div>
                    <Badge variant={booking.status === "attended" ? "accent" : "standard"}>
                      {booking.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
