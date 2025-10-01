"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) router.push("/login");
    else {
      const err = await res.json();
      alert(err.error || "Signup failed");
    }
  }

  return (
    <div>
      <p>Sign up</p>
      <form onSubmit={onSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
