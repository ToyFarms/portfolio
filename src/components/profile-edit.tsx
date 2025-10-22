"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Session } from "next-auth";
import { UserUpdate, userUpdateSchema } from "@/app/api/user/types";
import ProfileImage from "./profile-image";

export default function ProfileEditPage({ session }: { session: Session }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      image: session?.user?.image || "",
      newPassword: "",
      currentPassword: "",
    },
  });

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-semibold">Not signed in</h1>
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  async function onSubmit(values: UserUpdate) {
    setServerError(null);
    setSuccessMessage(null);

    try {
      const payload: any = { ...values };
      if (payload.name === "") delete payload.name;
      if (payload.email === "") delete payload.email;
      if (payload.image === "") delete payload.image;
      if (payload.newPassword === "") delete payload.newPassword;
      if (payload.currentPassword === "") delete payload.currentPassword;
      const changingPassword = Boolean(
        values.newPassword && values.currentPassword,
      );

      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          Array.isArray(data.error)
            ? JSON.stringify(data.error)
            : data.error || "Failed to update profile",
        );
      }

      if (changingPassword) {
        setSuccessMessage("Password changed — signing out...");
        await fetch("/api/logout");
        router.push("/login");
        router.refresh();
        return;
      }

      try {
        await fetch("/api/auth/refresh", { method: "POST" });
        setSuccessMessage("Profile updated successfully!");
        router.refresh();
      } catch (refreshError) {
        console.error("Session refresh failed:", refreshError);
        setSuccessMessage(
          "Profile updated successfully! Please refresh the page to see changes.",
        );
        router.refresh();
      }
    } catch (e) {
      setServerError((e as Error).message || "Unexpected error");
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white outline p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <ProfileImage user={session.user} />

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "name-error" : undefined}
                {...register("name")}
                className={`mt-1 block w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 disabled:opacity-50 ${
                  errors.name ? "border-red-300" : "border-gray-200"
                }`}
                placeholder="Your name"
              />
              {errors.name && (
                <p
                  id="name-error"
                  role="alert"
                  className="mt-1 text-xs text-red-600"
                >
                  {errors.name.message}
                </p>
              )}
            </div>

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
                className={`mt-1 block w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 disabled:opacity-50 ${
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

            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700"
              >
                Profile Image URL (optional)
              </label>
              <input
                id="image"
                type="text"
                aria-invalid={errors.image ? "true" : "false"}
                aria-describedby={errors.image ? "image-error" : undefined}
                {...register("image")}
                className={`mt-1 block w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 disabled:opacity-50 ${
                  errors.image ? "border-red-300" : "border-gray-200"
                }`}
                placeholder="https://example.com/avatar.jpg"
              />
              {errors.image && (
                <p
                  id="image-error"
                  role="alert"
                  className="mt-1 text-xs text-red-600"
                >
                  {errors.image.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                New Password (optional)
              </label>
              <input
                id="newPassword"
                type="password"
                aria-invalid={errors.newPassword ? "true" : "false"}
                aria-describedby={
                  errors.newPassword ? "newPassword-error" : undefined
                }
                {...register("newPassword")}
                className={`mt-1 block w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 disabled:opacity-50 ${
                  errors.newPassword ? "border-red-300" : "border-gray-200"
                }`}
                placeholder="Enter a new password"
              />
              {errors.newPassword && (
                <p
                  id="newPassword-error"
                  role="alert"
                  className="mt-1 text-xs text-red-600"
                >
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Current Password (required when changing email or password)
              </label>
              <input
                id="currentPassword"
                type="password"
                aria-invalid={errors.currentPassword ? "true" : "false"}
                aria-describedby={
                  errors.currentPassword ? "currentPassword-error" : undefined
                }
                {...register("currentPassword")}
                className={`mt-1 block w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 disabled:opacity-50 ${
                  errors.currentPassword ? "border-red-300" : "border-gray-200"
                }`}
                placeholder="Enter current password"
              />
              {errors.currentPassword && (
                <p
                  id="currentPassword-error"
                  role="alert"
                  className="mt-1 text-xs text-red-600"
                >
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="border-t pt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  User ID
                </label>
                <div className="mt-1 text-sm text-gray-500">
                  {session.user.id ?? "-"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <div className="mt-1 text-sm text-gray-500">
                  {session.user.role ?? "user"}
                </div>
              </div>
            </div>

            {successMessage && (
              <div
                role="alert"
                className="rounded-md bg-green-50 p-3 text-sm text-green-700"
              >
                {successMessage}
              </div>
            )}

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
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
