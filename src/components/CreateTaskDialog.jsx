import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { format } from "date-fns";
import { fetchWorkspaces } from "../features/workspaceSlice";
import api from "../api/api";

export default function CreateTaskDialog({ showCreateTask, setShowCreateTask, projectId }) {

    const dispatch = useDispatch();

    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const project = currentWorkspace?.projects?.find((p) => p.id === projectId);
    const teamMembers = project?.members || [];

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        assigneeId: "",
        due_date: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("FORM SUBMITTED"); // ✅ DEBUG

        try {
            setIsSubmitting(true);

            await api.post("/tasks", {
                project_id: projectId,
                title: formData.title,
                description: formData.description,
                status: formData.status,
                priority: formData.priority,
                assignee_id: formData.assigneeId || null,
                due_date: formData.due_date || null,
            });

            dispatch(fetchWorkspaces()); // ✅ refresh

            setShowCreateTask(false);

        } catch (err) {
            console.error("ERROR:", err.response?.data || err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!showCreateTask) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-white p-6 rounded w-[400px]">

                <h2 className="text-lg font-bold mb-4">Create Task</h2>

                <form onSubmit={handleSubmit} className="space-y-3">

                    <input
                        placeholder="Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full border p-2"
                        required
                    />

                    <textarea
                        placeholder="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full border p-2"
                    />

                    <input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        className="w-full border p-2"
                    />

                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 w-full"
                    >
                        {isSubmitting ? "Creating..." : "Create Task"}
                    </button>

                </form>
            </div>
        </div>
    );
}