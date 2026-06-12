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
import { useAuthStore } from "@/store/authStore";
import TransactionChat from "@/components/transactionsChat";
import { formatRupiah, formatDate } from "@/lib/utils";

const fetcher = (url: string) =>
  apiClient.get(url).then((res) => res.data.data);

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [confirmAction, setConfirmAction] = useState<
    "confirm" | "cancel" | null
  >(null);

  const orderId = params.id as string;

  const { data: order, isLoading, mutate } = useSWR<Order>(
    `/orders/${orderId}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isLoading) {
    return (
      <div className="section-padding">
        <div className="max-content">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="section-padding text-center">
        <div className="max-content">
          <h1 className="text-section-heading text-text-primary mb-2">
            Pesanan tidak ditemukan
          </h1>

          <button
            onClick={() => router.back()}
            className="btn-secondary text-xs mt-6"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const handleConfirmOrder = async () => {
    setIsProcessing(true);

    try {
      await apiClient.put(`/orders/${order.id}/confirm`);

      mutate();

      setIsConfirmDialogOpen(false);

    } catch (error: any) {

      alert(
        error.response?.data?.message ||
        "Gagal mengkonfirmasi pesanan"
      );

    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelOrder = async () => {
    setIsProcessing(true);

    try {
      await apiClient.put(`/orders/${order.id}/cancel`);

      mutate();

      setIsConfirmDialogOpen(false);

    } catch (error: any) {

      alert(
        error.response?.data?.message ||
        "Gagal membatalkan pesanan"
      );

    } finally {
      setIsProcessing(false);
    }
  };

  const canConfirm = order.status === "shipped";
  const canCancel = order.status === "pending_payment";
  const canPay = order.status === "pending_payment";

  return (
    <div className="section-padding">
      <div className="max-content">

        {/* BACK BUTTON */}
        <button
          onClick={() => router.back()}
          className="text-xs sm:text-sm text-text-secondary hover:text-text-primary mb-6 sm:mb-8"
        >
          ← Kembali ke Pesanan
        </button>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">

          {/* LEFT CONTENT */}
          <div className="xl:col-span-2 space-y-6">

            {/* ORDER HEADER */}
            <div className="card-border p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">

                <div className="min-w-0">
                  <p className="text-xs text-text-secondary mb-1">
                    Nomor Pesanan
                  </p>

                  <h1 className="text-base sm:text-lg font-medium text-text-primary break-all">
                    #{order.id}
                  </h1>
                </div>

                <div className="self-start">
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-text-secondary">
                Dibuat pada {formatDate(order.created_at)}
              </p>
            </div>

            {/* PRODUCT DETAIL */}
            <div className="card-border p-4 sm:p-6">
              <h2 className="text-base font-medium text-text-primary mb-4">
                Rincian Produk
              </h2>

              <div className="space-y-4">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                  <span className="text-text-primary break-words">
                    {order.product?.name}
                  </span>

                  <span className="font-medium text-text-primary sm:text-right">
                    {formatRupiah(order.product?.price || 0)} x{" "}
                    {order.quantity}
                  </span>
                </div>

                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <span className="font-semibold text-text-primary">
                    Total
                  </span>

                  <span className="text-lg sm:text-xl font-bold text-text-primary">
                    {formatRupiah(order.total_price)}
                  </span>
                </div>
              </div>
            </div>

            {/* TIMELINE */}
            <div className="card-border p-4 sm:p-6">
              <h2 className="text-base font-medium text-text-primary mb-4">
                Timeline Pesanan
              </h2>

              <div className="overflow-x-auto">
                <OrderTimeline order={order} />
              </div>
            </div>

            {/* CHAT */}
            <div className="w-full overflow-hidden">
              <TransactionChat
                orderId={Number(order.id)}
                currentUserId={
                  user?.id ? Number(user.id) : undefined
                }
              />
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">

            <div className="card-border p-4 sm:p-6 xl:sticky xl:top-20">
              <h3 className="text-base font-medium text-text-primary mb-4">
                Aksi
              </h3>

              <div className="space-y-3">

                {canPay && (
                  <button
                    onClick={() =>
                      router.push(`/payment/${order.id}`)
                    }
                    className="btn-primary w-full text-xs sm:text-sm py-3"
                  >
                    Lanjutkan Pembayaran
                  </button>
                )}

                {canConfirm && (
                  <button
                    onClick={() => {
                      setConfirmAction("confirm");
                      setIsConfirmDialogOpen(true);
                    }}
                    className="btn-primary w-full text-xs sm:text-sm py-3"
                  >
                    Konfirmasi Pesanan
                  </button>
                )}

                {canCancel && (
                  <button
                    onClick={() => {
                      setConfirmAction("cancel");
                      setIsConfirmDialogOpen(true);
                    }}
                    className="btn-secondary w-full text-xs sm:text-sm py-3 text-accent-error border-accent-error"
                  >
                    Batalkan Pesanan
                  </button>
                )}

                {!canPay &&
                  !canConfirm &&
                  !canCancel && (
                    <div className="bg-bg-secondary rounded-lg p-4 text-center">
                      <p className="text-xs sm:text-sm text-text-secondary">
                        Tidak ada aksi tersedia
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* CONFIRM DIALOG */}
        <ConfirmDialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
          title={
            confirmAction === "confirm"
              ? "Konfirmasi Pesanan"
              : "Batalkan Pesanan"
          }
          description={
            confirmAction === "confirm"
              ? "Barang sudah diterima dengan baik?"
              : "Yakin ingin membatalkan?"
          }
          onConfirm={
            confirmAction === "confirm"
              ? handleConfirmOrder
              : handleCancelOrder
          }
          isLoading={isProcessing}
        />
      </div>
    </div>
  );
}