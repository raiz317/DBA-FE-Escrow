"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { apiClient } from "@/lib/api";
import { CreateProductInput } from "@/types";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";

const productSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  price: z.number().min(1000, "Harga minimal Rp 1.000"),
  stock: z.number().min(1, "Stok minimal 1 unit"),
  image_url: z
    .string()
    .url("URL gambar tidak valid")
    .optional()
    .or(z.literal("")),
  status: z.enum(["active", "inactive"]),
});

export default function NewProductPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(productSchema),

    defaultValues: {
      status: "active",
      price: 0,
      stock: 0,
    },
  });

  const status = watch("status");
  const imageUrl = watch("image_url");

  // =========================
  // SUBMIT
  // =========================

  // const onSubmit = async (data: CreateProductInput) => {
  //   setIsSubmitting(true);
  //   setApiError(null);

  //   try {
  //     await apiClient.post("/products", data);

  //     router.push("/seller/products");
  //   } catch (error: any) {
  //     setApiError(
  //       error.response?.data?.message ||
  //       "Gagal membuat produk"
  //     );
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };
  const onSubmit = async (data: CreateProductInput) => {
    console.log("SUBMIT DATA:", data);

    setIsSubmitting(true);
    setApiError(null);

    try {
      await apiClient.post("/products", data);

      router.push("/seller/products");
    } catch (error: any) {
      setApiError(
        error.response?.data?.message ||
        "Gagal membuat produk"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="section-padding">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors mb-3"
          >
            ← Kembali
          </button>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary">
            Tambah Produk Baru
          </h1>

          <p className="text-sm sm:text-base text-text-secondary mt-2">
            Tambahkan produk baru untuk mulai berjualan.
          </p>
        </div>

        {/* ERROR */}
        {apiError && (
          <div className="mb-6 p-4 rounded-xl border border-accent-error bg-accent-error/10 text-sm text-accent-error">
            {apiError}
          </div>
        )}

        {/* CONTENT */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* ========================= */}
          {/* FORM */}
          {/* ========================= */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="xl:col-span-2 space-y-5 sm:space-y-6"
          >
            {/* NAME */}
            <div className="card-border p-4 sm:p-6">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Nama Produk
              </label>

              <input
                {...register("name")}
                type="text"
                placeholder="Masukkan nama produk"
                className="input-base w-full text-sm sm:text-base"
                disabled={isSubmitting}
              />

              {errors.name && (
                <p className="text-xs text-accent-error mt-2">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="card-border p-4 sm:p-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Deskripsi
              </label>

              <textarea
                {...register("description")}
                placeholder="Masukkan deskripsi produk"
                rows={5}
                className="input-base w-full text-sm sm:text-base resize-none"
                disabled={isSubmitting}
              />

              {errors.description && (
                <p className="text-xs text-accent-error mt-2">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* PRICE + STOCK */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* PRICE */}
              <div className="card-border p-4 sm:p-6">
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Harga (Rupiah)
                </label>

                <input
                  {...register("price", {
                    valueAsNumber: true,
                  })}
                  type="number"
                  placeholder="0"
                  className="input-base w-full text-sm sm:text-base"
                  disabled={isSubmitting}
                />

                {errors.price && (
                  <p className="text-xs text-accent-error mt-2">
                    {errors.price.message}
                  </p>
                )}
              </div>

              {/* STOCK */}
              <div className="card-border p-4 sm:p-6">
                <label
                  htmlFor="stock"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  Stok
                </label>

                <input
                  {...register("stock", {
                    valueAsNumber: true,
                  })}
                  type="number"
                  placeholder="0"
                  className="input-base w-full text-sm sm:text-base"
                  disabled={isSubmitting}
                />

                {errors.stock && (
                  <p className="text-xs text-accent-error mt-2">
                    {errors.stock.message}
                  </p>
                )}
              </div>
            </div>

            {/* IMAGE URL */}
            <div className="card-border p-4 sm:p-6">
              <label
                htmlFor="image_url"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                URL Gambar (Opsional)
              </label>

              <input
                {...register("image_url")}
                type="url"
                placeholder="https://..."
                className="input-base w-full text-sm sm:text-base"
                disabled={isSubmitting}
              />

              {errors.image_url && (
                <p className="text-xs text-accent-error mt-2">
                  {errors.image_url.message}
                </p>
              )}
            </div>

            {/* STATUS */}
            <div className="card-border p-4 sm:p-6">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Status
              </label>

              <Select
                value={status}
                onValueChange={(value) =>
                  setValue(
                    "status",
                    value as "active" | "inactive"
                  )
                }
              >
                <SelectTrigger className="w-full h-11 text-sm">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="active">
                    Aktif
                  </SelectItem>

                  <SelectItem value="inactive">
                    Nonaktif
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* BUTTON */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex-1 text-sm sm:text-base h-11"
              >
                {isSubmitting
                  ? "Menyimpan..."
                  : "Simpan Produk"}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary flex-1 text-sm sm:text-base h-11"
              >
                Batal
              </button>
            </div>
          </form>

          {/* ========================= */}
          {/* PREVIEW */}
          {/* ========================= */}
          <div className="xl:sticky xl:top-20 h-fit">
            <div className="card-border p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-5">
                Preview Produk
              </h3>

              {/* IMAGE */}
              {imageUrl ? (
                <div className="mb-5 rounded-2xl overflow-hidden bg-bg-secondary aspect-video">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => {
                      alert(
                        "Gagal memuat gambar. Periksa URL gambar."
                      );
                    }}
                  />
                </div>
              ) : (
                <div className="mb-5 rounded-2xl bg-bg-secondary aspect-video flex items-center justify-center text-sm text-text-secondary border border-dashed border-border">
                  Preview gambar akan tampil di sini
                </div>
              )}

              {/* PREVIEW CONTENT */}
              <div className="space-y-4">
                {/* NAME */}
                <div>
                  <p className="text-xs text-text-secondary mb-1">
                    Nama Produk
                  </p>

                  <p className="font-medium text-sm sm:text-base text-text-primary break-words">
                    {watch("name") ||
                      "Nama produk akan tampil di sini"}
                  </p>
                </div>

                {/* PRICE */}
                <div>
                  <p className="text-xs text-text-secondary mb-1">
                    Harga
                  </p>

                  <p className="text-lg sm:text-xl font-semibold text-text-primary">
                    {watch("price") > 0
                      ? new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(watch("price"))
                      : "-"}
                  </p>
                </div>

                {/* STOCK */}
                <div>
                  <p className="text-xs text-text-secondary mb-1">
                    Stok
                  </p>

                  <p className="font-medium text-sm sm:text-base text-text-primary">
                    {watch("stock") > 0
                      ? `${watch("stock")} unit`
                      : "-"}
                  </p>
                </div>

                {/* STATUS */}
                <div>
                  <p className="text-xs text-text-secondary mb-1">
                    Status
                  </p>

                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-700"
                      }`}
                  >
                    {status === "active"
                      ? "Aktif"
                      : "Nonaktif"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}