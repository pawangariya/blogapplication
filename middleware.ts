import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  
  const token = req.cookies.get("authToken")?.value;
  const secret = process.env.NEXT_PUBLIC_JWT_SECRET!; 

  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const decoded: any = jwt.verify(token, secret);

      if (decoded.role !== "admin") {
        return NextResponse.redirect(new URL("/not-authorized", req.url));
      }

    } catch (error) {
      console.log("err", error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
