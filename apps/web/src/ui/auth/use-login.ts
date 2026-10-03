"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PATHS } from "@/config/paths";
import { login } from "@/lib/auth/service";

export function useLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError("");
    setIsSubmitting(true);

    try {
      await login({
        email,
        password,
      });

      router.replace(PATHS.organizations);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isSubmitting,
    handleSubmit,
  };
}
