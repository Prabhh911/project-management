import { useSelector, useDispatch } from "react-redux";
import { setTheme } from "../features/themeSlice";
import { SunIcon, MoonIcon } from "lucide-react";

const Settings = () => {
    const dispatch = useDispatch();
    const theme = useSelector((state) => state.theme?.theme || "light");
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);

    const allTasks = currentWorkspace?.projects?.flatMap((p) => p.tasks || []) || [];
    const totalProjects = currentWorkspace?.projects?.length || 0;
    const totalMembers = currentWorkspace?.members?.length || 0;
    const doneTasks = allTasks.filter((t) => t.status === "DONE").length;

    const cardClass = "rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50";
    const labelClass = "text-sm text-zinc-600 dark:text-zinc-400 mb-1 block";

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Settings</h1>
                <p className="text-gray-500 dark:text-zinc-400 text-sm">Manage your preferences</p>
            </div>

            {/* Appearance */}
            <div className={cardClass}>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-4">Appearance</h2>
                <label className={labelClass}>Theme</label>
                <div className="flex gap-3">
                    {[
                        { value: "light", label: "Light", icon: SunIcon },
                        { value: "dark",  label: "Dark",  icon: MoonIcon },
                    ].map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            onClick={() => dispatch(setTheme(value))}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
                                theme === value
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                    : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            }`}
                        >
                            <Icon className="size-4" /> {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Workspace Info */}
            {currentWorkspace && (
                <div className={cardClass}>
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-4">Workspace</h2>
                    <div className="space-y-3">
                        <div>
                            <label className={labelClass}>Workspace Name</label>
                            <p className="text-zinc-900 dark:text-white font-medium">{currentWorkspace.name}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 pt-2">
                            {[
                                { label: "Projects",   value: totalProjects },
                                { label: "Members",    value: totalMembers },
                                { label: "Tasks Done", value: doneTasks },
                            ].map(({ label, value }) => (
                                <div key={label} className="text-center p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* About */}
            <div className={cardClass}>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-4">About</h2>
                <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <p>Project Management App</p>
                    <p>Built with React, Redux, Node.js, and PostgreSQL</p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
