"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { credentialsSchema, LoginCredentials } from "@/lib/auth/schema";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginCredentials>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginCredentials) {
    setServerError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      const err = (res as any)?.error ?? null;
      const ok = (res as any)?.ok ?? false;

      if (ok && !err) {
        router.push("/");
        router.refresh();
        return;
      }

      if (err) {
        if (String(err).includes("CredentialsSignin")) {
          setError("password", {
            type: "server",
            message: "Invalid email or password.",
          });
        } else {
          setServerError(String(err));
        }
      } else {
        setServerError("Unable to sign in. Please try again.");
      }
    } catch (e) {
      setServerError((e as Error).message || "Unexpected error");
    }
  }

  return (
    <div>
      <hr className="pb-10" />
      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white outline p-8">
          <h1 className="text-2xl font-semibold mb-2 text-gray-900">
            Sign in to your account
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Enter your email and password to continue.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
                className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 disabled:opacity-50 ${
                  errors.email ? "border-red-300" : "border-gray-200"
                }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p
                  id="email-error"
                  role="alert"
                  className="mt-1 text-xs text-red-600"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="mb-8">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  {...register("password")}
                  className={`block w-full rounded-md border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 disabled:opacity-50 ${
                    errors.password ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder="***"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700 outline-0"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  role="alert"
                  className="mt-1 text-xs text-red-600"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div
                role="alert"
                className="rounded-md bg-red-50 p-3 text-sm text-red-700"
              >
                {serverError}
              </div>
            )}

            <div>
              <button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Signing in…" : "Sign in"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <a href="/signup" className="text-indigo-600 hover:underline">
              Create one
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
