"use client";

import { useState } from "react";
import useSWR from "swr";
import { apiClient } from "@/lib/api";

const fetcher = (url: string) =>
    apiClient.get(url).then((res) => res.data);

export default function ChatRoom({
    params,
}: {
    params: { id: string };
}) {
    const [message, setMessage] = useState("");

    const { data, mutate } = useSWR(
        `/chats/${params.id}/messages`,
        fetcher,
        {
            refreshInterval: 2000,
        }
    );

    const messages = data?.data || [];

    const sendMessage = async () => {
        if (!message.trim()) return;

        await apiClient.post(
            `/chats/${params.id}/send`,
            {
                message,
            }
        );

        setMessage("");

        mutate();
    };

    return (
        <div className="section-padding">
            <div className="max-content max-w-2xl">
                <div className="card-border p-6 h-[70vh] flex flex-col">

                    <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                        {messages.map((msg: any) => (
                            <div
                                key={msg.id}
                                className="bg-bg-secondary rounded-card p-3"
                            >
                                <p className="text-xs font-medium mb-1">
                                    {msg.sender?.name}
                                </p>

                                <p>{msg.message}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <input
                            value={message}
                            onChange={(e) =>
                                setMessage(e.target.value)
                            }
                            className="input-base flex-1"
                            placeholder="Ketik pesan..."
                        />

                        <button
                            onClick={sendMessage}
                            className="btn-primary"
                        >
                            Kirim
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}