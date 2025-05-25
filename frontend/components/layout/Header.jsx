import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import useAuthStore from "@/lib/store/auth-store";
import { toast } from "sonner";
// import Cookies from "js-cookie";

const SKY = "#e0f2fe"; // light sky blue
const NAVY_ACCENT = "#2563eb";

const navLinks = [
  { name: "Home", href: "/", key: "home" },
  { name: "Problems", href: "/problems", key: "problems" },
  { name: "Contests", href: "/contests", key: "contests" },
  { name: "Discuss", href: "/discuss", key: "discuss" },
  { name: "Interview", href: "/interview", key: "interview" },
  { name: "Store", href: "/store", key: "store" },
];

const Header = () => {
  const router = useRouter();
  const { user, logout, fetchUser } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchUser().catch(() => {});
  }, [fetchUser]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
    }
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-sky-200 shadow-sm font-inter overflow-x-hidden"
      style={{ background: SKY }}
    >
      <div className="container mx-auto px-8 md:px-12 lg:px-16 max-w-[100vw]">
        <div className="flex items-center justify-between min-h-[72px] py-3 md:py-4">
          {/* Logo & Nav */}
          <div className="flex items-center gap-6 md:gap-8">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform">
                <i className="fas fa-bolt text-lg md:text-xl"></i>
              </div>
              <span className="text-xl md:text-2xl font-bold text-[#0f172a] group-hover:text-sky-600 transition-colors font-inter">
                PrepGenius
              </span>
            </a>
            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-8 ml-8">
              {navLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  className="text-[#0f172a]/80 hover:text-sky-700 font-medium px-3 py-1 rounded transition-colors duration-150 focus:outline-none focus:text-sky-700 focus:bg-sky-100 font-inter whitespace-nowrap"
                  style={{
                    fontWeight: link.key === "home" ? 700 : 500,
                    color: link.key === "home" ? NAVY_ACCENT : undefined,
                  }}
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2.5 rounded-lg hover:bg-sky-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i
              className={`fas ${
                isMobileMenuOpen ? "fa-times" : "fa-bars"
              } text-xl text-[#0f172a]`}
            ></i>
          </button>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-6">
            {/* User Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="!rounded-full p-0 border-2 border-sky-400"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="font-inter text-lg">
                        {user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 bg-sky-100 text-[#0f172a] border-none shadow-xl font-inter"
                >
                  <DropdownMenuLabel className="font-bold text-lg text-[#0f172a] font-inter">
                    {user.name || "User"}
                  </DropdownMenuLabel>
                  <div className="text-xs text-[#334155] px-4 pb-2 font-inter">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator className="bg-sky-200" />
                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className="hover:bg-sky-200 font-inter"
                  >
                    <i className="fas fa-user mr-2"></i> My profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/settings")}
                    className="hover:bg-sky-200 font-inter"
                  >
                    <i className="fas fa-cog mr-2"></i> Account settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-sky-200" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500 hover:bg-sky-200 hover:text-red-600 font-inter"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  className="!rounded-full border-sky-400 text-[#0f172a] hover:bg-sky-400 hover:text-white px-6 py-2.5 font-semibold transition-colors font-inter whitespace-nowrap"
                  onClick={() => router.push("/auth/signin")}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-sky-400 hover:bg-sky-600 !rounded-full text-white px-6 py-2.5 font-semibold shadow-md transition-colors font-inter whitespace-nowrap"
                  onClick={() => router.push("/auth/signup")}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-sky-200">
            <nav className="flex flex-col space-y-4 px-4">
              {navLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  className="text-[#0f172a]/80 hover:text-sky-700 font-medium px-3 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus:text-sky-700 focus:bg-sky-100 font-inter"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              {user && (
                <div className="pt-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-sky-100 cursor-pointer">
                        <Avatar className="h-10 w-10 border-2 border-sky-400">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="font-inter text-base">
                            {user.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-[#0f172a]">
                            {user.name || "User"}
                          </p>
                          <p className="text-sm text-[#334155]">{user.email}</p>
                        </div>
                        <i className="fas fa-chevron-down text-[#0f172a]/60"></i>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-full bg-sky-100 text-[#0f172a] border-none shadow-xl font-inter"
                    >
                      <DropdownMenuLabel className="font-bold text-lg text-[#0f172a] font-inter">
                        {user.name || "User"}
                      </DropdownMenuLabel>
                      <div className="text-xs text-[#334155] px-4 pb-2 font-inter">
                        {user.email}
                      </div>
                      <DropdownMenuSeparator className="bg-sky-200" />
                      <DropdownMenuItem
                        onClick={() => {
                          router.push("/profile");
                          setIsMobileMenuOpen(false);
                        }}
                        className="hover:bg-sky-200 font-inter"
                      >
                        <i className="fas fa-user mr-2"></i> My profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          router.push("/settings");
                          setIsMobileMenuOpen(false);
                        }}
                        className="hover:bg-sky-200 font-inter"
                      >
                        <i className="fas fa-cog mr-2"></i> Account settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-sky-200" />
                      <DropdownMenuItem
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-red-500 hover:bg-sky-200 hover:text-red-600 font-inter"
                      >
                        <i className="fas fa-sign-out-alt mr-2"></i> Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              {!user && (
                <div className="flex flex-col space-y-2 pt-2 px-2">
                  <Button
                    className="!rounded-full border-sky-400 text-[#0f172a] hover:bg-sky-400 hover:text-white px-6 py-2.5 font-semibold transition-colors font-inter"
                    onClick={() => {
                      router.push("/auth/signin");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="bg-sky-400 hover:bg-sky-600 !rounded-full text-white px-6 py-2.5 font-semibold shadow-md transition-colors font-inter"
                    onClick={() => {
                      router.push("/auth/signup");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
