// app/(dashboard)/layout.jsx
"use client";
import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Header from "../../components/layout/DashHeader.jsx";
import { Button } from "../../components/ui/button.jsx";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "../../components/ui/sheet.jsx";
import { Toaster } from "sonner";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dailyTimeSpent, setDailyTimeSpent] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="!rounded-button">
              <i className="fas fa-bars"></i>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              dailyTimeSpent={dailyTimeSpent}
              totalTimeSpent={totalTimeSpent}
            />
          </SheetContent>
        </Sheet>
      </div>{" "}
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:block bg-card border-r border-border h-full ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          dailyTimeSpent={dailyTimeSpent}
          totalTimeSpent={totalTimeSpent}
        />
      </div>
      {/* Main Content */}{" "}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
      {/* Toast notifications */}
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
    </div>
  );
}
