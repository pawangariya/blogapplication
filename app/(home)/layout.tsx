import Navbar from "@/components/home/header/navbar";
import { redirect } from "next/navigation";

const layout = async ({ children }: { children: React.ReactNode }) => {
  
  return (
    <div>
<<<<<<< HEAD
      <Navbar/> 
=======
>>>>>>> 51901464039b036a143ec0f24216172eb7779e55
      {children}
    </div>
  );
};

export default layout;
