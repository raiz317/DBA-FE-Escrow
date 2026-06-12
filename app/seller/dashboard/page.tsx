"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { Product, Order, PaginatedResponse } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { OrderStatusBadge, LoadingSkeleton, EmptyState } from "@/components";
import { formatRupiah, formatDateShort } from "@/lib/utils";
import { Package, ShoppingBag, Clock } from "lucide-react";

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

export default function SellerDashboardPage() {
  const { user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  const { data: productsData } = useSWR<PaginatedResponse<Product>>(
    "/seller/products?limit=1",
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: ordersData, isLoading: isOrdersLoading } =
    useSWR<PaginatedResponse<Order>>(
      "/seller/orders?limit=5",
      fetcher,
      { revalidateOnFocus: false }
    );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const totalProducts = productsData?.pagination.total || 0;
  const totalOrders = ordersData?.pagination.total || 0;

  const pendingOrders =
    ordersData?.data?.filter((o) => o.status === "pending_payment").length || 0;

  const processingOrders =
    ordersData?.data?.filter((o) => o.status === "processing").length || 0;

  const needsProcessing = pendingOrders + processingOrders;

  const recentOrders = ordersData?.data || [];

  return (
    <div className="section-padding">
      <div className="max-content px-4 sm:px-6 lg:px-8">
        {/* Greeting */}
        <div className="mb-10 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-text-primary mb-2 leading-tight">
            Selamat datang, {user?.name}!
          </h1>

          <p className="text-sm sm:text-base text-text-secondary">
            Kelola toko dan pesanan Anda di sini
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12">
          {/* Total Products */}
          <div className="card-border bg-bg-secondary p-5 sm:p-6 rounded-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-text-secondary mb-1">
                  Total Produk
                </p>

                <p className="text-2xl sm:text-3xl font-semibold text-text-primary">
                  {totalProducts}
                </p>
              </div>

              <Package
                size={24}
                className="text-text-secondary shrink-0"
              />
            </div>
          </div>

          {/* Total Orders */}
          <div className="card-border bg-bg-secondary p-5 sm:p-6 rounded-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-text-secondary mb-1">
                  Pesanan Masuk
                </p>

                <p className="text-2xl sm:text-3xl font-semibold text-text-primary">
                  {totalOrders}
                </p>
              </div>

              <ShoppingBag
                size={24}
                className="text-text-secondary shrink-0"
              />
            </div>
          </div>

          {/* Need Processing */}
          <div className="card-border bg-bg-secondary p-5 sm:p-6 rounded-2xl sm:col-span-2 xl:col-span-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-text-secondary mb-1">
                  Perlu Diproses
                </p>

                <p className="text-2xl sm:text-3xl font-semibold text-text-primary">
                  {needsProcessing}
                </p>
              </div>

              <Clock size={24} className="text-text-secondary shrink-0" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10 sm:mb-12">
          <h2 className="text-lg sm:text-xl font-medium text-text-primary mb-4">
            Aksi Cepat
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/seller/products/new"
              className="btn-primary text-xs sm:text-sm text-center w-full"
            >
              Tambah Produk Baru
            </Link>

            <Link
              href="/seller/orders"
              className="btn-secondary text-xs sm:text-sm text-center w-full"
            >
              Lihat Semua Pesanan
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-medium text-text-primary mb-1">
                Pesanan Terbaru
              </h2>

              <p className="text-xs sm:text-sm text-text-secondary">
                Pantau pesanan terbaru toko Anda
              </p>
            </div>

            <Link
              href="/seller/orders"
              className="text-xs sm:text-sm text-accent-primary hover:underline"
            >
              Lihat semua
            </Link>
          </div>

          {isOrdersLoading ? (
            <LoadingSkeleton variant="line" count={3} />
          ) : recentOrders.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block card-border overflow-hidden rounded-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-bg-secondary">
                        <th className="text-left px-6 py-4 text-xs font-medium text-text-secondary">
                          ID Pesanan
                        </th>

                        <th className="text-left px-6 py-4 text-xs font-medium text-text-secondary">
                          Produk
                        </th>

                        <th className="text-left px-6 py-4 text-xs font-medium text-text-secondary">
                          Total
                        </th>

                        <th className="text-left px-6 py-4 text-xs font-medium text-text-secondary">
                          Status
                        </th>

                        <th className="text-left px-6 py-4 text-xs font-medium text-text-secondary">
                          Tanggal
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-border hover:bg-bg-secondary transition-colors"
                        >
                          <td className="px-6 py-4">
                            <Link
                              href={`/seller/orders/${order.id}`}
                              className="text-xs text-accent-primary hover:underline font-medium"
                            >
                              #{String(order.id).slice(0, 8)}
                            </Link>
                          </td>

                          <td className="px-6 py-4 text-xs text-text-primary">
                            {order.product?.name ||
                              "Produk tidak tersedia"}
                          </td>

                          <td className="px-6 py-4 text-xs font-medium text-text-primary">
                            {formatRupiah(order.total_price)}
                          </td>

                          <td className="px-6 py-4">
                            <OrderStatusBadge
                              status={order.status}
                              size="sm"
                            />
                          </td>

                          <td className="px-6 py-4 text-xs text-text-secondary">
                            {formatDateShort(order.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card Layout */}
              <div className="lg:hidden space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="card-border rounded-2xl p-4 bg-white"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <Link
                          href={`/seller/orders/${order.id}`}
                          className="text-sm font-medium text-accent-primary hover:underline"
                        >
                          #{String(order.id).slice(0, 8)}
                        </Link>

                        <p className="text-sm text-text-primary mt-1">
                          {order.product?.name ||
                            "Produk tidak tersedia"}
                        </p>
                      </div>

                      <OrderStatusBadge
                        status={order.status}
                        size="sm"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-text-secondary mb-1">
                          Total
                        </p>

                        <p className="text-sm font-semibold text-text-primary">
                          {formatRupiah(order.total_price)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-text-secondary mb-1">
                          Tanggal
                        </p>

                        <p className="text-sm text-text-primary">
                          {formatDateShort(order.created_at)}
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
              description="Pesanan akan muncul di sini ketika ada pembeli"
            />
          )}
        </div>
      </div>
    </div>
  );
}