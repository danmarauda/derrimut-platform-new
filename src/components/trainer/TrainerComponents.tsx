"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Users,
  Star,
  TrendingUp,
  CheckCircle,
  XCircle,
  DollarSign,
  Award,
  Activity,
  Edit,
  Save,
  X
} from "lucide-react";

interface TrainerStatsProps {
  stats: {
    totalBookings: number;
    completedBookings: number;
    upcomingBookings: number;
    totalEarnings: number;
    averageRating: number;
    totalClients: number;
  };
}

export function TrainerStats({ stats }: TrainerStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card variant="premium">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 mb-1">Total Bookings</p>
              <p className="text-2xl font-semibold text-white">{stats.totalBookings}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <Calendar className="h-6 w-6 text-white/70" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-white/50">
              {stats.completedBookings} completed
            </p>
          </div>
        </CardContent>
      </Card>

      <Card variant="premium">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 mb-1">Upcoming Sessions</p>
              <p className="text-2xl font-semibold text-white">{stats.upcomingBookings}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <Clock className="h-6 w-6 text-white/70" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="premium">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 mb-1">Total Earnings</p>
              <p className="text-2xl font-semibold text-white">{formatCurrency(stats.totalEarnings)}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <DollarSign className="h-6 w-6 text-white/70" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="premium">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 mb-1">Average Rating</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-semibold text-white">{stats.averageRating.toFixed(1)}</p>
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              </div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <Star className="h-6 w-6 text-white/70" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface BookingCardProps {
  booking: {
    _id: any;
    date: string;
    time: string;
    status: string;
    clientName: string;
    clientEmail?: string;
    duration: number;
    totalPrice: number;
  };
  onStatusChange?: (bookingId: string, status: string) => Promise<void>;
  onCancel?: (bookingId: string) => Promise<void>;
}

export function BookingCard({ booking, onStatusChange, onCancel }: BookingCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = () => {
    switch (booking.status) {
      case "confirmed":
        return <Badge variant="accent">Confirmed</Badge>;
      case "completed":
        return <Badge variant="standard" className="bg-emerald-500/20 border-emerald-500/30 text-emerald-400">Completed</Badge>;
      case "cancelled":
        return <Badge variant="standard" className="bg-red-500/20 border-red-500/30 text-red-400">Cancelled</Badge>;
      default:
        return <Badge variant="standard">Pending</Badge>;
    }
  };

  return (
    <Card variant="premium">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-white font-semibold">{booking.clientName}</h3>
              {getStatusBadge()}
            </div>
            {booking.clientEmail && (
              <p className="text-white/60 text-sm mb-3">{booking.clientEmail}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(booking.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {booking.time} ({booking.duration} min)
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {formatCurrency(booking.totalPrice)}
              </span>
            </div>
          </div>
        </div>
        
        {onStatusChange && booking.status === "confirmed" && (
          <div className="flex gap-2 pt-4 border-t border-white/10">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onStatusChange(String(booking._id), "completed")}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
            {onCancel && (
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => onCancel(String(booking._id))}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}