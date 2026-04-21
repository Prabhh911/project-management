import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWorkspaces } from "../features/workspaceSlice";
import { X, UserPlus } from "lucide-react";
import api from "../api/api";
import toast from "react-hot-toast";

export default function InviteMemberDialog({ isDialogOpen, setIsDialogOpen }) {

    const dispatch = useDispatch();
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace);

    const [userId, setUserId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId.trim()) return;
        const toastId = toast.loading("Adding member...");
        try {
            setIsSubmitting(true);
            await api.post("/workspaces/members", {
                workspace_id: currentWorkspace.id,
                user_id: Number(userId),
                role: "member",
            });
            dispatch(fetchWorkspaces());
            toast.success("Member added to workspace", { id: toastId });
            setIsDialogOpen(false);
            setUserId("");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to add member", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6 w-full max-w-md shadow-lg">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                        <UserPlus className="size-5" /> Invite Member
                    </h2>
                    <button onClick={() => setIsDialogOpen(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white">
                        <X className="size-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-zinc-600 dark:text-zinc-400 mb-1 block">
                            User ID
                        </label>
                        <input
                            placeholder="Enter user ID"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            required
                            className="w-full border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                            The user must already exist in the system.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => { setIsDialogOpen(false); setUserId(""); }}
                            className="px-4 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm rounded bg-blue-500 hover:opacity-90 text-white disabled:opacity-50"
                        >
                            {isSubmitting ? "Adding..." : "Add Member"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
