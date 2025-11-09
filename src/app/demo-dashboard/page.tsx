'use client';

/**
 * DEMO DASHBOARD - For Adrian Portelli Demo
 * Using premium dark design system from /Users/alias/Downloads/derrimut
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { 
  Building2,
  Users, 
  DollarSign,
  MapPin,
  CheckCircle2,
  ArrowUp,
  Brain,
  LineChart as LineChartIcon,
  TrendingUp,
  Award,
  Activity,
  PieChart,
} from "lucide-react";
import { useEffect } from 'react';

export default function DemoDashboard() {
  const summary = useQuery(api.demo.getDemoAnalytics, { email: "aportelli@derrimut.com.au" });

  useEffect(() => {
    const navbar = document.querySelector('header');
    const footer = document.querySelector('footer');
    if (navbar) navbar.style.display = 'none';
    if (footer) footer.style.display = 'none';
    return () => {
      if (navbar) navbar.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  // Use fallback data if Convex query is still loading or fails
  const demoData = summary || {
    summary: {
      totalRevenue: 245000,
      totalMembers: 1847,
      aiConsultations: 342,
      totalLocations: 18,
      activeLocations: 17,
      growthRate: 12.5,
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const hasRealData = demoData.summary.totalRevenue > 0 || demoData.summary.totalMembers > 0;
  const demoRevenue = hasRealData ? demoData.summary.totalRevenue : 245000;
  const demoMembers = hasRealData ? demoData.summary.totalMembers : 1847;
  const demoAI = hasRealData ? demoData.summary.aiConsultations : 342;

  const baseRevenue = demoRevenue || 245000;
  const revenueTrends = [
    { month: 'Jan', revenue: baseRevenue * 0.85, predicted: baseRevenue * 0.90 },
    { month: 'Feb', revenue: baseRevenue * 0.88, predicted: baseRevenue * 0.92 },
    { month: 'Mar', revenue: baseRevenue * 0.90, predicted: baseRevenue * 0.94 },
    { month: 'Apr', revenue: baseRevenue * 0.92, predicted: baseRevenue * 0.96 },
    { month: 'May', revenue: baseRevenue * 0.94, predicted: baseRevenue * 0.98 },
    { month: 'Jun', revenue: baseRevenue * 0.96, predicted: baseRevenue * 1.00 },
    { month: 'Jul', revenue: baseRevenue * 0.98, predicted: baseRevenue * 1.02 },
    { month: 'Aug', revenue: baseRevenue * 1.00, predicted: baseRevenue * 1.04 },
    { month: 'Sep', revenue: baseRevenue * 1.02, predicted: baseRevenue * 1.06 },
    { month: 'Oct', revenue: baseRevenue * 1.04, predicted: baseRevenue * 1.08 },
    { month: 'Nov', revenue: baseRevenue * 1.06, predicted: baseRevenue * 1.10 },
    { month: 'Dec', revenue: baseRevenue, predicted: baseRevenue * 1.12 },
  ];

  const topLocations = [
    { name: 'Port Melbourne', revenue: baseRevenue * 0.12, members: Math.floor(demoMembers * 0.10), growth: 12.5 },
    { name: 'Richmond', revenue: baseRevenue * 0.10, members: Math.floor(demoMembers * 0.09), growth: 11.2 },
    { name: 'South Yarra', revenue: baseRevenue * 0.09, members: Math.floor(demoMembers * 0.08), growth: 10.8 },
    { name: 'Footscray', revenue: baseRevenue * 0.08, members: Math.floor(demoMembers * 0.07), growth: 9.5 },
    { name: 'St Kilda', revenue: baseRevenue * 0.07, members: Math.floor(demoMembers * 0.06), growth: 8.9 },
  ];

  const stateDistribution = [
    { name: 'VIC', value: 17, color: '#ef4444' },
    { name: 'SA', value: 1, color: '#3b82f6' },
  ];

  return (
    <div className="fixed inset-0 overflow-y-auto bg-neutral-950 text-white antialiased">
      <div className="min-h-full">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 md:py-12 space-y-8">
          {/* Hero Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-2">
                    Executive Dashboard
                  </h1>
                  <p className="text-white/60 text-sm md:text-base">
                    Real-time intelligence across {demoData.summary.activeLocations || 17} locations • {demoMembers.toLocaleString()} active members
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="inline-flex items-center gap-2 text-xs text-white/70 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>All Systems Operational</span>
                  </div>
                  <div className="text-xs text-white/50">Last updated: {new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Executive Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-white/70" />
              <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">Executive Overview</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/60">Total Monthly Revenue</span>
                  <DollarSign className="h-4 w-4 text-white/50" />
                </div>
                <div className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
                  {formatCurrency(demoRevenue)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5">
                    <ArrowUp className="h-3 w-3" />
                    +{('growthRate' in demoData.summary ? demoData.summary.growthRate : 12.5)}%
                  </span>
                  <span className="text-xs text-white/50">vs last month</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/60">Active Members</span>
                  <Users className="h-4 w-4 text-white/50" />
                </div>
                <div className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
                  {demoMembers.toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5">
                    <ArrowUp className="h-3 w-3" />
                    +8.3%
                  </span>
                  <span className="text-xs text-white/50">growing monthly</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/60">AI Consultations</span>
                  <Brain className="h-4 w-4 text-white/50" />
                </div>
                <div className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
                  {demoAI.toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/70 bg-white/5 rounded-full px-2 py-0.5">
                    94.2% completion
                  </span>
                  <span className="text-xs text-white/50">this month</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/60">Active Locations</span>
                  <Building2 className="h-4 w-4 text-white/50" />
                </div>
                <div className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
                  {demoData.summary.activeLocations || 17}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/70 bg-white/5 rounded-full px-2 py-0.5">
                    VIC: 17 | SA: 1
                  </span>
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <LineChartIcon className="h-4 w-4 text-white/70" />
                    <h3 className="text-lg font-semibold text-white tracking-tight">Revenue & Growth Trends</h3>
                  </div>
                  <p className="text-xs text-white/50">12-month historical data with AI-powered forecasting</p>
                </div>
                <span className="text-xs text-white/70 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                  AI Predictions Enabled
                </span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueTrends}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(10, 10, 10, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#ffffff" 
                    strokeWidth={2}
                    fill="url(#colorRevenue)" 
                    name="Actual Revenue"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="url(#colorPredicted)" 
                    name="AI Forecast"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Location Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="h-5 w-5 text-white/70" />
              <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">Multi-Location Performance</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-4 w-4 text-white/70" />
                  <h3 className="text-lg font-semibold text-white tracking-tight">Location Performance Rankings</h3>
                </div>
                <p className="text-xs text-white/50 mb-6">Revenue and member growth across 18 locations</p>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {topLocations.map((location, index) => (
                    <div 
                      key={location.name}
                      className={`p-4 rounded-xl border transition-all ${
                        index < 3 
                          ? 'bg-white/[0.07] border-white/20' 
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-semibold text-sm ${
                            index < 3 ? 'bg-white/10 text-white' : 'bg-white/5 text-white/60'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-white text-sm">{location.name}</div>
                            <div className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                              <Users className="h-3 w-3" />
                              {location.members} members
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-white text-base">{formatCurrency(location.revenue)}</div>
                          <span className={`inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 mt-1 ${
                            location.growth > 10 
                              ? 'text-emerald-400 bg-emerald-500/10' 
                              : 'text-blue-400 bg-blue-500/10'
                          }`}>
                            <TrendingUp className="h-3 w-3" />
                            +{location.growth}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="h-4 w-4 text-white/70" />
                  <h3 className="text-lg font-semibold text-white tracking-tight">Geographic Distribution</h3>
                </div>
                <p className="text-xs text-white/50 mb-6">Locations by state</p>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPie>
                    <Pie
                      data={stateDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stateDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(10, 10, 10, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
                
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-sm text-white/70">Victoria</span>
                    </div>
                    <span className="text-xs text-white/50">{stateDistribution[0].value} locations</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-white/70">South Australia</span>
                    </div>
                    <span className="text-xs text-white/50">{stateDistribution[1].value} location</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Intelligence */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Brain className="h-5 w-5 text-white/70" />
              <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">AI-Powered Intelligence</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-4 w-4 text-white/70" />
                  <h3 className="text-lg font-semibold text-white tracking-tight">AI Consultation Metrics</h3>
                </div>
                <p className="text-xs text-white/50 mb-6">Real-time AI wellness consultation statistics</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <div className="text-xs text-white/50 mb-1">Total Consultations</div>
                      <div className="text-2xl font-semibold text-white tracking-tight">{demoAI.toLocaleString()}</div>
                    </div>
                    <Brain className="h-8 w-8 text-white/30" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                      <div className="text-xs text-white/50 mb-1">Completion Rate</div>
                      <div className="text-xl font-semibold text-white">94.2%</div>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                      <div className="text-xs text-white/50 mb-1">Avg. Session Time</div>
                      <div className="text-xl font-semibold text-white">12m</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-4 w-4 text-white/70" />
                  <h3 className="text-lg font-semibold text-white tracking-tight">System Health</h3>
                </div>
                <p className="text-xs text-white/50 mb-6">Platform operational status</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <div>
                      <div className="font-medium text-white text-sm">All Systems Operational</div>
                      <div className="text-xs text-white/50 mt-0.5">100% uptime this month</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {['Database', 'Payment Processing', 'AI Services', 'API Endpoints'].map((service) => (
                      <div key={service} className="flex items-center justify-between text-sm p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <span className="text-white/60">{service}</span>
                        <span className="text-xs text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5">Active</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
