"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function ClientLayout({ children }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      {" "}
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        {" "}
        {children}
        <Toaster
          position="top-right"
          expand={true}
          richColors
          closeButton
          toastOptions={{
            duration: 5000,
            classNames: {
              toast:
                "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
              error:
                "group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground",
              success:
                "group-[.toaster]:bg-green-500 group-[.toaster]:text-white",
              warning:
                "group-[.toaster]:bg-amber-500 group-[.toaster]:text-white",
            },
          }}
        />
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
