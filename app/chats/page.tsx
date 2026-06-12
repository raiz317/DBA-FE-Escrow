"use client";

import useSWR from "swr";
import Link from "next/link";
import { apiClient } from "@/lib/api";

const fetcher = (url: string) =>
    apiClient.get(url).then((res) => res.data);

export default function ChatsPage() {
    const { data } = useSWR("/chats", fetcher);

    const chats = data?.data || [];

    return (
        <div className="section-padding">
            <div className="max-content">
                <h1 className="text-section-heading mb-8">
                    Chat Transaksi
                </h1>

                <div className="space-y-4">
                    {chats.map((chat: any) => (
                        <Link
                            key={chat.id}
                            href={`/chats/${chat.id}`}
                            className="card-border p-4 block hover:bg-bg-secondary"
                        >
                            <p className="font-medium">
                                Order #{chat.order_id}
                            </p>

                            <p className="text-xs text-text-secondary">
                                {chat.messages?.[0]?.message || "Belum ada pesan"}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}