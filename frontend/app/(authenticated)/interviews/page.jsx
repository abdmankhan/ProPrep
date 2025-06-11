"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/lib/store/auth-store";

const Page = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/signin");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // Prevent rendering while redirecting
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col items-center max-w-md w-full">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6l4 2"
            />
          </svg>
          <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
            Module In Progress
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            This Interviews module is currently being developed.
            <br />
            Please check back soon!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
