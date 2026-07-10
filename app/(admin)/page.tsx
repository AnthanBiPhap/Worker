import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import { getDashboardData } from "@/lib/admin/dashboard";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default async function Ecommerce() {
  const dashboard = await getDashboardData();

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics
          customers={dashboard.metrics.customers}
          orders={dashboard.metrics.orders}
        />

        <MonthlySalesChart
          categories={dashboard.monthlySales.categories}
          data={dashboard.monthlySales.data}
        />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget {...dashboard.monthlyTarget} />
      </div>

      <div className="col-span-12">
        <StatisticsChart
          categories={dashboard.statistics.categories}
          orders={dashboard.statistics.orders}
          revenue={dashboard.statistics.revenue}
        />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard demographics={dashboard.demographics} />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders orders={dashboard.recentOrders} />
      </div>
    </div>
  );
}
