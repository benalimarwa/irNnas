export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  topProducts: { name: string; sales: number; revenue: number }[];
  recentOrders: {
    id: number;
    userName: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
  revenueByMonth: { month: string; revenue: number }[];
}