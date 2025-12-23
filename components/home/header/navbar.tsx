"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X } from "lucide-react";
import Link from "next/link";

import { Suspense } from "react";

import SearchInput from "./search-input";
import ToggleMode from "./toggle-mode";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UserMenu from "@/components/logout-pop-page";
import LoginForm from "@/components/form/login-form";
import SignUpForm from "@/components/form/sign-form";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("user");
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // ---------- LOAD USER ----------
  useEffect(() => {
    const updateUser = () => {
      const authToken = localStorage.getItem("authToken");
      const name = localStorage.getItem("username");
      const role = localStorage.getItem("role");

      setIsLoggedIn(!!authToken);
      setUsername(name || "");
      setRole(role || "user");
    };
    updateUser();
    window.addEventListener("storage", updateUser);
    return () => window.removeEventListener("storage", updateUser);
  }, []);
  useEffect(() => {
    (window as any).openAuthDialog = (isLogin = true) => {
      setIsLoginForm(isLogin);
      setIsDialogOpen(true);
    };
  }, []);

  const handleOpenDialog = (isLogin: boolean) => {
    setIsLoginForm(isLogin);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  // ---------- UI ----------
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* ---------- LEFT: Logo + Desktop Nav ---------- */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Byte
              </span>
              <span className="text-foreground">Code</span>
            </Link>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/articles" className="nav-link">
                Articles
              </Link>
              <Link href="/#" className="nav-link">
                Tutorials
              </Link>
              <Link href="/#" className="nav-link">
                About
              </Link>

              {role === "admin" && (
                <Link href="/dashboard" className="nav-link">
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* ---------- RIGHT: Search + Theme + Login/Avatar ---------- */}
          <div className="flex items-center gap-4">
            {/* <Suspense fallback={null}> */}
              {/* <div className="hidden md:block"> */}
                <SearchInput />
              {/* </div> */}
            {/* </Suspense> */}
            

            <ToggleMode />

            {/* ---------- IF NOT LOGGED IN → SHOW LOGIN & SIGNUP BUTTONS ---------- */}
            {!isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => handleOpenDialog(true)}
                    >
                      Login
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <div className="flex space-x-4 mb-2">
                        <Button
                          variant={isLoginForm ? "default" : "ghost"}
                          onClick={() => setIsLoginForm(true)}
                          className="flex-1"
                        >
                          Login
                        </Button>
                        <Button
                          variant={!isLoginForm ? "default" : "ghost"}
                          onClick={() => setIsLoginForm(false)}
                          className="flex-1"
                        >
                          Sign Up
                        </Button>
                      </div>
                    </DialogHeader>

                    {isLoginForm ? (
                      <LoginForm
                        onSuccess={() => {
                          handleCloseDialog();
                          // Refresh the page or update UI
                          window.location.reload();
                        }}
                        switchToSignup={() => setIsLoginForm(false)}
                      />
                    ) : (
                      <SignUpForm
                        onSuccess={() => {
                          // After signup, switch to login form
                          setIsLoginForm(true);
                          // Show success message
                          alert("Account created! Please login.");
                        }}
                        switchToLogin={() => setIsLoginForm(true)}
                      />
                    )}
                  </DialogContent>
                </Dialog>

                <Button onClick={() => handleOpenDialog(false)}>Sign Up</Button>
              </div>
            ) : (
              /* ---------- IF LOGGED IN → SHOW AVATAR MENU ---------- */
              <UserMenu username={username} />
            )}

            {/* ---------- MOBILE MENU BUTTON ---------- */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* ---------- MOBILE MENU ---------- */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t">
            <div className="px-4">
              <div className="relative">
                
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  type="search"
                  placeholder="Search articles..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2 px-4 flex flex-col">
              <Link href="/articles" className="mobile-link">
                Articles
              </Link>
              <Link href="/tutorials" className="mobile-link">
                Tutorials
              </Link>
              <Link href="/about" className="mobile-link">
                About
              </Link>

              {role === "admin" && (
                <Link href="/dashboard" className="mobile-link">
                  Dashboard
                </Link>
              )}
            </div>

            {!isLoggedIn && (
              <div className="px-4 flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleOpenDialog(true);
                  }}
                >
                  Login
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleOpenDialog(false);
                  }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
