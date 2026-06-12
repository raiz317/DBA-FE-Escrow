"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { Product } from "@/types";
import { ProductCard, LoadingSkeleton, EmptyState } from "@/components";
import { ShoppingBag, Lock, Zap } from "lucide-react";

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  const { data: productsData, isLoading } = useSWR<{
    data: Product[];
  }>("/products?limit=6", fetcher, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const products = productsData?.data || [];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="section-padding text-center">
        <div className="max-content px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-text-primary">
            Jual beli aman, tanpa risiko.
          </h1>

          <p className="text-sm sm:text-base md:text-lg leading-6 sm:leading-7 text-text-secondary mb-8 max-w-[520px] mx-auto">
            Platform marketplace dengan sistem escrow yang melindungi pembeli
            dan penjual dari risiko transaksi.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/products"
              className="btn-primary text-xs sm:text-sm w-full sm:w-auto"
            >
              Jelajahi Produk
            </Link>

            <Link
              href="/register"
              className="btn-secondary text-xs sm:text-sm w-full sm:w-auto"
            >
              Mulai Berjualan
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-bg-secondary">
        <div className="max-content px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center mb-10 md:mb-12 text-text-primary">
            Mengapa Memilih Escrow?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0">
            {/* Feature 1 */}
            <div className="md:border-r border-border md:pr-6 text-center md:text-left">
              <div className="flex justify-center md:justify-start">
                <Lock size={32} className="text-text-primary mb-4" />
              </div>

              <h3 className="text-base sm:text-lg font-medium text-text-primary mb-2">
                Transaksi Aman
              </h3>

              <p className="text-sm sm:text-base text-text-secondary leading-6">
                Dana pembeli dilindungi dalam sistem escrow hingga barang
                diterima dengan sempurna.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="md:border-r border-border md:px-6 py-2 md:py-0 text-center md:text-left">
              <div className="flex justify-center md:justify-start">
                <ShoppingBag
                  size={32}
                  className="text-text-primary mb-4"
                />
              </div>

              <h3 className="text-base sm:text-lg font-medium text-text-primary mb-2">
                Kemudahan Belanja
              </h3>

              <p className="text-sm sm:text-base text-text-secondary leading-6">
                Proses pembelian yang mudah dengan berbagai metode pembayaran
                yang tersedia.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="md:pl-6 text-center md:text-left">
              <div className="flex justify-center md:justify-start">
                <Zap size={32} className="text-text-primary mb-4" />
              </div>

              <h3 className="text-base sm:text-lg font-medium text-text-primary mb-2">
                Pengiriman Cepat
              </h3>

              <p className="text-sm sm:text-base text-text-secondary leading-6">
                Lacak pesanan secara real-time dan dapatkan notifikasi setiap
                update pengiriman.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="section-padding">
        <div className="max-content px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-text-primary">
              Produk Terbaru
            </h2>
          </div>

          {isLoading ? (
            <LoadingSkeleton count={6} />
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="text-center mt-10 sm:mt-12">
                <Link
                  href="/products"
                  className="btn-secondary text-xs sm:text-sm w-full sm:w-auto inline-block"
                >
                  Lihat Semua Produk
                </Link>
              </div>
            </>
          ) : (
            <EmptyState
              icon={ShoppingBag}
              title="Belum ada produk"
              description="Produk akan segera tersedia"
            />
          )}
        </div>
      </section>
    </div>
  );
}