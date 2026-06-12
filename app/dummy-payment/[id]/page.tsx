"use client";

import QRCode from "react-qr-code";

import { useParams } from "next/navigation";

export default function DummyPaymentPage() {

    const params = useParams();

    const paymentId = params.id;

    const paymentUrl =
        `${process.env.NEXT_PUBLIC_APP_URL}/payment-success/${paymentId}`;

    return (
        <div className="min-h-screen flex items-center justify-center">

            <div className="border p-6 rounded-xl">

                <h1 className="text-2xl font-bold mb-6">
                    Scan QR untuk Membayar
                </h1>

                <QRCode value={paymentUrl} size={250} />

            </div>
        </div>
    );
}