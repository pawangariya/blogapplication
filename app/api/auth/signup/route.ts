import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  // 1️⃣ Validate input
  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 400 }
    );
  }

  // 2️⃣ Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json(
      { message: "User already exists" },
      { status: 400 }
    );
  }

  // 3️⃣ Hash USER password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4️⃣ Create user
  const newUser = await prisma.user.create({
    data: {
      username:name,
      email,
      password: hashedPassword,
      role: "user",
    },
  });

  // 5️⃣ Generate JWT
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  // 6️⃣ Response + cookie
  const response = NextResponse.json(
    {
      message: "Signup successful",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    },
    { status: 201 }
  );

  response.cookies.set("authToken", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });

  return response;
}
