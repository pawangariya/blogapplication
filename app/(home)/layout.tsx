import Navbar from "@/components/home/header/navbar";
import { redirect } from "next/navigation";

const layout = async ({ children }: { children: React.ReactNode }) => {
  
  return (
    <div>
      {children}
    </div>
  );
};

export default layout;
