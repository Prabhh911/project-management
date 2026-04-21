import { FolderOpen, CheckCircle, Users, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function StatsGrid() {
    const currentWorkspace = useSelector(
        (state) => state?.workspace?.currentWorkspace || null
    );

    const [stats, setStats] = useState({
        totalProjects: 0,
        activeProjects: 0,
        completedTasks: 0,
        myTasks: 0,
        overdueIssues: 0,
    });

    const statCards = [
        {
            icon: FolderOpen,
            title: "Total Projects",
            value: stats.totalProjects,
            subtitle: `projects in ${currentWorkspace?.name || "workspace"}`,
            bgColor: "bg-blue-500/10",
            textColor: "text-blue-500",
        },
        {
            icon: CheckCircle,
            title: "Completed Tasks",
            value: stats.completedTasks,
            subtitle: "tasks marked done",
            bgColor: "bg-emerald-500/10",
            textColor: "text-emerald-500",
        },
        {
            icon: Users,
            title: "Team Members",
            value: stats.myTasks,
            subtitle: "in this workspace",
            bgColor: "bg-purple-500/10",
            textColor: "text-purple-500",
        },
        {
            icon: AlertTriangle,
            title: "Overdue",
            value: stats.overdueIssues,
            subtitle: "need attention",
            bgColor: "bg-amber-500/10",
            textColor: "text-amber-500",
        },
    ];

    useEffect(() => {
        if (!currentWorkspace) return;

        const allTasks = currentWorkspace.projects.flatMap((p) => p.tasks || []);
        const now = new Date();

        setStats({
            totalProjects: currentWorkspace.projects.length,

            activeProjects: currentWorkspace.projects.filter(
                (p) => p.status !== "CANCELLED" && p.status !== "COMPLETED"
            ).length,

            // FIX: was counting tasks of completed projects (wrong), now counts DONE tasks
            completedTasks: allTasks.filter((t) => t.status === "DONE").length,

            // FIX: was crashing on currentWorkspace.owner.email when owner is null
            // Now just shows total workspace members count
            myTasks: currentWorkspace.members?.length || 0,

            // FIX: was comparing string date < Date object — now both are Date objects
            overdueIssues: allTasks.filter(
                (t) => t.due_date && new Date(t.due_date) < now && t.status !== "DONE"
            ).length,
        });
    }, [currentWorkspace]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-9">
            {statCards.map(
                ({ icon: Icon, title, value, subtitle, bgColor, textColor }, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-200 rounded-md">
                        <div className="p-6 py-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{title}</p>
                                    <p className="text-3xl font-bold text-zinc-800 dark:text-white">{value}</p>
                                    {subtitle && (
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{subtitle}</p>
                                    )}
                                </div>
                                <div className={`p-3 rounded-xl ${bgColor} bg-opacity-20`}>
                                    <Icon size={20} className={textColor} />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
