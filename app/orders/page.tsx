"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";

import { apiClient } from "@/lib/api";

import {
  Order,
  PaginatedResponse,
} from "@/types";

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
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";

const fetcher = (url: string) =>
  apiClient
    .get(url)
    .then(
      (res) =>
        res.data as PaginatedResponse<Order>
    );

export default function OrdersPage() {
  const [isMounted, setIsMounted] =
    useState(false);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [statusFilter, setStatusFilter] =
    useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const params = new URLSearchParams({
    page: currentPage.toString(),
    limit: "10",
    ...(statusFilter && {
      status: statusFilter,
    }),
  });

  const { data, isLoading } =
    useSWR<PaginatedResponse<Order>>(
      `/orders?${params.toString()}`,
      fetcher,
      {
        revalidateOnFocus: false,
      }
    );

  if (!isMounted) return null;

  const orders = data?.data || [];
  // const orders = data?.data?.data || [];

  const pagination = data?.pagination;

  const statuses = [
    { value: null, label: "Semua" },
    {
      value: "pending_payment",
      label: "Menunggu Pembayaran",
    },
    {
      value: "paid",
      label: "Sudah Dibayar",
    },
    {
      value: "processing",
      label: "Diproses",
    },
    {
      value: "shipped",
      label: "Dikirim",
    },
    {
      value: "completed",
      label: "Selesai",
    },
    {
      value: "cancelled",
      label: "Dibatalkan",
    },
  ];

  return (
    <div className="section-padding px-4 sm:px-6 lg:px-8">
      <div className="max-content w-full">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary">
            Pesanan Saya
          </h1>
        </div>

        {/* Filter */}
        <div className="mb-6 sm:mb-8 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {statuses.map((status) => (
              <button
                key={status.value || "all"}
                onClick={() => {
                  setStatusFilter(
                    status.value
                  );
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-button text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${statusFilter ===
                  status.value
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
          <LoadingSkeleton
            variant="line"
            count={5}
          />
        ) : orders.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block card-border overflow-hidden rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
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

                      <th className="text-left px-6 py-4 text-xs font-medium text-text-secondary whitespace-nowrap">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order, index) => ( // Tambahkan parameter index di sini
                      <tr
                        key={order.id}
                        className="border-b border-border hover:bg-bg-secondary transition-colors"
                      >
                        <td className="px-6 py-4 text-xs font-medium text-text-primary whitespace-nowrap">
                          # {index + 1} {/* Menggunakan index + 1 agar nomor dimulai dari 1 */}
                        </td>

                        <td className="px-6 py-4 text-xs text-text-primary max-w-[240px]">
                          <div className="truncate">
                            {order.product
                              ?.name ||
                              "Produk tidak tersedia"}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs font-medium text-text-primary whitespace-nowrap">
                          {formatRupiah(
                            order.total_price
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <OrderStatusBadge
                            status={
                              order.status
                            }
                            size="sm"
                          />
                        </td>

                        <td className="px-6 py-4 text-xs text-text-secondary whitespace-nowrap">
                          {formatDateShort(
                            order.created_at
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/orders/${order.id}`}
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

            {/* Mobile & Tablet Card */}
            <div className="lg:hidden space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="card-border rounded-xl p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-text-primary">
                        #
                        {String(
                          order.id
                        ).slice(0, 8)}
                      </h2>

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
                        {order.product
                          ?.name ||
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

                    <div className="pt-2">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex text-sm font-medium text-accent-primary hover:underline"
                      >
                        Lihat Detail
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination &&
              pagination.last_page > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.max(1, p - 1)
                      )
                    }
                    disabled={
                      currentPage === 1
                    }
                    className="btn-secondary text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <ChevronLeft
                      size={16}
                    />
                    Sebelumnya
                  </button>

                  <div className="text-xs sm:text-sm text-text-secondary text-center">
                    Halaman{" "}
                    {
                      pagination.current_page
                    }{" "}
                    dari{" "}
                    {
                      pagination.last_page
                    }
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(
                          pagination.last_page,
                          p + 1
                        )
                      )
                    }
                    disabled={
                      currentPage ===
                      pagination.last_page
                    }
                    className="btn-secondary text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    Selanjutnya
                    <ChevronRight
                      size={16}
                    />
                  </button>
                </div>
              )}
          </>
        ) : (
          <EmptyState
            icon={ShoppingBag}
            title="Belum ada pesanan"
            description="Anda belum memiliki pesanan yang sesuai dengan filter ini"
          />
        )}
      </div>
    </div>
  );
}