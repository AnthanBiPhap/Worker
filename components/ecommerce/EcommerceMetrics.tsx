"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";

interface MetricItem {
  total: number;
  changePercent: number;
}

interface EcommerceMetricsProps {
  customers: MetricItem;
  orders: MetricItem;
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

function ChangeBadge({ value }: { value: number }) {
  const isPositive = value >= 0;

  return (
    <Badge color={isPositive ? "success" : "error"}>
      {isPositive ? (
        <ArrowUpIcon />
      ) : (
        <ArrowDownIcon className="text-error-500" />
      )}
      {Math.abs(value).toFixed(2)}%
    </Badge>
  );
}

export const EcommerceMetrics = ({
  customers,
  orders,
}: EcommerceMetricsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Customers
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatNumber(customers.total)}
            </h4>
          </div>
          <ChangeBadge value={customers.changePercent} />
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Orders
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatNumber(orders.total)}
            </h4>
          </div>

          <ChangeBadge value={orders.changePercent} />
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
};
