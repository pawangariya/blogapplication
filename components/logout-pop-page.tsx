"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Menu } from "lucide-react";

export default function UserMenu({ username }: { username: string }) {
  const [open, setOpen] = useState(false);

  const handleLogout = async() => {
    await fetch("/api/auth/logout");
  window.location.href = "/login";
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    window.dispatchEvent(new Event("storage")); 
    window.location.reload();
  };

  return (
    <div className="relative">
      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 border rounded-full px-3 py-1 hover:shadow transition"
      >
       

        <Avatar className="h-8 w-8">
          <AvatarImage src="/default-avatar.png" />
          <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white border z-50">
          <div className="p-3 border-b">
            <p className="font-medium text-sm">Hello, {username}</p>
          </div>

          <div className="flex flex-col">
            <a
              href="/#"
              className="px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100"
            >
              <User size={16} /> Profile
            </a>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm flex items-center gap-2 text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
