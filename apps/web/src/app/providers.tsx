"use client";

import { MantineProvider, createTheme } from "@mantine/core";

const theme = createTheme({
  fontFamily: "var(--font-geist-sans), sans-serif",
  headings: {
    fontFamily: "var(--font-geist-sans), sans-serif",
    fontWeight: "600",
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return <MantineProvider theme={theme}>{children}</MantineProvider>;
}
