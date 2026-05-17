"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSignIn } from "@clerk/nextjs";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const requestReset = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!isLoaded) return;

        setLoading(true);
        setError("");
        try {
            await signIn.create({
                strategy: "reset_password_email_code",
                identifier: email,
            });
            setCodeSent(true);
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "Unable to send reset code");
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!isLoaded) return;

        setLoading(true);
        setError("");
        try {
            const result = await signIn.attemptFirstFactor({
                strategy: "reset_password_email_code",
                code,
                password,
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                router.push("/");
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "Unable to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-bg-main px-4 sm:px-6 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Image src="/movie.png" alt="TheMovie Logo" width={60} height={60} className="object-contain" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Reset Password</h1>
                    <p className="text-text-secondary">
                        {codeSent ? "Enter the code from your email and choose a new password." : "We'll send a reset code to your email."}
                    </p>
                </div>

                <div className="bg-bg-card border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {!codeSent ? (
                        <form onSubmit={requestReset} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-accent-primary transition-colors"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 size={18} className="animate-spin" />}
                                Send Reset Code
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={resetPassword} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">Verification Code</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(event) => setCode(event.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:border-accent-primary transition-colors"
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-12 py-3 text-white focus:outline-none focus:border-accent-primary transition-colors"
                                        placeholder="New password"
                                        minLength={8}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 size={18} className="animate-spin" />}
                                Reset Password
                            </button>
                        </form>
                    )}

                    <Link href="/sign-in" className="block text-center mt-6 text-sm text-accent-primary hover:text-accent-primary/80">
                        Back to sign in
                    </Link>
                </div>
            </div>
        </main>
    );
}
