"use client";

import type { FormEvent } from "react";
import Link from "next/link";

import { PATHS } from "@/config/paths";

import styles from "./auth.module.scss";
import { useLogin } from "./use-login";

export default function LoginForm() {
  const {
    email,
    password,
    error,
    isSubmitting,
    setEmail,
    setPassword,
    handleSubmit,
  } = useLogin();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSubmit();
  }

  return (
    <main className={styles.formContainer}>
      <h1>Sign in to CorbelBase</h1>
      <p>Enter your credentials to continue.</p>
      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p>
        New to CorbelBase? <Link href={PATHS.register}>Create an account</Link>
      </p>
    </main>
  );
}
