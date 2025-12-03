"use client";
import { useState } from "react";
import Link from "next/link";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem("token", data.token);
                window.location.href = "/";
            } else {
                setError(data.message || "登录失败");
            }
        } catch {
            setError("网络错误，请稍后重试");
        }
        setLoading(false);
    };

    return (
        <main style={{ maxWidth: 400, margin: "3rem auto", padding: "2rem", boxShadow: "0 2px 16px #eee", borderRadius: 12, background: "#fff" }}>
            <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>登录论坛</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <input
                    type="email"
                    placeholder="邮箱"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ padding: "0.75rem", borderRadius: 6, border: "1px solid #ccc" }}
                />
                <input
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ padding: "0.75rem", borderRadius: 6, border: "1px solid #ccc" }}
                />
                <button type="submit" disabled={loading} style={{ padding: "0.75rem", borderRadius: 6, background: "#0070f3", color: "#fff", border: "none", fontWeight: "bold" }}>
                    {loading ? "登录中..." : "登录"}
                </button>
                {error && <div style={{ color: "#e00", textAlign: "center" }}>{error}</div>}
            </form>
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <span>没有账号？</span>
                <Link href="/register" style={{ color: "#0070f3", marginLeft: 8 }}>去注册</Link>
            </div>
        </main>
    );
}
