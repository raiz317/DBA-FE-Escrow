"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatRupiah } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({
  product,
}: ProductCardProps) {

  const isAvailable = product.stock > 0;
  console.log("PRODUCT:", product);
  console.log("IMAGE URL:", product.image_url);

  return (
    <Link href={`/products/${product.id}`}>
      <div className="card-border hover:shadow-sm transition-shadow cursor-pointer h-full">

        {/* IMAGE */}
        <div className="relative aspect-video bg-bg-secondary overflow-hidden">

          {product.image_url ? (

            // <img
            //   src={product.image_url}
            //   alt={product.name}
            //   className="w-full h-full object-cover"
            //   onError={(e) => {
            //     e.currentTarget.src = "/placeholder.png";
            //   }}
            // />
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              onLoad={() => {
                console.log(
                  "IMAGE LOADED:",
                  product.image_url
                );
              }}
              onError={(e) => {
                console.error(
                  "IMAGE FAILED:",
                  product.image_url
                );

                e.currentTarget.src = "/placeholder.png";
              }}
            />

          ) : (

            <div className="w-full h-full flex items-center justify-center text-text-secondary">
              No image
            </div>

          )}

        </div>

        {/* CONTENT */}
        <div className="p-3.5">

          {/* STOCK */}
          <div className="mb-2">

            <span
              className={`inline-block px-3 py-1 rounded-badge text-xs font-medium ${isAvailable
                ? "bg-stock-available-bg text-stock-available-text"
                : "bg-stock-outOfStock-bg text-stock-outOfStock-text"
                }`}
            >
              {isAvailable
                ? `${product.stock} tersedia`
                : "Habis"}
            </span>

          </div>

          {/* NAME */}
          <h3 className="text-body font-medium text-text-primary mb-2 line-clamp-2">
            {product.name}
          </h3>

          {/* PRICE */}
          <p className="text-base font-medium text-text-primary">
            {formatRupiah(Number(product.price))}
          </p>

        </div>

      </div>
    </Link >
  );
}