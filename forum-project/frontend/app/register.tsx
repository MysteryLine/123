"use client";
import { useState } from "react";
import Link from "next/link";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem("token", data.token);
                window.location.href = "/";
            } else {
                setError(data.message || "注册失败");
            }
        } catch {
            setError("网络错误，请稍后重试");
        }
        setLoading(false);
    };

    return (
        <main style={{ maxWidth: 400, margin: "3rem auto", padding: "2rem", boxShadow: "0 2px 16px #eee", borderRadius: 12, background: "#fff" }}>
            <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>注册新账号</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <input
                    type="text"
                    placeholder="用户名"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    style={{ padding: "0.75rem", borderRadius: 6, border: "1px solid #ccc" }}
                />
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
                    {loading ? "注册中..." : "注册"}
                </button>
                {error && <div style={{ color: "#e00", textAlign: "center" }}>{error}</div>}
            </form>
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <span>已有账号？</span>
                <Link href="/login" style={{ color: "#0070f3", marginLeft: 8 }}>去登录</Link>
            </div>
        </main>
    );
}
