"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dumbbell, 
  Calendar, 
  Clock, 
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { format } from "date-fns";

/**
 * Equipment Card Component
 * Displays equipment with availability and reservation button
 */
export function EquipmentCard({ 
  equipment, 
  locationId,
  onReserve 
}: { 
  equipment: any;
  locationId: Id<"organizations">;
  onReserve: (equipmentId: Id<"inventory">) => void;
}) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      cardio: "text-red-400",
      strength: "text-blue-400",
      free_weights: "text-purple-400",
      functional: "text-green-400",
      accessories: "text-yellow-400",
    };
    return colors[category] || "text-white/70";
  };
  
  return (
    <Card variant="premium">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className={`h-5 w-5 ${getCategoryColor(equipment.category)}`} />
            <CardTitle>{equipment.name}</CardTitle>
          </div>
          <Badge variant={equipment.availableForReservation > 0 ? "accent" : "standard"}>
            {equipment.availableForReservation > 0 
              ? `${equipment.availableForReservation} Available`
              : "Unavailable"}
          </Badge>
        </div>
        <CardDescription className="capitalize">
          {equipment.category.replace(/_/g, " ")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {equipment.description && (
          <p className="text-sm text-white/70">{equipment.description}</p>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <div className="text-white/70">
            Total: {equipment.totalQuantity}
          </div>
          <div className="text-white/70">
            Available: {equipment.availableForReservation}
          </div>
        </div>
        
        <Button
          variant="primary"
          onClick={() => onReserve(equipment._id)}
          disabled={equipment.availableForReservation === 0}
          className="w-full"
        >
          {equipment.availableForReservation > 0 ? "Reserve Now" : "Unavailable"}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Equipment List Component
 * Displays all available equipment for a location
 */
export function EquipmentList({ locationId }: { locationId: Id<"organizations"> }) {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Id<"inventory"> | null>(null);
  
  const equipment = useQuery(
    api.equipmentReservations.getAvailableEquipment,
    { locationId, category: selectedCategory }
  );
  
  const categories = ["cardio", "strength", "free_weights", "functional", "accessories"];
  
  const handleReserve = (equipmentId: Id<"inventory">) => {
    setSelectedEquipment(equipmentId);
    setShowReservationModal(true);
  };
  
  if (!equipment) {
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
              {category.replace(/_/g, " ")}
            </Button>
          ))}
        </div>
      </div>
      
      {equipment.length === 0 ? (
        <Card variant="premium">
          <CardContent className="py-12">
            <div className="text-center">
              <Dumbbell className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                No Equipment Available
              </h3>
              <p className="text-white/70 text-sm">
                {selectedCategory 
                  ? `No ${selectedCategory.replace(/_/g, " ")} equipment available`
                  : "No equipment available for reservation"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map((item) => (
            <EquipmentCard
              key={item._id}
              equipment={item}
              locationId={locationId}
              onReserve={handleReserve}
            />
          ))}
        </div>
      )}
      
      {showReservationModal && selectedEquipment && (
        <ReservationModal
          equipmentId={selectedEquipment}
          locationId={locationId}
          onClose={() => {
            setShowReservationModal(false);
            setSelectedEquipment(null);
          }}
        />
      )}
    </>
  );
}

/**
 * Reservation Modal Component
 * Form for creating equipment reservations
 */
function ReservationModal({
  equipmentId,
  locationId,
  onClose,
}: {
  equipmentId: Id<"inventory">;
  locationId: Id<"organizations">;
  onClose: () => void;
}) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isReserving, setIsReserving] = useState(false);
  
  const reserveEquipment = useMutation(api.equipmentReservations.reserveEquipment);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startTime || !endTime) {
      alert("Please select start and end times");
      return;
    }
    
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    
    if (end <= start) {
      alert("End time must be after start time");
      return;
    }
    
    try {
      setIsReserving(true);
      await reserveEquipment({
        equipmentId,
        locationId,
        startTime: start,
        endTime: end,
        notes: notes || undefined,
      });
      onClose();
      alert("Equipment reserved successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to reserve equipment");
    } finally {
      setIsReserving(false);
    }
  };
  
  // Set default times (now and 1 hour from now)
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const defaultStart = now.toISOString().slice(0, 16);
  const defaultEnd = oneHourLater.toISOString().slice(0, 16);
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card variant="premium" className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Reserve Equipment</CardTitle>
          <CardDescription>
            Select your reservation time slot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime || defaultStart}
                onChange={(e) => setStartTime(e.target.value)}
                min={defaultStart}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime || defaultEnd}
                onChange={(e) => setEndTime(e.target.value)}
                min={startTime || defaultStart}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests..."
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isReserving}
                className="flex-1"
              >
                {isReserving ? "Reserving..." : "Reserve"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * User Reservations Component
 * Shows user's equipment reservations
 */
export function UserReservations() {
  const { user } = useUser();
  const reservations = useQuery(
    api.equipmentReservations.getUserReservations,
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  const cancelReservation = useMutation(api.equipmentReservations.cancelReservation);
  const completeReservation = useMutation(api.equipmentReservations.completeReservation);
  
  const handleCancel = async (reservationId: Id<"equipmentReservations">) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;
    
    try {
      await cancelReservation({ reservationId });
      alert("Reservation cancelled");
    } catch (error: any) {
      alert(error.message || "Failed to cancel reservation");
    }
  };
  
  const handleComplete = async (reservationId: Id<"equipmentReservations">) => {
    try {
      await completeReservation({ reservationId });
      alert("Reservation completed");
    } catch (error: any) {
      alert(error.message || "Failed to complete reservation");
    }
  };
  
  if (!reservations) {
    return <div className="text-white/70">Loading reservations...</div>;
  }
  
  if (reservations.length === 0) {
    return (
      <Card variant="premium">
        <CardContent className="py-12">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No Reservations
            </h3>
            <p className="text-white/70 text-sm">
              You haven't made any equipment reservations yet
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const now = Date.now();
  const upcoming = reservations.filter(r => r.endTime > now && r.status !== "cancelled" && r.status !== "completed");
  const past = reservations.filter(r => r.endTime <= now || r.status === "completed" || r.status === "cancelled");
  
  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Upcoming Reservations</h3>
          <div className="space-y-3">
            {upcoming.map((reservation) => (
              <Card key={reservation._id} variant="premium">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1">
                        {reservation.equipment?.name || "Unknown Equipment"}
                      </div>
                      <div className="text-sm text-white/70 space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(reservation.startTime), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(reservation.startTime), "h:mm a")} - {format(new Date(reservation.endTime), "h:mm a")}
                        </div>
                        {reservation.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {reservation.location.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant={reservation.status === "confirmed" ? "accent" : "standard"}>
                        {reservation.status}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCancel(reservation._id)}
                        >
                          Cancel
                        </Button>
                        {reservation.status === "confirmed" && reservation.startTime <= now && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleComplete(reservation._id)}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
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
          <h3 className="text-xl font-semibold text-white mb-4">Past Reservations</h3>
          <div className="space-y-3">
            {past.map((reservation) => (
              <Card key={reservation._id} variant="premium">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1">
                        {reservation.equipment?.name || "Unknown Equipment"}
                      </div>
                      <div className="text-sm text-white/70 space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(reservation.startTime), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(reservation.startTime), "h:mm a")} - {format(new Date(reservation.endTime), "h:mm a")}
                        </div>
                      </div>
                    </div>
                    <Badge variant={reservation.status === "completed" ? "accent" : "standard"}>
                      {reservation.status}
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
