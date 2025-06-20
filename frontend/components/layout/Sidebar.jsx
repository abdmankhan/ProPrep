// components/dashboard/Sidebar.jsx
"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { navItems } from "@/lib/constants";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  dailyTimeSpent,
  totalTimeSpent,
}) {
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Sidebar content */}
      <div className="p-4 flex items-center justify-between border-b border-slate-200">
        {sidebarOpen ? (
          <div className="flex items-center">
            <i className="fas fa-code-branch text-blue-600 text-xl mr-2"></i>
            <span className="font-bold text-lg">PrepMaster</span>
          </div>
        ) : (
          <i className="fas fa-code-branch text-blue-600 text-xl mx-auto"></i>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="!rounded-button cursor-pointer"
        >
          <i className={`fas fa-chevron-${sidebarOpen ? "left" : "right"}`}></i>
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {" "}
        <div className="p-2">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link href={item.href || "#"} key={item.id} passHref>
                <Button
                  variant="ghost"
                  className={`w-full justify-start mb-1 !rounded-button whitespace-nowrap ${
                    !sidebarOpen ? "justify-center" : ""
                  }`}
                >
                  <i
                    className={`${item.icon} ${sidebarOpen ? "mr-2" : ""}`}
                  ></i>
                  {sidebarOpen && <span>{item.label}</span>}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      </ScrollArea>

      {/* Time tracking section */}
      <div className="p-4 border-t border-slate-200">
        {sidebarOpen ? (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center text-sm text-slate-500 mb-1">
                <span>Today</span>
                <span className="font-medium">
                  {formatTime(dailyTimeSpent)}
                </span>
              </div>
              <Progress
                value={(dailyTimeSpent / 180) * 100}
                className="h-1.5"
              />
            </div>
            <div>
              <div className="flex justify-between items-center text-sm text-slate-500 mb-1">
                <span>Total Time</span>
                <span className="font-medium">
                  {formatTime(totalTimeSpent)}
                </span>
              </div>
              <Progress value={100} className="h-1.5 bg-blue-100" />
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <i className="fas fa-clock text-blue-500"></i>
          </div>
        )}
      </div>
    </div>
  );
}
