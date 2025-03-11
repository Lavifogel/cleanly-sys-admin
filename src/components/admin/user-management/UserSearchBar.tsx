
import { Input } from "@/components/ui/input";

interface UserSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const UserSearchBar = ({ searchQuery, setSearchQuery }: UserSearchBarProps) => {
  return (
    <div className="relative w-full md:w-[250px]">
      <Input 
        placeholder="Search users..." 
        className="pl-8"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 absolute left-2.5 top-3 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
};

export default UserSearchBar;
