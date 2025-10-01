"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { credentialsSchema } from "@/lib/auth/schema";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFormError(parsed.error.issues.map((err) => err.message).join(", "));
      return;
    }

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res.url) {
      router.push(res.url);
    }

    const err = res?.error ?? "Unknown error";
    if (err.includes("CredentialsSignin")) {
      setFormError("Invalid email or password.");
    } else {
      setFormError(err);
    }
  }

  return (
    <main>
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="password"
        />
        <button type="submit">Sign in</button>
        {formError && <div role="alert">{formError}</div>}
      </form>
    </main>
  );
}
