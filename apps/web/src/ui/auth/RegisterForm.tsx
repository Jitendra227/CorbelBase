"use client";

import type { FormEvent } from "react";
import Link from "next/link";

import { PATHS } from "@/config/paths";

import styles from "./auth.module.scss";
import { useRegister } from "./use-register";

export default function RegisterForm() {
  const {
    name,
    email,
    password,
    error,
    isSubmitting,
    setName,
    setEmail,
    setPassword,
    handleSubmit,
  } = useRegister();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSubmit();
  }

  return (
    <main className={styles.formContainer}>
      <h1>Create a CorbelBase account</h1>
      <p>Register to start managing your workspace.</p>
      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor="register-name">Name</label>
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isSubmitting}
            required
            minLength={2}
          />
        </div>

        <div>
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
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
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            required
            minLength={8}
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p>
        Already have an account? <Link href={PATHS.login}>Sign in</Link>
      </p>
    </main>
  );
}
