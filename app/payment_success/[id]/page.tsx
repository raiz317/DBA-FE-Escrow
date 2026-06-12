"use client";

import { useEffect } from "react";

import { useParams, useRouter } from "next/navigation";

import { apiClient } from "@/lib/api";

export default function PaymentSuccessPage() {

    const params = useParams();

    const router = useRouter();

    useEffect(() => {

        const completePayment = async () => {

            try {

                await apiClient.post(
                    `/payments/${params.id}/complete`
                );

                alert("Pembayaran berhasil");

                router.push("/orders");

            } catch (error) {

                alert("Gagal");
            }
        };

        completePayment();

    }, [params.id, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            Memproses pembayaran...
        </div>
    );
}