import { useState } from "react";
import { Mail, UserPlus } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchWorkspaces } from "../features/workspaceSlice";
import api from "../api/api";
import toast from "react-hot-toast";

const AddProjectMember = ({ isDialogOpen, setIsDialogOpen }) => {

    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const dispatch = useDispatch();

    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);

    // FIX: use String() comparison so numeric vs string IDs both match
    const project = currentWorkspace?.projects.find((p) => String(p.id) === String(id));
    const projectMembersEmails = project?.members?.map((m) => m.user.email) || [];

    const [email, setEmail] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // FIX: was empty — now actually calls the backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        const member = currentWorkspace.members.find((m) => m.user.email === email);
        if (!member) return toast.error("Member not found");

        const toastId = toast.loading("Adding member...");
        try {
            setIsAdding(true);
            await api.post("/projects/members", {
                project_id: project.id,
                user_id: member.user.id,
                role: "member",
            });
            dispatch(fetchWorkspaces());
            toast.success("Member added", { id: toastId });
            setEmail('');
            setIsDialogOpen(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to add member", { id: toastId });
        } finally {
            setIsAdding(false);
        }
    };

    if (!isDialogOpen) return null;

    // Guard: project not found yet
    if (!project) return null;

    const availableMembers = currentWorkspace?.members.filter(
        (m) => !projectMembersEmails.includes(m.user.email)
    ) || [];

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200">
                <div className="mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <UserPlus className="size-5" /> Add Member to Project
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Adding to: <span className="text-blue-500">{project.name}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                            <select
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-sm py-2 focus:outline-none focus:border-blue-500"
                                required
                            >
                                <option value="">Select a workspace member</option>
                                {availableMembers.map((m) => (
                                    <option key={m.user.id} value={m.user.email}>
                                        {m.user.name} ({m.user.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                        {availableMembers.length === 0 && (
                            <p className="text-xs text-zinc-400 dark:text-zinc-500">
                                All workspace members are already in this project.
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => { setIsDialogOpen(false); setEmail(''); }}
                            className="px-5 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isAdding || !email || availableMembers.length === 0}
                            className="px-5 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 hover:opacity-90 text-white disabled:opacity-50 transition"
                        >
                            {isAdding ? "Adding..." : "Add Member"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProjectMember;
