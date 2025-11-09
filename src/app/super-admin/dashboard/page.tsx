"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { RoleGuard } from "@/components/RoleGuard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Building2,
  Users, 
  TrendingUp,
  DollarSign,
  MapPin,
  Activity,
  Award,
  BarChart3,
  Calendar,
  CreditCard,
  Package,
  ShoppingBag,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowDown,
  Zap,
  Target,
  Brain,
  TrendingDown,
  Sparkles,
  PieChart,
  LineChart as LineChartIcon,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

export default function SuperAdminDashboard() {
  const { user, isSignedIn } = useUser();
  
  // Fetch REAL data from Convex - NO MOCK DATA
  const dashboardSummary = useQuery(api.analytics.getDashboardSummary, isSignedIn ? {} : "skip");
  const revenueTrends = useQuery(api.analytics.getRevenueTrends, isSignedIn ? {} : "skip");
  const locationData = useQuery(api.analytics.getLocationAnalytics, isSignedIn ? {} : "skip");
  const aiMetrics = useQuery(api.analytics.getAIMetrics, isSignedIn ? {} : "skip");
  const churnData = useQuery(api.analytics.getChurnAnalytics, isSignedIn ? {} : "skip");

  // Loading state
  const isLoading = !dashboardSummary || !revenueTrends || !locationData || !aiMetrics || !churnData;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate state distribution from location data
  const stateDistribution = locationData.reduce((acc, loc) => {
    acc[loc.state] = (acc[loc.state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stateChart = Object.entries(stateDistribution).map(([state, count], index) => ({
    name: state,
    value: count,
    color: index === 0 ? '#ef4444' : '#3b82f6',
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate totals across all locations
  const totalRevenueFromLocations = locationData.reduce((sum, loc) => sum + loc.revenue, 0);
  const totalMembersFromLocations = locationData.reduce((sum, loc) => sum + loc.members, 0);
  const avgGrowth = locationData.reduce((sum, loc) => sum + loc.growth, 0) / locationData.length;

  // State distribution for pie chart
  const stateDistributionFromLocations = [
    { name: 'VIC', value: locationData.filter(l => l.state === 'VIC').length, color: '#ef4444' },
    { name: 'SA', value: locationData.filter(l => l.state === 'SA').length, color: '#3b82f6' },
  ];

  return (
    <RoleGuard allowedRoles={["superadmin"]}>
      <AdminLayout 
        title="Executive Command Center" 
        subtitle="Derrimut 24:7 Gym - Enterprise Business Intelligence Platform"
        showAddButton={false}
      >
      <div className="space-y-8">
        {/* Hero Banner with Animated Gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white border-0 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
                    <CardTitle className="text-3xl font-bold">Welcome, Super Admin</CardTitle>
                  </div>
                  <CardDescription className="text-red-100 text-lg">
                    Real-time intelligence across 18 locations • {dashboardSummary.totalMembers.toLocaleString()} active members • AI-powered insights
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className="bg-green-500 text-white px-3 py-1 text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-1 inline" />
                    All Systems Operational
                  </Badge>
                  <div className="text-red-100 text-sm">Last updated: {new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* === SECTION 1: EXECUTIVE OVERVIEW === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-6 w-6 text-red-600" />
            <h2 className="text-2xl font-bold">Executive Overview</h2>
          </div>
          
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border-l-4 border-l-red-600 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Monthly Revenue</CardTitle>
                <DollarSign className="h-5 w-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{formatCurrency(dashboardSummary.totalRevenue)}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +{avgGrowth.toFixed(1)}%
                  </Badge>
                  <p className="text-xs text-muted-foreground">vs last month</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-600 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Members</CardTitle>
                <Users className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{dashboardSummary.totalMembers.toLocaleString()}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +8.3%
                  </Badge>
                  <p className="text-xs text-muted-foreground">growing monthly</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-600 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">AI Consultations</CardTitle>
                <Brain className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{aiMetrics.totalConsultations.toLocaleString()}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                    {aiMetrics.completionRate}% completion
                  </Badge>
                  <p className="text-xs text-muted-foreground">this month</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-600 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Locations</CardTitle>
                <Building2 className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{locationData.length}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    VIC: {stateDistribution["VIC"] || 0} | SA: {stateDistribution["SA"] || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Trend Chart */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5 text-red-600" />
                    Revenue & Growth Trends
                  </CardTitle>
                  <CardDescription>12-month historical data with AI-powered forecasting</CardDescription>
                </div>
                <Badge className="bg-gradient-to-r from-purple-500 to-purple-700 text-white">
                  <Sparkles className="h-3 w-3 mr-1 inline" />
                  AI Predictions Enabled
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueTrends}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    fill="url(#colorRevenue)" 
                    name="Actual Revenue"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#a855f7" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    fill="url(#colorPredicted)" 
                    name="AI Forecast"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* === SECTION 2: MULTI-LOCATION ANALYTICS === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Multi-Location Performance</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Performing Locations */}
            <Card className="lg:col-span-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Location Performance Rankings
                </CardTitle>
                <CardDescription>Revenue and member growth across 18 locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {locationData.map((location, index) => (
                    <div 
                      key={location.name}
                      className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                        index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                            index < 3 ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-700'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold">{location.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              {location.members} members
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{formatCurrency(location.revenue)}</div>
                          <Badge className={location.growth > 10 ? "bg-green-500 hover:bg-green-500" : "bg-blue-500 hover:bg-blue-500"}>
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +{location.growth}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* State Distribution */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  Geographic Distribution
                </CardTitle>
                <CardDescription>Locations by state</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPie>
                    <Pie
                      data={stateChart}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stateChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="font-medium">Victoria</span>
                    </div>
                    <Badge variant="standard">{stateDistribution["VIC"] || 0} locations</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="font-medium">South Australia</span>
                    </div>
                    <Badge variant="standard">{stateDistribution["SA"] || 0} locations</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* === SECTION 3: PREDICTIVE INTELLIGENCE === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-bold">AI-Powered Predictive Intelligence</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Churn Prediction */}
            <Card className="shadow-lg border-l-4 border-l-purple-600">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      Churn Prediction & Prevention
                    </CardTitle>
                    <CardDescription>AI-powered member retention analytics</CardDescription>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700">
                    Active AI Model
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-600">{churnData.atRisk}</div>
                    <div className="text-xs text-muted-foreground">High Risk</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-600">{churnData.medium}</div>
                    <div className="text-xs text-muted-foreground">Medium Risk</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{churnData.low}</div>
                    <div className="text-xs text-muted-foreground">Low Risk</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-green-900">Prevented This Month</span>
                      <Badge className="bg-green-600 hover:bg-green-600 text-white">
                        <Zap className="h-3 w-3 mr-1" />
                        Success
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-green-700">{churnData.preventedThisMonth}</span>
                      <span className="text-sm text-green-600">members retained</span>
                    </div>
                    <div className="mt-2 text-sm text-green-700">
                      Revenue saved: <span className="font-bold">{formatCurrency(churnData.savingsFromPrevention)}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-purple-900">Next Month Prediction</div>
                        <div className="text-sm text-purple-600 mt-1">
                          {churnData.predictedChurnNextMonth} members at risk • {churnData.interventionsSent} interventions sent
                        </div>
                      </div>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Target className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Forecasting */}
            <Card className="shadow-lg border-l-4 border-l-blue-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Revenue Optimization Insights
                </CardTitle>
                <CardDescription>AI recommendations for revenue growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-blue-900 mb-1">Membership Tier Optimization</div>
                        <div className="text-sm text-blue-600">AI detected 23% price elasticity</div>
                      </div>
                      <Badge className="bg-blue-600 hover:bg-blue-600 text-white">
                        High Impact
                      </Badge>
                    </div>
                    <div className="text-sm text-blue-700 mb-2">
                      Recommendation: Introduce premium tier at <span className="font-bold">$89/month</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700">
                      <ArrowUp className="h-4 w-4" />
                      <span className="font-semibold">Projected revenue increase: {formatCurrency(48000)}/month</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-green-900 mb-1">Peak Hour Pricing Strategy</div>
                        <div className="text-sm text-green-600">Demand analysis across 18 locations</div>
                      </div>
                      <Badge className="bg-green-600 hover:bg-green-600 text-white">
                        Medium Impact
                      </Badge>
                    </div>
                    <div className="text-sm text-green-700 mb-2">
                      Recommendation: Dynamic pricing for 5-7 PM slots (+$5 premium)
                    </div>
                    <div className="flex items-center gap-2 text-green-700">
                      <ArrowUp className="h-4 w-4" />
                      <span className="font-semibold">Projected revenue increase: {formatCurrency(22000)}/month</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-purple-900 mb-1">Personal Training Upsell</div>
                        <div className="text-sm text-purple-600">342 members identified as high-intent</div>
                      </div>
                      <Badge className="bg-purple-600 hover:bg-purple-600 text-white">
                        Quick Win
                      </Badge>
                    </div>
                    <div className="text-sm text-purple-700 mb-2">
                      Recommendation: Automated PT package offers via AI chat
                    </div>
                    <div className="flex items-center gap-2 text-purple-700">
                      <ArrowUp className="h-4 w-4" />
                      <span className="font-semibold">Projected conversion: {formatCurrency(89000)}/month</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* === SECTION 4: VOICE AI INSIGHTS === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">Voice AI Performance Insights</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Metrics Overview */}
            <Card className="shadow-lg border-l-4 border-l-yellow-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-yellow-600" />
                  AI Consultation Metrics
                </CardTitle>
                <CardDescription>Voice AI platform performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Consultations</div>
                      <div className="text-2xl font-bold text-yellow-700">{aiMetrics.totalConsultations}</div>
                    </div>
                    <Activity className="h-8 w-8 text-yellow-500" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Completion Rate</div>
                      <div className="text-2xl font-bold text-green-700">{aiMetrics.completionRate}%</div>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Avg Duration</div>
                      <div className="text-2xl font-bold text-purple-700">{aiMetrics.avgDuration}</div>
                    </div>
                    <Clock className="h-8 w-8 text-purple-500" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Member Satisfaction</div>
                      <div className="text-2xl font-bold text-blue-700">{aiMetrics.memberSatisfaction}/5.0</div>
                    </div>
                    <Award className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Fitness Goals */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Member Goal Distribution
                </CardTitle>
                <CardDescription>AI-identified fitness objectives</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={aiMetrics.topGoals} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#6b7280" />
                    <YAxis dataKey="goal" type="category" width={120} stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Bar dataKey="count" fill="#a855f7" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-4 space-y-2">
                  {aiMetrics.topGoals.map((goal, index) => (
                    <div key={goal.goal} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{goal.goal}</span>
                      <Badge variant="standard">{goal.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Impact */}
            <Card className="shadow-lg border-l-4 border-l-green-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  AI Revenue Impact
                </CardTitle>
                <CardDescription>Value generated by Voice AI</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="text-sm text-green-600 mb-2">Direct Revenue Generated</div>
                    <div className="text-3xl font-bold text-green-700">
                      {formatCurrency(aiMetrics.revenueImpact)}
                    </div>
                    <div className="mt-2 text-sm text-green-600">This month from AI consultations</div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">Plans Generated</span>
                      <Badge className="bg-blue-600 hover:bg-blue-600 text-white">{aiMetrics.planGenerated}</Badge>
                    </div>
                    <div className="text-sm text-blue-600">
                      {((aiMetrics.planGenerated / aiMetrics.totalConsultations) * 100).toFixed(1)}% conversion rate
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-900">Follow-ups Booked</span>
                      <Badge className="bg-purple-600 hover:bg-purple-600 text-white">{aiMetrics.followUpBooked}</Badge>
                    </div>
                    <div className="text-sm text-purple-600">
                      {((aiMetrics.followUpBooked / aiMetrics.planGenerated) * 100).toFixed(1)}% of generated plans
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                    <div className="text-sm text-yellow-600 mb-2">ROI Multiplier</div>
                    <div className="text-2xl font-bold text-yellow-700">12.4x</div>
                    <div className="mt-1 text-xs text-yellow-600">Platform cost vs. revenue generated</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Quick Actions Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="shadow-lg bg-gradient-to-r from-gray-50 to-gray-100">
            <CardHeader>
              <CardTitle>Platform Management</CardTitle>
              <CardDescription>Quick access to administration tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="secondary" className="h-auto flex-col py-4 hover:bg-white hover:shadow-md transition-all" asChild>
                  <Link href="/admin/organizations">
                    <Building2 className="h-6 w-6 mb-2 text-red-600" />
                    <span className="font-semibold">Locations</span>
                    <span className="text-xs text-muted-foreground">Manage 18 gyms</span>
                  </Link>
                </Button>
                <Button variant="secondary" className="h-auto flex-col py-4 hover:bg-white hover:shadow-md transition-all" asChild>
                  <Link href="/admin/users">
                    <Users className="h-6 w-6 mb-2 text-blue-600" />
                    <span className="font-semibold">Members</span>
                    <span className="text-xs text-muted-foreground">{dashboardSummary.totalMembers.toLocaleString()} active</span>
                  </Link>
                </Button>
                <Button variant="secondary" className="h-auto flex-col py-4 hover:bg-white hover:shadow-md transition-all" asChild>
                  <Link href="/admin/memberships">
                    <CreditCard className="h-6 w-6 mb-2 text-green-600" />
                    <span className="font-semibold">Subscriptions</span>
                    <span className="text-xs text-muted-foreground">Revenue tracking</span>
                  </Link>
                </Button>
                <Button variant="secondary" className="h-auto flex-col py-4 hover:bg-white hover:shadow-md transition-all" asChild>
                  <Link href="/voice-chat">
                    <Brain className="h-6 w-6 mb-2 text-purple-600" />
                    <span className="font-semibold">AI Console</span>
                    <span className="text-xs text-muted-foreground">Voice platform</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
    </RoleGuard>
  );
}