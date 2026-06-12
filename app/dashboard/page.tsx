"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { Order, PaginatedResponse } from "@/types";
import { useAuthStore } from "@/store/authStore";
import {
  OrderStatusBadge,
  LoadingSkeleton,
  EmptyState,
} from "@/components";

import {
  formatRupiah,
  formatDateShort,
} from "@/lib/utils";

import {
  ShoppingBag,
  Clock,
  CheckCircle2,
} from "lucide-react";

const fetcher = (url: string) =>
  apiClient
    .get(url)
    .then((res) => res.data as PaginatedResponse<Order>);

export default function DashboardPage() {
  const { user } = useAuthStore();

  const [isMounted, setIsMounted] =
    useState(false);

  const {
    data: ordersData,
    isLoading,
  } = useSWR<PaginatedResponse<Order>>(
    "/orders?limit=5",
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const orders = ordersData?.data || [];

  const totalOrders =
    ordersData?.pagination.total_items || 0;

  const completedOrders = orders.filter(
    (o) => o.status === "completed"
  ).length;

  const pendingOrders = orders.filter((o) =>
    ["pending_payment", "processing"].includes(
      o.status
    )
  ).length;

  return (
    <div className="section-padding px-4 sm:px-6 lg:px-8">
      <div className="max-content w-full">
        {/* Greeting */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary mb-2 break-words">
            Selamat datang, {user?.name}!
          </h1>

          <p className="text-sm sm:text-base text-text-secondary">
            Kelola pesanan dan transaksi Anda di sini
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 lg:mb-12">
          {/* Total Orders */}
          <div className="card-border bg-bg-secondary p-5 sm:p-6 rounded-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-text-secondary mb-1">
                  Total Pesanan
                </p>

                <p className="text-2xl sm:text-3xl font-semibold text-text-primary">
                  {totalOrders}
                </p>
              </div>

              <div className="shrink-0">
                <ShoppingBag
                  size={24}
                  className="text-text-secondary"
                />
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="card-border bg-bg-secondary p-5 sm:p-6 rounded-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-text-secondary mb-1">
                  Perlu Diproses
                </p>

                <p className="text-2xl sm:text-3xl font-semibold text-text-primary">
                  {pendingOrders}
                </p>
              </div>

              <div className="shrink-0">
                <Clock
                  size={24}
                  className="text-text-secondary"
                />
              </div>
            </div>
          </div>

          {/* Completed Orders */}
          <div className="card-border bg-bg-secondary p-5 sm:p-6 rounded-xl sm:col-span-2 xl:col-span-1">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-text-secondary mb-1">
                  Selesai
                </p>

                <p className="text-2xl sm:text-3xl font-semibold text-text-primary">
                  {completedOrders}
                </p>
              </div>

              <div className="shrink-0">
                <CheckCircle2
                  size={24}
                  className="text-text-secondary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-5 sm:mb-6 flex-wrap">
            <div>
              <h2 className="text-lg sm:text-xl font-medium text-text-primary mb-1">
                Pesanan Terbaru
              </h2>

              <p className="text-xs sm:text-sm text-text-secondary">
                Pantau transaksi terbaru Anda
              </p>
            </div>

            <Link
              href="/orders"
              className="text-xs sm:text-sm text-accent-primary hover:underline font-medium"
            >
              Lihat semua
            </Link>
          </div>

          {isLoading ? (
            <LoadingSkeleton
              variant="line"
              count={3}
            />
          ) : orders.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block card-border overflow-hidden rounded-xl">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b border-border bg-bg-secondary">
                        <th className="text-left px-6 py-4 text-xs font-medium text-text-secondary whitespace-nowrap">
                          ID Pesanan
                        </th>

                        <th className="text-left px-6 py-4 text-xs font-medium text-text-secondary whitespace-nowrap">
                          Produk
                        </th>

                        <th className="text-left px-6 py-4 text-xs font-medium text-text-secondary whitespace-nowrap">
                          Total
                        </th>

                        <th className="text-left px-6 py-4 text-xs font-medium text-text-secondary whitespace-nowrap">
                          Status
                        </th>

                        <th className="text-left px-6 py-4 text-xs font-medium text-text-secondary whitespace-nowrap">
                          Tanggal
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-border hover:bg-bg-secondary transition-colors"
                        >
                          <td className="px-6 py-4">
                            <Link
                              href={`/orders/${order.id}`}
                              className="text-xs text-accent-primary hover:underline font-medium"
                            >
                              #
                              {String(order.id).slice(
                                0,
                                8
                              )}
                            </Link>
                          </td>

                          <td className="px-6 py-4 text-xs text-text-primary max-w-[250px]">
                            <div className="truncate">
                              {order.product?.name ||
                                "Produk tidak tersedia"}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-xs font-medium text-text-primary whitespace-nowrap">
                            {formatRupiah(
                              order.total_price
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <OrderStatusBadge
                              status={order.status}
                              size="sm"
                            />
                          </td>

                          <td className="px-6 py-4 text-xs text-text-secondary whitespace-nowrap">
                            {formatDateShort(
                              order.created_at
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile & Tablet Cards */}
              <div className="lg:hidden space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="card-border rounded-xl p-4 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-sm font-semibold text-accent-primary hover:underline"
                        >
                          #
                          {String(order.id).slice(
                            0,
                            8
                          )}
                        </Link>

                        <p className="text-xs text-text-secondary mt-1">
                          {formatDateShort(
                            order.created_at
                          )}
                        </p>
                      </div>

                      <OrderStatusBadge
                        status={order.status}
                        size="sm"
                      />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-text-secondary mb-1">
                          Produk
                        </p>

                        <p className="text-sm text-text-primary break-words">
                          {order.product?.name ||
                            "Produk tidak tersedia"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-text-secondary mb-1">
                          Total
                        </p>

                        <p className="text-base font-semibold text-text-primary">
                          {formatRupiah(
                            order.total_price
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={ShoppingBag}
              title="Belum ada pesanan"
              description="Mulai berbelanja untuk membuat pesanan pertama Anda"
              action={{
                label: "Jelajahi Produk",
                onClick: () =>
                (window.location.href =
                  "/products"),
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}