import { useEffect, useState } from "react";
import { UsersIcon, Search, UserPlus, Shield, Activity, User } from "lucide-react";
import InviteMemberDialog from "../components/InviteMemberDialog";
import { useSelector } from "react-redux";

const Team = () => {

    const [tasks, setTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [users, setUsers] = useState([]);

    const currentWorkspace = useSelector((state) => state?.workspace?.currentWorkspace || null);
    const projects = currentWorkspace?.projects || [];

    const filteredUsers = users.filter(
        (user) =>
            user?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        setUsers(currentWorkspace?.members || []);
        setTasks(
            currentWorkspace?.projects?.reduce(
                (acc, project) => [...acc, ...(project.tasks || [])],
                []
            ) || []
        );
    }, [currentWorkspace]);

    return (
        <div className="space-y-6 max-w-6xl mx-auto">

            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                        Team
                    </h1>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm">
                        Manage team members and their contributions
                    </p>
                </div>

                <button
                    onClick={() => setIsDialogOpen(true)}
                    className="flex items-center px-5 py-2 rounded text-sm bg-gradient-to-br from-blue-500 to-blue-600 hover:opacity-90 text-white transition"
                >
                    <UserPlus className="w-4 h-4 mr-2" /> Invite Member
                </button>

                <InviteMemberDialog
                    isDialogOpen={isDialogOpen}
                    setIsDialogOpen={setIsDialogOpen}
                />
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4">

                <div className="max-sm:w-full border border-gray-300 dark:border-zinc-800 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">
                                Total Members
                            </p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {users.length}
                            </p>
                        </div>
                        <UsersIcon className="size-5 text-blue-500" />
                    </div>
                </div>

                <div className="max-sm:w-full border border-gray-300 dark:border-zinc-800 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">
                                Active Projects
                            </p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {
                                    projects.filter(
                                        (p) =>
                                            p.status !== "CANCELLED" &&
                                            p.status !== "COMPLETED"
                                    ).length
                                }
                            </p>
                        </div>
                        <Activity className="size-5 text-emerald-500" />
                    </div>
                </div>

                <div className="max-sm:w-full border border-gray-300 dark:border-zinc-800 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">
                                Total Tasks
                            </p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {tasks.length}
                            </p>
                        </div>
                        <Shield className="size-5 text-purple-500" />
                    </div>
                </div>

            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
                <input
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full text-sm rounded-md border border-gray-300 dark:border-zinc-800 py-2 px-3"
                />
            </div>

            {/* Members */}
            <div className="w-full">

                {filteredUsers.length === 0 ? (

                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                            <UsersIcon className="w-12 h-12 text-gray-400" />
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {users.length === 0
                                ? "No team members yet"
                                : "No members match your search"}
                        </h3>

                        <p className="text-gray-500 dark:text-zinc-400 mb-6">
                            {users.length === 0
                                ? "Invite team members to start collaborating"
                                : "Try adjusting your search"}
                        </p>
                    </div>

                ) : (

                    <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-zinc-800">

                        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">

                            <thead className="bg-gray-50 dark:bg-zinc-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium">
                                        Role
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">

                                {filteredUsers.map((user) => (

                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">

                                        <td className="px-6 py-3 flex items-center gap-3">

                                            {/* Avatar replaced with icon */}
                                            <div className="size-8 rounded-full bg-gray-300 flex items-center justify-center">
                                                <User size={14} />
                                            </div>

                                            <span className="text-sm">
                                                {user.user?.name || "Unknown User"}
                                            </span>

                                        </td>

                                        <td className="px-6 py-3 text-sm text-gray-500">
                                            {user.user?.email}
                                        </td>

                                        <td className="px-6 py-3">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-md ${
                                                    user.role === "ADMIN"
                                                        ? "bg-purple-100 text-purple-600"
                                                        : "bg-gray-200 text-gray-700"
                                                }`}
                                            >
                                                {user.role || "User"}
                                            </span>
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
};

export default Team;