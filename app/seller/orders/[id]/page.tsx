"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { Order } from "@/types";
import {
  OrderStatusBadge,
  OrderTimeline,
  LoadingSkeleton,
  ConfirmDialog,
} from "@/components";
import {
  formatRupiah,
  formatDate,
  formatDateShort,
} from "@/lib/utils";
import { Truck } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import TransactionChat from "@/components/transactionsChat";

const fetcher = (url: string) =>
  apiClient.get(url).then((res) => res.data.data);

export default function SellerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [trackingNumber, setTrackingNumber] = useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
    useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const orderId = params.id as string;

  const {
    data: order,
    isLoading,
    mutate,
  } = useSWR<Order>(
    `/seller/orders/${orderId}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    setIsMounted(true);

    if (order?.tracking_number) {
      setTrackingNumber(order.tracking_number);
    }
  }, [order]);

  if (!isMounted || isLoading) {
    return (
      <div className="section-padding">
        <div className="max-content px-4 sm:px-6 lg:px-8">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="section-padding text-center">
        <div className="max-content px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary mb-2">
            Pesanan tidak ditemukan
          </h1>

          <button
            onClick={() => router.back()}
            className="btn-secondary text-xs sm:text-sm mt-6"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const handleShip = async () => {
    if (!trackingNumber.trim()) {
      setError("Nomor tracking harus diisi");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.put(
        `/seller/orders/${order.id}/ship`,
        {
          tracking_number: trackingNumber,
        }
      );

      mutate();
      setIsConfirmDialogOpen(false);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Gagal mengirim pesanan"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const canShip =
    order.status === "processing" ||
    order.status === "paid";

  return (
    <div className="section-padding">
      <div className="max-content px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="text-xs sm:text-sm text-text-secondary hover:text-text-primary mb-6 sm:mb-8 transition-colors"
        >
          ← Kembali ke Pesanan
        </button>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* LEFT CONTENT */}
          <div className="xl:col-span-2 min-w-0">
            {/* STATUS */}
            <div className="card-border rounded-2xl p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <p className="text-xs text-text-secondary mb-1">
                    Nomor Pesanan
                  </p>

                  <h1 className="text-lg sm:text-xl font-medium text-text-primary break-all">
                    #{order.id}
                  </h1>
                </div>

                <div className="w-fit">
                  <OrderStatusBadge
                    status={order.status}
                  />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-text-secondary">
                Dibuat pada{" "}
                {formatDate(order.created_at)}
              </p>
            </div>

            {/* BUYER INFO */}
            <div className="card-border rounded-2xl p-4 sm:p-6 mb-6">
              <h2 className="text-base sm:text-lg font-medium text-text-primary mb-4">
                Informasi Pembeli
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-text-secondary mb-1">
                    Nama
                  </p>

                  <p className="font-medium text-sm sm:text-base text-text-primary break-words">
                    {order.buyer?.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-text-secondary mb-1">
                    Email
                  </p>

                  <p className="font-medium text-sm sm:text-base text-text-primary break-all">
                    {order.buyer?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* PRODUCT DETAILS */}
            <div className="card-border rounded-2xl p-4 sm:p-6 mb-6">
              <h2 className="text-base sm:text-lg font-medium text-text-primary mb-4">
                Rincian Produk
              </h2>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <span className="text-sm sm:text-base text-text-primary break-words">
                    {order.product?.name}
                  </span>

                  <span className="font-medium text-sm sm:text-base text-text-primary">
                    {formatRupiah(
                      order.product?.price || 0
                    )}{" "}
                    x {order.quantity}
                  </span>
                </div>

                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <span className="font-medium text-text-primary">
                    Total
                  </span>

                  <span className="font-semibold text-lg sm:text-xl text-text-primary break-words text-right">
                    {formatRupiah(order.total_price)}
                  </span>
                </div>
              </div>
            </div>

            {/* SHIPPING FORM */}
            {canShip && (
              <div className="card-border rounded-2xl p-4 sm:p-6 mb-6">
                <h2 className="text-base sm:text-lg font-medium text-text-primary mb-4">
                  Kirim Pesanan
                </h2>

                {error && (
                  <div className="mb-4 p-4 bg-accent-error/10 border border-accent-error rounded-input text-accent-error text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="tracking"
                    className="block text-sm font-medium text-text-primary mb-2"
                  >
                    Nomor Tracking
                  </label>

                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) =>
                      setTrackingNumber(
                        e.target.value
                      )
                    }
                    placeholder="Masukkan nomor tracking pengiriman"
                    className="input-base w-full text-sm sm:text-base mb-4"
                  />

                  <button
                    onClick={() =>
                      setIsConfirmDialogOpen(true)
                    }
                    className="btn-primary text-xs sm:text-sm flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <Truck size={16} />
                    Konfirmasi Pengiriman
                  </button>
                </div>
              </div>
            )}

            {/* TRACKING INFO */}
            {order.tracking_number && (
              <div className="card-border rounded-2xl p-4 sm:p-6 mb-6">
                <h2 className="text-base sm:text-lg font-medium text-text-primary mb-4">
                  Informasi Pengiriman
                </h2>

                <div>
                  <p className="text-xs text-text-secondary mb-1">
                    Nomor Tracking
                  </p>

                  <p className="font-medium text-sm sm:text-base text-text-primary break-all">
                    {order.tracking_number}
                  </p>
                </div>
              </div>
            )}

            {/* TIMELINE */}
            <div className="card-border rounded-2xl p-4 sm:p-6 mb-6">
              <h2 className="text-base sm:text-lg font-medium text-text-primary mb-4">
                Timeline Pesanan
              </h2>

              <div className="overflow-x-auto">
                <OrderTimeline order={order} />
              </div>
            </div>

            {/* TRANSACTION CHAT */}
            <div className="rounded-2xl overflow-hidden">
              <TransactionChat
                orderId={String(order.id)}
                currentUserId={
                  user?.id
                    ? Number(user.id)
                    : undefined
                }
              />
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="min-w-0">
            <div className="card-border rounded-2xl p-4 sm:p-6 xl:sticky xl:top-24">
              <h3 className="text-base sm:text-lg font-medium text-text-primary mb-6">
                Ringkasan
              </h3>

              <div className="space-y-5 pb-6 border-b border-border">
                <div>
                  <p className="text-xs text-text-secondary mb-1">
                    Status
                  </p>

                  <OrderStatusBadge
                    status={order.status}
                  />
                </div>

                <div>
                  <p className="text-xs text-text-secondary mb-1">
                    Jumlah Item
                  </p>

                  <p className="text-sm sm:text-base font-medium text-text-primary">
                    {order.quantity} unit
                  </p>
                </div>

                <div>
                  <p className="text-xs text-text-secondary mb-1">
                    Total
                  </p>

                  <p className="text-lg sm:text-xl font-semibold text-text-primary break-words">
                    {formatRupiah(order.total_price)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-text-secondary mb-1">
                    Dibuat
                  </p>

                  <p className="text-xs sm:text-sm text-text-primary">
                    {formatDateShort(
                      order.created_at
                    )}
                  </p>
                </div>
              </div>

              {canShip && (
                <div className="mt-4 p-4 bg-blue-50 border border-accent-primary rounded-input text-xs sm:text-sm text-accent-primary leading-6">
                  Mohon masukkan nomor tracking
                  untuk mengirim pesanan ini
                  kepada pembeli.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONFIRM DIALOG */}
        <ConfirmDialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
          title="Konfirmasi Pengiriman"
          description="Pastikan nomor tracking sudah benar sebelum mengirim. Pembeli akan menerima notifikasi."
          onConfirm={handleShip}
          confirmLabel="Kirim Pesanan"
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}