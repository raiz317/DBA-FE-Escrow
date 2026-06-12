"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import { useRouter } from "next/navigation";

import { apiClient } from "@/lib/api";
import { Product, PaginatedResponse } from "@/types";

import {
  LoadingSkeleton,
  EmptyState,
  ConfirmDialog,
} from "@/components";

import {
  formatRupiah,
  formatDateShort,
} from "@/lib/utils";

import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Plus,
  ImageIcon,
} from "lucide-react";

/**
 * FETCHER
 */
const fetcher = async (url: string) => {
  const res = await apiClient.get(url);

  console.log("API RESPONSE:", res.data);

  return res.data;
};

export default function SellerProductsPage() {
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    productId?: string;
  }>({
    open: false,
  });

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * SWR
   */
  const {
    data,
    isLoading,
    mutate,
    error,
  } = useSWR<PaginatedResponse<Product>>(
    `/seller/products?page=${currentPage}&limit=10`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  if (!isMounted) return null;

  /**
   * HANDLE ERROR API
   */
  if (error) {
    return (
      <div className="p-6 sm:p-10 text-red-500">
        Gagal mengambil data produk
      </div>
    );
  }

  /**
   * SUPPORT STRUCTURE API LARAVEL
   */
  const products = data?.data || [];

  const pagination = data?.pagination;

  /**
   * DELETE PRODUCT
   */
  const handleDelete = async () => {
    if (!deleteConfirm.productId) return;

    setIsDeleting(true);

    try {
      await apiClient.delete(
        `/products/${deleteConfirm.productId}`
      );

      mutate();

      setDeleteConfirm({
        open: false,
      });

    } catch (error: any) {

      alert(
        error?.response?.data?.message ||
        "Gagal menghapus produk"
      );

    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="section-padding">
      <div className="max-content px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary">
              Produk Saya
            </h1>

            <p className="text-sm text-text-secondary mt-1">
              Kelola seluruh produk toko Anda
            </p>
          </div>

          <Link
            href="/seller/products/new"
            className="btn-primary text-xs sm:text-sm flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus size={16} />
            Tambah Produk
          </Link>
        </div>

        {/* LOADING */}
        {isLoading ? (

          <LoadingSkeleton
            variant="line"
            count={5}
          />

        ) : products.length > 0 ? (

          <>
            {/* DESKTOP TABLE */}
            <div className="hidden lg:block card-border rounded-2xl overflow-hidden">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px]">

                  <thead>
                    <tr className="border-b border-border bg-bg-secondary">

                      <th className="text-left px-6 py-4 text-xs font-medium text-text-secondary">
                        Produk
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-medium text-text-secondary">
                        Harga
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-medium text-text-secondary">
                        Stok
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-medium text-text-secondary">
                        Status
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-medium text-text-secondary">
                        Tanggal Dibuat
                      </th>

                      <th className="text-center px-6 py-4 text-xs font-medium text-text-secondary">
                        Aksi
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {products.map((product) => {

                      console.log(
                        "PRODUCT IMAGE:",
                        product.image_url
                      );

                      return (
                        <tr
                          key={product.id}
                          className="border-b border-border hover:bg-bg-secondary transition-colors"
                        >

                          {/* PRODUK */}
                          <td className="px-6 py-4">

                            <div className="flex items-center gap-4">

                              {/* THUMBNAIL */}
                              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-border">

                                {product.image_url ? (

                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"

                                    onError={(e) => {

                                      console.log(
                                        "IMAGE ERROR:",
                                        product.image_url
                                      );

                                      e.currentTarget.src =
                                        "/placeholder.png";
                                    }}
                                  />

                                ) : (

                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ImageIcon size={20} />
                                  </div>

                                )}

                              </div>

                              {/* NAMA */}
                              <div className="min-w-0">

                                <p className="text-sm font-medium text-text-primary line-clamp-2">
                                  {product.name}
                                </p>

                                <p className="text-[11px] text-gray-400 break-all mt-1">
                                  {product.image_url || "No image"}
                                </p>

                              </div>

                            </div>
                          </td>

                          {/* HARGA */}
                          <td className="px-6 py-4 text-sm font-medium text-text-primary">
                            {formatRupiah(product.price)}
                          </td>

                          {/* STOK */}
                          <td className="px-6 py-4 text-sm text-text-primary">
                            {product.stock}
                          </td>

                          {/* STATUS */}
                          <td className="px-6 py-4">

                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${product.status === "active"
                                ? "bg-stock-available-bg text-stock-available-text"
                                : "bg-status-cancelled-bg text-status-cancelled-text"
                                }`}
                            >
                              {product.status === "active"
                                ? "Aktif"
                                : "Nonaktif"}
                            </span>

                          </td>

                          {/* CREATED */}
                          <td className="px-6 py-4 text-sm text-text-secondary">
                            {formatDateShort(product.created_at)}
                          </td>

                          {/* ACTION */}
                          <td className="px-6 py-4">

                            <div className="flex items-center justify-center gap-2">

                              {/* EDIT */}
                              <Link
                                href={`/seller/products/${product.id}/edit`}
                                className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
                              >
                                <Edit2
                                  size={18}
                                  className="text-text-secondary"
                                />
                              </Link>

                              {/* DELETE */}
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    open: true,
                                    productId: product.id,
                                  })
                                }
                                className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
                              >
                                <Trash2
                                  size={18}
                                  className="text-accent-error"
                                />
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>
            </div>

            {/* MOBILE & TABLET CARD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">

              {products.map((product) => (

                <div
                  key={product.id}
                  className="card-border rounded-2xl p-4"
                >

                  {/* TOP */}
                  <div className="flex gap-4">

                    {/* IMAGE */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-border flex-shrink-0">

                      {product.image_url ? (

                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"

                          onError={(e) => {
                            e.currentTarget.src =
                              "/placeholder.png";
                          }}
                        />

                      ) : (

                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon size={22} />
                        </div>

                      )}

                    </div>

                    {/* INFO */}
                    <div className="flex-1 min-w-0">

                      <h3 className="text-sm font-medium text-text-primary line-clamp-2 mb-2">
                        {product.name}
                      </h3>

                      <div className="space-y-1">

                        <p className="text-sm font-semibold text-text-primary">
                          {formatRupiah(product.price)}
                        </p>

                        <p className="text-xs text-text-secondary">
                          Stok: {product.stock}
                        </p>

                        <p className="text-xs text-text-secondary">
                          {formatDateShort(product.created_at)}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* STATUS */}
                  <div className="mt-4 flex items-center justify-between gap-3">

                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${product.status === "active"
                        ? "bg-stock-available-bg text-stock-available-text"
                        : "bg-status-cancelled-bg text-status-cancelled-text"
                        }`}
                    >
                      {product.status === "active"
                        ? "Aktif"
                        : "Nonaktif"}
                    </span>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2">

                      <Link
                        href={`/seller/products/${product.id}/edit`}
                        className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
                      >
                        <Edit2
                          size={18}
                          className="text-text-secondary"
                        />
                      </Link>

                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            open: true,
                            productId: product.id,
                          })
                        }
                        className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
                      >
                        <Trash2
                          size={18}
                          className="text-accent-error"
                        />
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

            {/* PAGINATION */}
            {pagination &&
              pagination.last_page > 1 && (

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">

                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.max(1, p - 1)
                      )
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
                    <ChevronRight size={16} />
                  </button>

                </div>
              )}

          </>

        ) : (

          <EmptyState
            icon={Plus}
            title="Belum ada produk"
            description="Mulai dengan membuat produk pertama Anda"
            action={{
              label: "Tambah Produk",
              onClick: () =>
                router.push("/seller/products/new"),
            }}
          />

        )}

      </div>

      {/* DELETE DIALOG */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) =>
          setDeleteConfirm({
            ...deleteConfirm,
            open,
          })
        }
        title="Hapus Produk"
        description="Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        confirmLabel="Hapus"
        isDangerous={true}
        isLoading={isDeleting}
      />
    </div>
  );
}