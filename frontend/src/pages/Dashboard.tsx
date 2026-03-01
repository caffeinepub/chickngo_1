import { Users, QrCode, Star, TrendingUp, ArrowUpRight } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStats, useLocalCustomers, useGetAllOffers } from '../hooks/useQueries';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  trend?: string;
  isLoading?: boolean;
}

function StatCard({ title, value, icon, iconBg, trend, isLoading }: StatCardProps) {
  return (
    <Card className="stat-card shadow-card border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-9 w-20 mt-2" />
            ) : (
              <p className="text-3xl font-display font-bold text-foreground mt-1">{value}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight size={13} className="text-success" />
                <span className="text-xs text-success font-medium">{trend}</span>
              </div>
            )}
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: iconBg }}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: customers, isLoading: customersLoading } = useLocalCustomers();
  const { data: offers, isLoading: offersLoading } = useGetAllOffers();

  const recentCustomers = customers?.slice(-5).reverse() ?? [];

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Banner */}
        <div
          className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{ backgroundColor: 'oklch(0.22 0.015 240)' }}
        >
          <div
            className="absolute right-0 top-0 w-48 h-48 rounded-full opacity-10 -translate-y-1/2 translate-x-1/4"
            style={{ backgroundColor: 'oklch(0.65 0.19 45)' }}
          />
          <div className="relative">
            <h2 className="font-display font-bold text-xl">
              Welcome back, Admin! 👋
            </h2>
            <p className="text-sm mt-1 opacity-70">
              Here's what's happening with your loyalty program today.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Customers"
            value={stats?.totalCustomers ?? 0}
            icon={<Users size={22} className="text-white" />}
            iconBg="oklch(0.55 0.18 240)"
            trend="Registered members"
            isLoading={statsLoading}
          />
          <StatCard
            title="Today's Scans"
            value={stats?.todayScans ?? 0}
            icon={<QrCode size={22} className="text-white" />}
            iconBg="oklch(0.65 0.19 45)"
            trend="Scans today"
            isLoading={statsLoading}
          />
          <StatCard
            title="Total Points Issued"
            value={stats?.totalPoints ?? 0}
            icon={<Star size={22} className="text-white" />}
            iconBg="oklch(0.62 0.17 145)"
            trend="All time points"
            isLoading={statsLoading}
          />
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Customers */}
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users size={16} style={{ color: 'oklch(0.65 0.19 45)' }} />
                Recent Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : recentCustomers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No customers yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentCustomers.map((c) => (
                    <div
                      key={c.customerId}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                          style={{ backgroundColor: 'oklch(0.65 0.19 45)' }}
                        >
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.mobile}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded-full text-white"
                          style={{ backgroundColor: 'oklch(0.65 0.19 45)' }}
                        >
                          {c.points} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Offers */}
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp size={16} style={{ color: 'oklch(0.65 0.19 45)' }} />
                Active Offers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {offersLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !offers || offers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Star size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No offers created yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {offers.slice(0, 4).map((offer) => (
                    <div
                      key={offer.id.toString()}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="text-sm font-medium">{offer.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {offer.rewardDescription}
                        </p>
                      </div>
                      <span
                        className="text-xs font-semibold px-2 py-1 rounded-full text-white shrink-0 ml-2"
                        style={{ backgroundColor: 'oklch(0.62 0.17 145)' }}
                      >
                        {offer.requiredPoints.toString()} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
