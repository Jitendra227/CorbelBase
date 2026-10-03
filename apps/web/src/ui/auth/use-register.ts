"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PATHS } from "@/config/paths";
import { register } from "@/lib/auth/service";

export function useRegister() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError("");
    setIsSubmitting(true);

    try {
      await register({
        name,
        email,
        password,
      });

      router.replace(PATHS.login);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create an account. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    isSubmitting,
    handleSubmit,
  };
}
