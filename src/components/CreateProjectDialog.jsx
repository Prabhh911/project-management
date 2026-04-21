import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWorkspaces } from "../features/workspaceSlice";
import api from "../api/api";

// FIX: props renamed from {show, setShow} to {isDialogOpen, setIsDialogOpen}
// to match how every caller passes them
export default function CreateProjectDialog({ isDialogOpen, setIsDialogOpen }) {

    const dispatch = useDispatch();
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace);

    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await api.post("/projects", {
                workspace_id: currentWorkspace.id,
                name,
            });
            dispatch(fetchWorkspaces());
            setIsDialogOpen(false);
            setName("");
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">New Project</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Project Name"
                        required
                        className="w-full border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsDialogOpen(false)} className="px-4 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:opacity-90 text-white px-4 py-2 text-sm rounded disabled:opacity-50">
                            {isSubmitting ? "Creating..." : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
