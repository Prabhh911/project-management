import { useState } from "react";
import { X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { fetchWorkspaces } from "../features/workspaceSlice";
import api from "../api/api";
import toast from "react-hot-toast";

export default function CreateTaskDialog({ showCreateTask, setShowCreateTask, projectId }) {

    const dispatch = useDispatch();
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);

    // FIX: use String() comparison so IDs match regardless of type
    const project = currentWorkspace?.projects?.find((p) => String(p.id) === String(projectId));
    const teamMembers = project?.members || [];

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        type: "TASK",
        assigneeId: "",
        due_date: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading("Creating task...");
        try {
            setIsSubmitting(true);
            await api.post("/tasks", {
                project_id:  projectId,
                title:       formData.title,
                description: formData.description,
                status:      formData.status,
                priority:    formData.priority,
                type:        formData.type,
                assignee_id: formData.assigneeId || null,
                due_date:    formData.due_date || null,
            });
            dispatch(fetchWorkspaces());
            toast.success("Task created", { id: toastId });
            setShowCreateTask(false);
            // Reset form
            setFormData({ title: "", description: "", status: "TODO", priority: "MEDIUM", type: "TASK", assigneeId: "", due_date: "" });
        } catch (err) {
            console.error(err);
            toast.error("Failed to create task", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!showCreateTask) return null;

    const inputClass = "w-full border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded px-3 py-2 text-sm outline-none focus:border-blue-500";
    const labelClass = "text-sm text-zinc-600 dark:text-zinc-400 mb-1 block";

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg w-full max-w-md p-6 shadow-lg">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">New Task</h2>
                    <button onClick={() => setShowCreateTask(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white">
                        <X className="size-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClass}>Title *</label>
                        <input
                            placeholder="Task title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className={inputClass}
                            required
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Description</label>
                        <textarea
                            placeholder="Optional description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className={inputClass + " h-20 resize-none"}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClass}>
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={inputClass}>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            {/* FIX: type field was missing from the old dialog */}
                            <label className={labelClass}>Type</label>
                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className={inputClass}>
                                <option value="TASK">Task</option>
                                <option value="BUG">Bug</option>
                                <option value="FEATURE">Feature</option>
                                <option value="IMPROVEMENT">Improvement</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Due Date</label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Assignee — only shows if project has members */}
                    {teamMembers.length > 0 && (
                        <div>
                            <label className={labelClass}>Assignee</label>
                            <select value={formData.assigneeId} onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })} className={inputClass}>
                                <option value="">Unassigned</option>
                                {teamMembers.map((m) => (
                                    <option key={m.user.id} value={m.user.id}>
                                        {m.user.name} ({m.user.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                        <button type="button" onClick={() => setShowCreateTask(false)} className="px-4 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:opacity-90 disabled:opacity-50">
                            {isSubmitting ? "Creating..." : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
