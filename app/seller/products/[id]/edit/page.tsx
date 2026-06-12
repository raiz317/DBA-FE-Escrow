"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useSWR from "swr";

import { apiClient } from "@/lib/api";

import {
  LoadingSkeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";

// ===============================
// ZOD SCHEMA
// ===============================
const productSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  price: z.coerce.number().min(1000, "Harga minimal Rp 1.000"),
  stock: z.coerce.number().min(0, "Stok tidak boleh negatif"),
  image: z.any().optional(),
  image_url: z
    .string()
    .url("URL gambar tidak valid")
    .optional()
    .or(z.literal("")),
  status: z.enum(["active", "inactive"]),
});

type FormData = z.infer<typeof productSchema>;

const fetcher = (url: string) =>
  apiClient.get(url).then((res) => res.data.data);

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const productId = params.id as string;

  const {
    data: product,
    isLoading,
    error: fetchError,
  } = useSWR(productId ? `/products/${productId}` : null, fetcher);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(productSchema),
  });

  const status = watch("status");
  const imageUrl = watch("image_url");

  // ===============================
  // SYNC PRODUCT DATA
  // ===============================
  useEffect(() => {
    if (product) {
      const p = product as any;

      setValue("name", p.name);
      setValue("description", p.description);
      setValue("price", p.price);
      setValue("stock", p.stock);
      setValue("image_url", p.image_url || "");
      setValue("status", p.status);
    }
  }, [product, setValue]);

  // ===============================
  // LOADING
  // ===============================
  if (isLoading) {
    return (
      <div className="section-padding">
        <div className="max-w-4xl mx-auto">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  // ===============================
  // SUBMIT
  // ===============================
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", data.price.toString());
    formData.append("stock", data.stock.toString());
    formData.append("status", data.status);
    formData.append("_method", "PUT");

    if (data.image instanceof File) {
      formData.append("image", data.image);
    } else {
      formData.append("image_url", data.image_url || "");
    }

    try {
      await apiClient.post(`/products/${productId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      router.push("/seller/products");
    } catch (error: any) {
      setApiError(
        error.response?.data?.message || "Gagal menyimpan"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="section-padding">
      <div className="max-w-4xl mx-auto">
        {/* CARD */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-4 sm:p-6 lg:p-8">
          {/* HEADER */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Edit Produk
            </h1>

            <p className="text-sm text-text-secondary mt-2">
              Perbarui informasi produk Anda di bawah ini.
            </p>
          </div>

          {/* API ERROR */}
          {apiError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {apiError}
            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* NAMA */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Nama Produk
              </label>

              <input
                {...register("name")}
                className="input-base w-full border border-border p-3 rounded-xl text-sm sm:text-base"
                placeholder="Masukkan nama produk"
              />

              {errors.name?.message && (
                <p className="text-red-500 text-xs mt-2">
                  {(errors.name as any).message}
                </p>
              )}
            </div>

            {/* DESKRIPSI */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Deskripsi
              </label>

              <textarea
                {...register("description")}
                rows={5}
                className="input-base w-full border border-border p-3 rounded-xl text-sm sm:text-base resize-none"
                placeholder="Masukkan deskripsi produk"
              />

              {errors.description?.message && (
                <p className="text-red-500 text-xs mt-2">
                  {(errors.description as any).message}
                </p>
              )}
            </div>

            {/* HARGA & STOK */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* HARGA */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Harga (Rp)
                </label>

                <input
                  {...register("price")}
                  type="number"
                  className="input-base w-full border border-border p-3 rounded-xl text-sm sm:text-base"
                  placeholder="10000"
                />

                {errors.price?.message && (
                  <p className="text-red-500 text-xs mt-2">
                    {(errors.price as any).message}
                  </p>
                )}
              </div>

              {/* STOK */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Stok
                </label>

                <input
                  {...register("stock")}
                  type="number"
                  className="input-base w-full border border-border p-3 rounded-xl text-sm sm:text-base"
                  placeholder="0"
                />

                {errors.stock?.message && (
                  <p className="text-red-500 text-xs mt-2">
                    {(errors.stock as any).message}
                  </p>
                )}
              </div>
            </div>

            {/* IMAGE */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                URL Gambar
              </label>

              {/* PREVIEW */}
              {imageUrl && (
                <div className="mb-4">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-border bg-gray-50"
                    onError={(e) =>
                      (e.currentTarget.style.display = "none")
                    }
                  />
                </div>
              )}

              {/* URL INPUT */}
              <input
                {...register("image_url")}
                placeholder="https://example.com/image.jpg"
                className="input-base w-full border border-border p-3 rounded-xl text-sm sm:text-base"
              />

              {/* FILE INPUT */}
              <div className="mt-5">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Atau Upload dari Komputer
                </label>

                <input
                  type="file"
                  accept="image/*"
                  className="w-full border border-border rounded-xl p-3 text-sm cursor-pointer bg-white"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      setValue("image", file);

                      const preview = URL.createObjectURL(file);

                      setValue("image_url", preview);
                    }
                  }}
                />

                <p className="text-[11px] text-text-secondary mt-2 italic">
                  *Gunakan upload file jika ingin mengambil gambar
                  dari perangkat lokal.
                </p>
              </div>

              {errors.image_url?.message && (
                <p className="text-red-500 text-xs mt-2">
                  {(errors.image_url as any).message}
                </p>
              )}
            </div>

            {/* STATUS */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Status
              </label>

              <Select
                value={status}
                onValueChange={(v) => setValue("status", v)}
              >
                <SelectTrigger className="w-full h-12 rounded-xl">
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

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex-1 h-12 rounded-xl text-sm sm:text-base disabled:opacity-70"
              >
                {isSubmitting
                  ? "Menyimpan..."
                  : "Simpan Perubahan"}
              </button>

              {/* CANCEL */}
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary flex-1 h-12 rounded-xl border border-border text-sm sm:text-base"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}