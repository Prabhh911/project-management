import { SearchIcon, PanelLeft, MoonIcon, SunIcon, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../features/themeSlice";
import { useEffect } from "react";

const Navbar = ({ setIsSidebarOpen }) => {

  const dispatch = useDispatch();

  // ✅ SAFE SELECTOR (prevents crash)
  const theme = useSelector((state) => state.theme?.theme || "light");

  // ✅ Handle DOM side-effect here (correct way)
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 xl:px-16 py-3 flex-shrink-0">
      <div className="flex items-center justify-between max-w-6xl mx-auto">

        {/* Left section */}
        <div className="flex items-center gap-4 min-w-0 flex-1">

          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="sm:hidden p-2 rounded-lg transition-colors text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <PanelLeft size={20} />
          </button>

          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-400 size-3.5" />
            <input
              type="text"
              placeholder="Search projects, tasks..."
              className="pl-8 pr-4 py-2 w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">

          <button
            onClick={() => dispatch(toggleTheme())}
            className="size-8 flex items-center justify-center bg-white dark:bg-zinc-800 shadow rounded-lg"
          >
            {theme === "light"
              ? <MoonIcon className="size-4" />
              : <SunIcon className="size-4 text-yellow-400" />}
          </button>

          {/* Avatar placeholder */}
          <div className="size-7 flex items-center justify-center rounded-full bg-zinc-300 dark:bg-zinc-700">
            <User size={16} />
          </div>

        </div>

      </div>
    </div>
  );
};

export default Navbar;