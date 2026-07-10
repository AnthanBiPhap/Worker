import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";

type Customer = Pick<
  Tables<"customers">,
  "id" | "full_name" | "avatar_url" | "location" | "created_at"
>;

type Order = Pick<
  Tables<"orders">,
  | "id"
  | "order_number"
  | "customer_id"
  | "title"
  | "category"
  | "amount"
  | "status"
  | "order_date"
>;

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toCurrencyShort(value: number) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (value >= 1_000_000) {
    return `${Math.round(value / 1_000_000)}M`;
  }

  return `${Math.round(value).toLocaleString("vi-VN")}`;
}

function changePercent(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(2));
}

function monthKey(dateValue: string) {
  const date = new Date(dateValue);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function statusLabel(status: Order["status"]): "Delivered" | "Pending" | "Canceled" {
  if (status === "delivered") return "Delivered";
  if (status === "pending") return "Pending";
  return "Canceled";
}

export async function getDashboardData() {
  const supabase = await createClient();
  const now = new Date();
  const currentMonthStart = monthStart(now);
  const nextMonthStart = addMonths(currentMonthStart, 1);
  const previousMonthStart = addMonths(currentMonthStart, -1);
  const twelveMonthsStart = addMonths(currentMonthStart, -11);

  const [
    customersTotal,
    customersCurrentMonth,
    customersPreviousMonth,
    ordersTotal,
    ordersCurrentMonth,
    ordersPreviousMonth,
    ordersForCharts,
    recentOrders,
    customers,
    currentTarget,
  ] = await Promise.all([
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .gte("created_at", currentMonthStart.toISOString())
      .lt("created_at", nextMonthStart.toISOString()),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .gte("created_at", previousMonthStart.toISOString())
      .lt("created_at", currentMonthStart.toISOString()),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id, amount, status, order_date")
      .gte("order_date", toDateKey(currentMonthStart))
      .lt("order_date", toDateKey(nextMonthStart)),
    supabase
      .from("orders")
      .select("id")
      .gte("order_date", toDateKey(previousMonthStart))
      .lt("order_date", toDateKey(currentMonthStart)),
    supabase
      .from("orders")
      .select("id, order_number, customer_id, title, category, amount, status, order_date")
      .gte("order_date", toDateKey(twelveMonthsStart))
      .order("order_date", { ascending: true }),
    supabase
      .from("orders")
      .select("id, order_number, customer_id, title, category, amount, status, order_date")
      .order("order_date", { ascending: false })
      .limit(5),
    supabase
      .from("customers")
      .select("id, full_name, avatar_url, location, created_at"),
    supabase
      .from("monthly_targets")
      .select("target_revenue, target_orders, target_customers")
      .eq("month", toDateKey(currentMonthStart))
      .maybeSingle(),
  ]);

  const firstError = [
    customersTotal.error,
    customersCurrentMonth.error,
    customersPreviousMonth.error,
    ordersTotal.error,
    ordersCurrentMonth.error,
    ordersPreviousMonth.error,
    ordersForCharts.error,
    recentOrders.error,
    customers.error,
    currentTarget.error,
  ].find(Boolean);

  if (firstError) {
    throw new Error(firstError.message);
  }

  const customerRows = (customers.data ?? []) as Customer[];
  const chartOrders = (ordersForCharts.data ?? []) as Order[];
  const recentOrderRows = (recentOrders.data ?? []) as Order[];
  const currentMonthOrders = ordersCurrentMonth.data ?? [];
  const customerById = new Map(customerRows.map((customer) => [customer.id, customer]));

  const currentRevenue = currentMonthOrders.reduce(
    (sum, order) => sum + Number(order.amount ?? 0),
    0,
  );
  const todayRevenue = currentMonthOrders
    .filter((order) => order.order_date === toDateKey(now))
    .reduce((sum, order) => sum + Number(order.amount ?? 0), 0);
  const targetRevenue = Number(currentTarget.data?.target_revenue ?? 0);
  const targetProgress =
    targetRevenue > 0 ? Math.min(100, Number(((currentRevenue / targetRevenue) * 100).toFixed(2))) : 0;

  const monthBuckets = Array.from({ length: 12 }, (_, index) => {
    const date = addMonths(twelveMonthsStart, index);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: monthLabels[date.getMonth()],
      orderCount: 0,
      revenue: 0,
    };
  });
  const monthBucketByKey = new Map(monthBuckets.map((bucket) => [bucket.key, bucket]));

  chartOrders.forEach((order) => {
    const bucket = monthBucketByKey.get(monthKey(order.order_date));
    if (!bucket) return;

    bucket.orderCount += 1;
    bucket.revenue += Number(order.amount ?? 0);
  });

  const demographicCounts = new Map<string, number>();
  customerRows.forEach((customer) => {
    const location = customer.location ?? "Không xác định";
    demographicCounts.set(location, (demographicCounts.get(location) ?? 0) + 1);
  });
  const demographicTotal = Math.max(customerRows.length, 1);

  return {
    metrics: {
      customers: {
        total: customersTotal.count ?? 0,
        changePercent: changePercent(
          customersCurrentMonth.count ?? 0,
          customersPreviousMonth.count ?? 0,
        ),
      },
      orders: {
        total: ordersTotal.count ?? 0,
        changePercent: changePercent(
          currentMonthOrders.length,
          ordersPreviousMonth.count ?? 0,
        ),
      },
    },
    monthlyTarget: {
      progress: targetProgress,
      changePercent: changePercent(currentRevenue, targetRevenue),
      targetLabel: toCurrencyShort(targetRevenue),
      revenueLabel: toCurrencyShort(currentRevenue),
      todayLabel: toCurrencyShort(todayRevenue),
      description: `This month revenue is ${toCurrencyShort(currentRevenue)} against a ${toCurrencyShort(targetRevenue)} target.`,
    },
    monthlySales: {
      categories: monthBuckets.map((bucket) => bucket.label),
      data: monthBuckets.map((bucket) => Math.round(bucket.revenue / 1_000_000)),
    },
    statistics: {
      categories: monthBuckets.map((bucket) => bucket.label),
      orders: monthBuckets.map((bucket) => bucket.orderCount),
      revenue: monthBuckets.map((bucket) => Math.round(bucket.revenue / 1_000_000)),
    },
    recentOrders: recentOrderRows.map((order) => {
      const customer = order.customer_id ? customerById.get(order.customer_id) : undefined;

      return {
        id: order.id,
        name: order.title,
        variants: customer?.full_name ?? order.order_number,
        category: order.category ?? "General",
        price: `${Number(order.amount).toLocaleString("vi-VN")}đ`,
        image: customer?.avatar_url ?? "/images/product/product-01.jpg",
        status: statusLabel(order.status),
      };
    }),
    demographics: Array.from(demographicCounts.entries())
      .map(([location, count], index) => ({
        location,
        count,
        percent: Math.round((count / demographicTotal) * 100),
        image: `/images/country/country-${String((index % 8) + 1).padStart(2, "0")}.svg`,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4),
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
