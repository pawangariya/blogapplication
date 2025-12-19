import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import BlogDashboard from "@/components/dashboard/blog-dashboard";

const Dashboard = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  if (!token) redirect("/");

  let decoded: { id: string };

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
  } catch {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user || user.role !== "admin") redirect("/");

  return <BlogDashboard />;
};

export default Dashboard;
