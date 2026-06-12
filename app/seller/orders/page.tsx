"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { Order, PaginatedResponse } from "@/types";
import { OrderStatusBadge, LoadingSkeleton, EmptyState } from "@/components";
import { formatRupiah, formatDateShort } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";

const fetcher = (url: string) =>
  apiClient.get(url).then((res) => res.data as PaginatedResponse<Order>);

export default function SellerOrdersPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const params = new URLSearchParams({
    page: currentPage.toString(),
    limit: "10",
    ...(statusFilter && { status: statusFilter }),
  });

  const { data, isLoading } = useSWR<PaginatedResponse<Order>>(
    `/seller/orders?${params.toString()}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (!isMounted) return null;

  const orders = data?.data || [];
  const pagination = data?.pagination;

  const statuses = [
    { value: null, label: "Semua" },
    { value: "pending_payment", label: "Menunggu Pembayaran" },
    { value: "paid", label: "Sudah Dibayar" },
    { value: "processing", label: "Diproses" },
    { value: "shipped", label: "Dikirim" },
    { value: "completed", label: "Selesai" },
    { value: "cancelled", label: "Dibatalkan" },
  ];

  return (
    <div className="section-padding">
      <div className="max-content px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-text-primary mb-2">
            Pesanan Masuk
          </h1>

          <p className="text-sm sm:text-base text-text-secondary">
            Kelola seluruh pesanan pelanggan toko Anda
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-1">
            {statuses.map((status) => (
              <button
                key={status.value || "all"}
                onClick={() => {
                  setStatusFilter(status.value);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === status.value
                  ? "bg-accent-primary text-white"
                  : "bg-bg-secondary text-text-primary hover:bg-border"
                  }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders */}
        {isLoading ? (
          <LoadingSkeleton variant="line" count={5} />
        ) : orders.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden xl:block card-border overflow-hidden rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-bg-secondary">
                      <th className="text-left px-6 py-4 text-xs font-medium text-text-secondary">
                        ID Pesanan
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-medium text-text-secondary">
                        Pembeli
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

                      <th className="text-left px-6 py-4 text-xs font-medium text-text-secondary">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-border hover:bg-bg-secondary transition-colors"
                      >
                        <td className="px-6 py-4 text-xs font-medium text-text-primary">
                          #{String(order.id).slice(0, 8)}
                        </td>

                        <td className="px-6 py-4 text-xs text-text-primary">
                          {order.buyer?.name || "Pembeli Anonim"}
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

                        <td className="px-6 py-4">
                          <Link
                            href={`/seller/orders/${order.id}`}
                            className="text-xs text-accent-primary hover:underline font-medium"
                          >
                            Lihat Detail
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile & Tablet Card Layout */}
            <div className="xl:hidden space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="card-border rounded-2xl p-4 sm:p-5 bg-white"
                >
                  {/* Top */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-1">
                        #{String(order.id).slice(0, 8)}
                      </h3>

                      <p className="text-sm text-text-secondary">
                        {order.buyer?.name || "Pembeli Anonim"}
                      </p>
                    </div>

                    <OrderStatusBadge
                      status={order.status}
                      size="sm"
                    />
                  </div>

                  {/* Product */}
                  <div className="mb-4">
                    <p className="text-xs text-text-secondary mb-1">
                      Produk
                    </p>

                    <p className="text-sm text-text-primary">
                      {order.product?.name ||
                        "Produk tidak tersedia"}
                    </p>
                  </div>

                  {/* Bottom */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap gap-6">
                      <div>
                        <p className="text-xs text-text-secondary mb-1">
                          Total
                        </p>

                        <p className="text-sm font-semibold text-text-primary">
                          {formatRupiah(order.total_price)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-text-secondary mb-1">
                          Tanggal
                        </p>

                        <p className="text-sm text-text-primary">
                          {formatDateShort(order.created_at)}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/seller/orders/${order.id}`}
                      className="btn-secondary text-xs text-center w-full sm:w-auto"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={currentPage === 1}
                  className="btn-secondary text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <ChevronLeft size={16} />
                  Sebelumnya
                </button>

                <div className="text-xs sm:text-sm text-text-secondary text-center">
                  Halaman {pagination.current_page} dari{" "}
                  {pagination.last_page}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(pagination.last_page, p + 1)
                    )
                  }
                  disabled={currentPage === pagination.last_page}
                  className="btn-secondary text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  Selanjutnya
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
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
  );
}