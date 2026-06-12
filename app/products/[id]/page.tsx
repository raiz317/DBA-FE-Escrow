"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import useSWR from "swr";

import { apiClient } from "@/lib/api";

import { Product } from "@/types";

import { useAuthStore } from "@/store/authStore";

import {
  LoadingSkeleton,
  PriceDisplay,
} from "@/components";

import { Heart } from "lucide-react";

/**
 * FETCHER
 */
const fetcher = (url: string) =>
  apiClient
    .get(url)
    .then((res) => res.data.data);

export default function ProductDetailPage() {

  const params = useParams();

  const router = useRouter();

  const { user } = useAuthStore();

  const [quantity, setQuantity] =
    useState(1);

  const [isMounted, setIsMounted] =
    useState(false);

  const productId =
    params.id as string;

  /**
   * SWR
   */
  const {
    data: product,
    isLoading,
    error,
  } = useSWR<Product>(
    productId
      ? `/products/${productId}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  /**
   * MOUNT
   */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * LOADING
   */
  if (!isMounted || isLoading) {
    return (
      <div className="section-padding">
        <div className="max-content">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  /**
   * ERROR / NOT FOUND
   */
  if (error || !product) {
    return (
      <div className="section-padding text-center">
        <div className="max-content">

          <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary mb-3">
            Produk tidak ditemukan
          </h1>

          <button
            onClick={() =>
              router.back()
            }
            className="btn-secondary text-xs sm:text-sm mt-4"
          >
            Kembali
          </button>

        </div>
      </div>
    );
  }

  /**
   * STOCK
   */
  const isAvailable =
    product.stock > 0;

  /**
   * HANDLE BUY
   */
  const handleBuyClick = () => {

    if (!user) {

      router.push("/login");

      return;
    }

    if (user.role !== "buyer") {

      alert(
        "Hanya pembeli yang dapat membeli produk"
      );

      return;
    }

    router.push(
      `/checkout/${product.id}?quantity=${quantity}`
    );
  };

  return (
    <div className="section-padding">

      <div className="max-content">

        {/* BACK BUTTON */}
        <button
          onClick={() =>
            router.back()
          }
          className="
            text-xs
            sm:text-sm
            text-text-secondary
            hover:text-text-primary
            mb-6
            sm:mb-8
          "
        >
          ← Kembali
        </button>

        {/* MAIN GRID */}
        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-8
            lg:gap-12
            items-start
          "
        >

          {/* LEFT - IMAGE */}
          <div className="w-full">

            <div
              className="
                relative
                aspect-square
                bg-bg-secondary
                rounded-2xl
                overflow-hidden
                border
                border-border
              "
            >

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

                <div
                  className="
                    w-full
                    h-full
                    flex
                    items-center
                    justify-center
                    text-text-secondary
                    italic
                    text-sm
                    sm:text-base
                    p-4
                    text-center
                  "
                >
                  No Image Available
                </div>

              )}

            </div>

          </div>

          {/* RIGHT - DETAILS */}
          <div className="flex flex-col">

            {/* PRODUCT NAME */}
            <h1
              className="
                text-2xl
                sm:text-3xl
                lg:text-4xl
                font-semibold
                text-text-primary
                mb-4
                leading-tight
                break-words
              "
            >
              {product.name}
            </h1>

            {/* STOCK + PRICE */}
            <div className="mb-6">

              <div
                className={`
                  inline-flex
                  items-center
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  sm:text-sm
                  font-medium
                  mb-4
                  ${isAvailable
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                  }
                `}
              >
                {isAvailable
                  ? `${product.stock} tersedia`
                  : "Stok Habis"}
              </div>

              <div className="overflow-hidden">
                <PriceDisplay
                  amount={Number(
                    product.price
                  )}
                  size="lg"
                />
              </div>

            </div>

            {/* DESCRIPTION */}
            <div className="mb-8">

              <h2
                className="
                  text-sm
                  sm:text-base
                  font-medium
                  text-text-primary
                  mb-3
                "
              >
                Deskripsi Produk
              </h2>

              <p
                className="
                  text-sm
                  sm:text-base
                  text-text-secondary
                  leading-relaxed
                  whitespace-pre-line
                  break-words
                "
              >
                {product.description ||
                  "Tidak ada deskripsi produk."}
              </p>

            </div>

            {/* BUYER ACTIONS */}
            {user?.role === "buyer" && (

              <div className="space-y-6">

                {/* QUANTITY */}
                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-medium
                      text-text-primary
                      mb-3
                    "
                  >
                    Jumlah
                  </label>

                  <div className="flex items-center gap-3 flex-wrap">

                    {/* MINUS */}
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.max(
                            1,
                            quantity - 1
                          )
                        )
                      }
                      disabled={
                        quantity <= 1 ||
                        !isAvailable
                      }
                      className="
                        w-10
                        h-10
                        sm:w-11
                        sm:h-11
                        border
                        border-border
                        rounded-lg
                        flex
                        items-center
                        justify-center
                        text-lg
                        disabled:opacity-30
                        transition
                      "
                    >
                      −
                    </button>

                    {/* INPUT */}
                    <input
                      type="number"
                      value={quantity}
                      readOnly
                      className="
                        input-base
                        w-20
                        sm:w-24
                        text-center
                        text-sm
                        sm:text-base
                        bg-transparent
                      "
                    />

                    {/* PLUS */}
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(
                            product.stock,
                            quantity + 1
                          )
                        )
                      }
                      disabled={
                        quantity >=
                        product.stock ||
                        !isAvailable
                      }
                      className="
                        w-10
                        h-10
                        sm:w-11
                        sm:h-11
                        border
                        border-border
                        rounded-lg
                        flex
                        items-center
                        justify-center
                        text-lg
                        disabled:opacity-30
                        transition
                      "
                    >
                      +
                    </button>

                  </div>

                </div>

                {/* ACTION BUTTONS */}
                <div
                  className="
                    flex
                    flex-col
                    sm:flex-row
                    gap-3
                    pt-2
                  "
                >

                  {/* BUY BUTTON */}
                  <button
                    onClick={
                      handleBuyClick
                    }
                    disabled={!isAvailable}
                    className="
                      btn-primary
                      flex-1
                      text-sm
                      sm:text-base
                      py-3
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >
                    Beli Sekarang
                  </button>

                  {/* FAVORITE */}
                  <button
                    className="
                      btn-secondary
                      h-12
                      sm:h-auto
                      sm:px-5
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Heart size={18} />
                  </button>

                </div>

              </div>

            )}

            {/* NOT LOGIN */}
            {!user && (

              <button
                onClick={() =>
                  router.push("/login")
                }
                className="
                  btn-primary
                  w-full
                  text-sm
                  sm:text-base
                  py-3
                  mt-2
                "
              >
                Masuk untuk Membeli
              </button>

            )}

            {/* NOT BUYER */}
            {user &&
              user.role !== "buyer" && (

                <div
                  className="
                    p-4
                    bg-bg-secondary
                    rounded-xl
                    text-sm
                    text-text-secondary
                    mt-4
                    leading-relaxed
                  "
                >
                  Anda masuk sebagai{" "}
                  <span className="font-semibold">
                    {user.role}
                  </span>
                  . Hanya akun Pembeli
                  yang dapat melakukan
                  transaksi.
                </div>

              )}

          </div>

        </div>

      </div>

    </div>
  );
}