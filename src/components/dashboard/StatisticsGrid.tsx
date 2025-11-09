"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  ShoppingBag,
  Calendar,
  Activity
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  trend?: "up" | "down";
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeLabel = "than last week", 
  icon: Icon,
  trend 
}: StatCardProps) {
  const isPositive = trend === "up" || (change !== undefined && change > 0);
  
  return (
    <Card variant="premium" className="hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-white/70">
          {title}
        </CardTitle>
        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
          <Icon className="h-5 w-5 text-white/70" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white mb-2">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {change !== undefined && (
          <div className="flex items-center gap-1 text-sm">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
            <span className={isPositive ? "text-emerald-400" : "text-red-400"}>
              {Math.abs(change)}%
            </span>
            <span className="text-white/50">{changeLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatisticsGridProps {
  stats: Array<{
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon: React.ElementType;
    trend?: "up" | "down";
  }>;
}

export function StatisticsGrid({ stats }: StatisticsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

// Predefined stat cards for common use cases
export function DashboardStats() {
  return (
    <StatisticsGrid
      stats={[
        {
          title: "Total Members",
          value: "1,234",
          change: 12.5,
          icon: Users,
          trend: "up",
        },
        {
          title: "Revenue",
          value: "$45,678",
          change: 8.2,
          icon: DollarSign,
          trend: "up",
        },
        {
          title: "Orders",
          value: "234",
          change: -3.1,
          icon: ShoppingBag,
          trend: "down",
        },
        {
          title: "Bookings",
          value: "89",
          change: 15.3,
          icon: Calendar,
          trend: "up",
        },
      ]}
    />
  );
}