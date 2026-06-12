"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { Send } from "lucide-react";

interface ChatMessage {
    id: number;
    sender_id: number;
    message: string;
    created_at: string;
    sender?: {
        id: number;
        name: string;
    };
}

interface Props {
    orderId: string | number;
    currentUserId?: number;
}

// PERBAIKAN: Selaraskan interseptor ekstraksi data Axios instansiasi SWR
const fetcher = (url: string) =>
    apiClient.get(url).then((res) => {
        return res.data?.data ? res.data.data : res.data;
    });

export default function TransactionChat({
    orderId,
    currentUserId,
}: Props) {
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        data: messages,
        mutate,
        isLoading,
    } = useSWR<ChatMessage[]>(
        orderId ? `/orders/${orderId}/messages` : null,
        fetcher,
        {
            refreshInterval: 3000, // Pooling otomatis riwayat pesan per 3 detik
            revalidateOnFocus: true,
        }
    );

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    };

    useEffect(() => {
        if (messages) {
            scrollToBottom();
        }
    }, [messages]);

    const sendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!message.trim() || isSending) return;

        setIsSending(true);
        try {
            await apiClient.post(`/orders/${orderId}/messages`, {
                message: message.trim(),
            });

            setMessage("");
            await mutate(); // Memperbarui daftar chat secara instan
        } catch (error) {
            console.error("Detail Error Frontend:", error);
            alert("Gagal mengirim pesan. Silakan coba lagi.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="card-border p-6 mt-6">
            <h2 className="text-base font-medium text-text-primary mb-4">
                Chat Transaksi
            </h2>

            <div className="border border-border rounded-lg h-[400px] flex flex-col overflow-hidden bg-white">
                {/* Bagian Kontainer Riwayat Pesan */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 flex flex-col">
                    {isLoading && !messages ? (
                        <p className="text-xs text-text-secondary text-center my-auto">
                            Memuat chat...
                        </p>
                    ) : messages && messages.length > 0 ? (
                        messages.map((msg) => {
                            // Mencocokkan tipe data ID pengirim pesan dengan user login saat ini
                            const isMine = Number(msg.sender_id) === Number(currentUserId);

                            return (
                                <div key={msg.id} className={`flex w-full ${isMine ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm ${isMine ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white border border-border text-text-primary rounded-tl-none"}`}>
                                        {!isMine && <p className="text-[11px] font-semibold text-indigo-600 mb-0.5">{msg.sender?.name || "User"}</p>}
                                        <p className="text-sm break-words whitespace-pre-wrap">{msg.message}</p>
                                        <p className={`text-[9px] mt-1 text-right ${isMine ? "text-white/70" : "text-gray-400"}`}>
                                            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-xs text-gray-400">Belum ada obrolan. Mulai kirim pesan!</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Form Pengiriman Input Pesan */}
                <form onSubmit={sendMessage} className="p-3 border-t border-border flex gap-2 bg-white">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tulis pesan Anda di sini..."
                        disabled={isSending}
                        className="flex-1 px-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-indigo-500 disabled:bg-gray-100"
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || isSending}
                        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
