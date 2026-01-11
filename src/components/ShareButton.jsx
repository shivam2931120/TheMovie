import { useState } from "react";
import { ShareIcon, LinkIcon, CloseIcon } from "./Icons";

export default function ShareButton({ title, text, url }) {
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = url || window.location.href;
    const shareTitle = title || "TheMovie";
    const shareText = text || `Check out ${shareTitle}!`;

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (err) {
                if (err.name !== "AbortError") {
                    setShowMenu(true);
                }
            }
        } else {
            setShowMenu(true);
        }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    const platforms = [
        { name: "Twitter/X", url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, color: "#1DA1F2" },
        { name: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, color: "#4267B2" },
        { name: "WhatsApp", url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`, color: "#25D366" },
        { name: "Telegram", url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, color: "#0088cc" },
    ];

    return (
        <div className="relative">
            <button
                onClick={handleNativeShare}
                className="inline-flex items-center gap-2 rounded-lg border border-[#2A2A2A] bg-[#141414] px-4 py-2 text-neutral-300 hover:border-[#E10600] hover:text-white transition"
            >
                <ShareIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
            </button>

            {showMenu && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] p-3 shadow-xl">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-white">Share</span>
                            <button
                                onClick={() => setShowMenu(false)}
                                className="text-neutral-400 hover:text-white"
                            >
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-1">
                            {platforms.map(p => (
                                <a
                                    key={p.name}
                                    href={p.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-[#141414] hover:text-white transition"
                                >
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                    {p.name}
                                </a>
                            ))}

                            <button
                                onClick={copyLink}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-[#141414] hover:text-white transition w-full text-left"
                            >
                                <LinkIcon className="w-4 h-4" />
                                {copied ? "Copied!" : "Copy Link"}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
