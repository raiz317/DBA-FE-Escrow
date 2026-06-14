"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";

import { apiClient } from "@/lib/api";

import {
  Product,
  PaginatedResponse,
} from "@/types";

import {
  ProductCard,
  LoadingSkeleton,
  EmptyState,
} from "@/components";

import {
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * FETCHER
 */
const fetcher = async (url: string) => {
  console.log("FETCHER DIPANGGIL:", url);

  const res = await apiClient.get(url);

  console.log("PRODUCT API:", res.data);

  return {
    success: true,
    message: "Success",
    data: res.data.data || [],
    pagination: res.data.pagination || null,
  };
};

export default function ProductsPage() {

  const [isMounted, setIsMounted] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  /**
   * MOUNT
   */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * SEARCH DEBOUNCE
   */
  useEffect(() => {

    const timer = setTimeout(() => {

      setDebouncedSearch(search);

      setCurrentPage(1);

    }, 300);

    return () => clearTimeout(timer);

  }, [search]);

  /**
   * QUERY PARAMS
   */
  const params = new URLSearchParams({
    page: currentPage.toString(),
    limit: "12",

    ...(debouncedSearch && {
      search: debouncedSearch,
    }),
  });

  /**
   * SWR
   */
  const {
    data,
    isLoading,
    error,
  } = useSWR<PaginatedResponse<Product>>(
    `/products?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  /**
   * SSR FIX
   */
  if (!isMounted) return null;

  /**
   * API ERROR
   */
  if (error) {
    return (
      <div className="p-6 sm:p-10 text-red-500 text-sm sm:text-base">
        Gagal mengambil data produk
      </div>
    );
  }

  /**
   * DATA
   */
  const products = data?.data || [];

  const pagination = data?.pagination;

  return (
    <div className="section-padding">

      <div className="max-content">

        {/* HEADER */}
        <div className="mb-6 sm:mb-8">

          <h1 className="text-2xl sm:text-3xl lg:text-section-heading text-text-primary mb-4 sm:mb-6">
            Jelajahi Produk
          </h1>

          {/* SEARCH */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-text-secondary"
              />

              <input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="input-base w-full pl-10 sm:pl-11 pr-4 py-3 text-sm sm:text-base"
              />

            </div>

          </div>

        </div>

        {/* LOADING */}
        {isLoading ? (

          <LoadingSkeleton count={12} />

        ) : products.length > 0 ? (

          <>

            {/* GRID */}
            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
                gap-4
                sm:gap-5
                lg:gap-6
                mb-8
              "
            >

              {products.map((product) => {

                console.log(
                  "PRODUCT:",
                  product
                );

                console.log(
                  "IMAGE:",
                  product.image_url
                );

                return (
                  <div
                    key={product.id}
                    className="h-full"
                  >

                    <ProductCard
                      product={{
                        ...product,

                        image_url:
                          product.image_url ||
                          "https://picsum.photos/400/200",
                      }}
                    />

                  </div>
                );
              })}

            </div>

            {/* PAGINATION */}
            {pagination &&
              pagination.total > 1 && (

                <div
                  className="
                    flex
                    flex-col
                    sm:flex-row
                    items-center
                    justify-center
                    gap-3
                    sm:gap-4
                    mt-8
                    sm:mt-12
                  "
                >

                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.max(1, p - 1)
                      )
                    }
                    disabled={currentPage === 1}
                    className="
                      btn-secondary
                      text-xs
                      sm:text-sm
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                      flex
                      items-center
                      justify-center
                      gap-2
                      w-full
                      sm:w-auto
                    "
                  >
                    <ChevronLeft size={16} />
                    Sebelumnya
                  </button>

                  <div className="text-xs sm:text-sm text-text-secondary text-center">
                    Halaman{" "}
                    {pagination.current_page}{" "}
                    dari{" "}
                    {pagination.total}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(
                          pagination.total,
                          p + 1
                        )
                      )
                    }
                    disabled={
                      currentPage ===
                      pagination.total
                    }
                    className="
                      btn-secondary
                      text-xs
                      sm:text-sm
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                      flex
                      items-center
                      justify-center
                      gap-2
                      w-full
                      sm:w-auto
                    "
                  >
                    Selanjutnya
                    <ChevronRight size={16} />
                  </button>

                </div>
              )}

          </>

        ) : (

          <EmptyState
            icon={Search}
            title="Produk tidak ditemukan"
            description={
              debouncedSearch
                ? `Tidak ada produk yang cocok dengan "${debouncedSearch}"`
                : "Belum ada produk yang tersedia"
            }
          />

        )}

      </div>

    </div>
  );
}
