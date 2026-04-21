import { SearchIcon, PanelLeft, MoonIcon, SunIcon, User, X, Mail, Shield, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../features/themeSlice";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ setIsSidebarOpen }) => {
    const dispatch  = useDispatch();
    const navigate  = useNavigate();
    const theme     = useSelector((state) => state.theme?.theme || "light");
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);

    const [searchTerm, setSearchTerm]       = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults]     = useState(false);
    const [showProfile, setShowProfile]     = useState(false);

    const searchRef  = useRef(null);
    const profileRef = useRef(null);

    // Apply theme to document
    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current  && !searchRef.current.contains(e.target))  setShowResults(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Live search across projects and tasks
    useEffect(() => {
        if (!searchTerm.trim() || !currentWorkspace) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const term = searchTerm.toLowerCase();
        const results = [];

        currentWorkspace.projects.forEach((project) => {
            // Match projects
            if (project.name?.toLowerCase().includes(term) || project.description?.toLowerCase().includes(term)) {
                results.push({
                    type:    "project",
                    id:      project.id,
                    title:   project.name,
                    subtitle: project.status?.replace("_", " ") || "No status",
                    url:     `/projectsDetail?id=${project.id}&tab=tasks`,
                });
            }
            // Match tasks inside this project
            project.tasks?.forEach((task) => {
                if (task.title?.toLowerCase().includes(term) || task.description?.toLowerCase().includes(term)) {
                    results.push({
                        type:     "task",
                        id:       task.id,
                        title:    task.title,
                        subtitle: `${project.name} · ${task.status?.replace("_", " ") || ""}`,
                        url:      `/taskDetails?projectId=${project.id}&taskId=${task.id}`,
                    });
                }
            });
        });

        setSearchResults(results.slice(0, 8));
        setShowResults(true);
    }, [searchTerm, currentWorkspace]);

    const handleResultClick = (url) => {
        navigate(url);
        setSearchTerm("");
        setShowResults(false);
    };

    // Pull user info from workspace owner
    const owner = currentWorkspace?.owner;
    const userName  = owner?.name  || "User";
    const userEmail = owner?.email || "No email";
    const userRole  = currentWorkspace?.members?.find(
        (m) => m.user?.id === owner?.id
    )?.role || "Member";

    return (
        <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 xl:px-16 py-3 flex-shrink-0">
            <div className="flex items-center justify-between max-w-6xl mx-auto">

                {/* Left */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    <button
                        onClick={() => setIsSidebarOpen((prev) => !prev)}
                        className="sm:hidden p-2 rounded-lg text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
                    >
                        <PanelLeft size={20} />
                    </button>

                    {/* Search */}
                    <div className="relative flex-1 max-w-sm" ref={searchRef}>
                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-400 size-3.5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => searchResults.length > 0 && setShowResults(true)}
                            placeholder="Search projects, tasks..."
                            className="pl-8 pr-8 py-2 w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => { setSearchTerm(""); setShowResults(false); }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}

                        {/* Search results dropdown */}
                        {showResults && (
                            <div className="absolute top-full mt-1 left-0 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50 overflow-hidden">
                                {searchResults.length === 0 ? (
                                    <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-4">
                                        No results for "{searchTerm}"
                                    </p>
                                ) : (
                                    <div>
                                        {searchResults.map((result, i) => (
                                            <div
                                                key={`${result.type}-${result.id}-${i}`}
                                                onClick={() => handleResultClick(result.url)}
                                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                                            >
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase shrink-0 ${
                                                    result.type === "project"
                                                        ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                                                        : "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                                                }`}>
                                                    {result.type}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm text-zinc-900 dark:text-white truncate">{result.title}</p>
                                                    <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate capitalize">{result.subtitle}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => dispatch(toggleTheme())}
                        className="size-8 flex items-center justify-center bg-white dark:bg-zinc-800 shadow rounded-lg"
                    >
                        {theme === "light"
                            ? <MoonIcon className="size-4" />
                            : <SunIcon className="size-4 text-yellow-400" />}
                    </button>

                    {/* Profile */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setShowProfile((prev) => !prev)}
                            className="size-8 flex items-center justify-center rounded-full bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition"
                            title={userName}
                        >
                            {userName?.[0]?.toUpperCase() || "U"}
                        </button>

                        {showProfile && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50 overflow-hidden">
                                {/* User info */}
                                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-base shrink-0">
                                            {userName?.[0]?.toUpperCase() || "U"}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{userName}</p>
                                            <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{userEmail}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="p-3 space-y-2 border-b border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                        <Mail className="size-3.5 shrink-0" />
                                        <span className="truncate">{userEmail}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                        <Shield className="size-3.5 shrink-0" />
                                        <span className="capitalize">{userRole}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                        <User className="size-3.5 shrink-0" />
                                        <span className="truncate">{currentWorkspace?.name || "No workspace"}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="p-2">
                                    <button
                                        onClick={() => { navigate("/settings"); setShowProfile(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-md transition"
                                    >
                                        <User className="size-4" /> View Settings
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Navbar;
