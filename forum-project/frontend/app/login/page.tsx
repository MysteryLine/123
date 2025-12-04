"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await api.auth.login({ email, password });
            if (response.data.success) {
                localStorage.setItem("token", response.data.token);
                window.location.href = "/";
            } else {
                setError(response.data.message || "登录失败");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "网络错误，请稍后重试";
            console.error('登录错误详情:', err.response?.data);
            setError(errorMessage);
        }
        setLoading(false);
    };

    return (
        <main style={{ maxWidth: 420, margin: "3rem auto", padding: "2rem", boxShadow: "0 6px 24px rgba(16,24,40,0.08)", borderRadius: 12, background: "#fff" }}>
            <h2 style={{ textAlign: "center", marginBottom: "1.25rem" }}>登录 论坛</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                <input
                    type="email"
                    placeholder="邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: "0.75rem", borderRadius: 8, border: "1px solid #e6e6e6" }}
                />
                <input
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: "0.75rem", borderRadius: 8, border: "1px solid #e6e6e6" }}
                />
                <button type="submit" disabled={loading} style={{ padding: "0.75rem", borderRadius: 8, background: "#0ea5ff", color: "#fff", border: "none", fontWeight: 600 }}>
                    {loading ? "登录中..." : "登录"}
                </button>
                {error && <div style={{ color: "#dc2626", textAlign: "center" }}>{error}</div>}
            </form>
            <div style={{ textAlign: "center", marginTop: "1rem", color: "#444" }}>
                <span>没有账号？</span>
                <Link href="/register" style={{ color: "#0ea5ff", marginLeft: 8 }}>去注册</Link>
            </div>
        </main>
    );
}
