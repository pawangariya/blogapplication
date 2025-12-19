import { NextResponse } from "next/server";

export async function GET() {
  
  const res = NextResponse.json({ message: "Logged out" });

  // Remove the cookie
  res.cookies.set("authToken", "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    expires: new Date(0) // Immediately expire cookie
  });

  

  return res;
}
