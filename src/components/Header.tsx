import Input from "@/components/ui/input";
import { Search } from "lucide-react";
import Profile from "./Profile";

const Header = () => {
  return (
    <header className="flex items-center justify-between gap-3 p-3">
      <div className="relative w-full">
        <Input
          type="text"
          placeholder="Search"
          className="max-w-72 rounded-full border-none bg-border py-4 pl-[50px]"
        />
        <div className="absolute left-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-primary p-2">
          <Search className="h-5 w-5 stroke-white" />
        </div>
      </div>
      {/* Profile */}
      <Profile />
    </header>
  );
};

export default Header;

//bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white
