import { format } from "date-fns";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CalendarIcon, MessageCircle, PenIcon, User, ArrowLeftIcon, Clock, Flag } from "lucide-react";

const statusColors = {
    TODO:        "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200",
    IN_PROGRESS: "bg-amber-200 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400",
    DONE:        "bg-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400",
};

const priorityColors = {
    LOW:    "text-zinc-500",
    MEDIUM: "text-blue-500",
    HIGH:   "text-emerald-500",
};

const TaskDetails = () => {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const projectId = searchParams.get("projectId");
    const taskId    = searchParams.get("taskId");

    const [task, setTask]           = useState(null);
    const [project, setProject]     = useState(null);
    const [comments, setComments]   = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading]     = useState(true);

    const { currentWorkspace } = useSelector((state) => state.workspace);

    useEffect(() => {
        if (!projectId || !taskId || !currentWorkspace) return;

        // FIX: String() comparison so numeric vs string IDs both match
        const proj = currentWorkspace.projects.find((p) => String(p.id) === String(projectId));
        if (!proj) { setLoading(false); return; }

        const tsk = proj.tasks.find((t) => String(t.id) === String(taskId));
        if (!tsk) { setLoading(false); return; }

        setTask(tsk);
        setProject(proj);
        setLoading(false);
    }, [taskId, projectId, currentWorkspace]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        const toastId = toast.loading("Adding comment...");
        try {
            // Comments are local-only for now (no comments table in schema)
            const comment = {
                id: Date.now(),
                user: { id: 1, name: "You" },
                content: newComment,
                createdAt: new Date(),
            };
            setComments((prev) => [...prev, comment]);
            setNewComment("");
            toast.success("Comment added", { id: toastId });
        } catch (err) {
            toast.error(err.message, { id: toastId });
        }
    };

    // FIX: safe date format — doesn't crash on null due_date
    const safeFormat = (val, fmt) => {
        if (!val) return "No due date";
        const d = new Date(val);
        return isNaN(d.getTime()) ? "Invalid date" : format(d, fmt);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96 text-zinc-500 dark:text-zinc-400">
            Loading task...
        </div>
    );

    if (!task) return (
        <div className="p-6 text-center">
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-4">Task not found</p>
            <button onClick={() => navigate(-1)} className="px-4 py-2 text-sm rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-white hover:opacity-80">
                Go Back
            </button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-4">
            {/* Back button */}
            <button
                onClick={() => navigate(`/projectsDetail?id=${projectId}&tab=tasks`)}
                className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition"
            >
                <ArrowLeftIcon className="size-4" /> Back to Project
            </button>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Discussion */}
                <div className="w-full lg:w-2/3 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 bg-white dark:bg-zinc-900">
                    <h2 className="flex items-center gap-2 font-semibold mb-4 text-zinc-800 dark:text-white">
                        <MessageCircle size={18} /> Discussion
                    </h2>

                    {comments.length === 0 && (
                        <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-6">
                            No comments yet. Start the discussion!
                        </p>
                    )}

                    {comments.map((comment) => (
                        <div key={comment.id} className="border border-zinc-200 dark:border-zinc-700 p-3 rounded-lg mb-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                    {comment.user.name[0]}
                                </div>
                                <span className="text-sm font-medium text-zinc-800 dark:text-white">{comment.user.name}</span>
                                <span className="text-xs text-zinc-400">
                                    {format(new Date(comment.createdAt), "dd MMM yyyy")}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300">{comment.content}</p>
                        </div>
                    ))}

                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleAddComment(); }}
                        className="w-full border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg p-3 mt-3 text-sm outline-none focus:border-blue-500 resize-none h-24"
                        placeholder="Write a comment... (Ctrl+Enter to post)"
                    />
                    <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="mt-2 bg-blue-500 hover:opacity-90 disabled:opacity-40 text-white px-4 py-2 rounded text-sm"
                    >
                        Post Comment
                    </button>
                </div>

                {/* Task Info */}
                <div className="w-full lg:w-1/3 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 bg-white dark:bg-zinc-900 space-y-4">
                    <div>
                        <h1 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">{task.title}</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{task.description || "No description"}</p>
                    </div>

                    {/* Status badge */}
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColors[task.status] || statusColors["TODO"]}`}>
                        {(task.status || "TODO").replace("_", " ")}
                    </span>

                    <div className="space-y-3 text-sm border-t border-zinc-200 dark:border-zinc-700 pt-4">
                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                            <User size={14} />
                            <span>{task.assignee?.name || "Unassigned"}</span>
                        </div>

                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                            <CalendarIcon size={14} />
                            {/* FIX: was crashing when due_date is null */}
                            <span>{safeFormat(task.due_date, "dd MMM yyyy")}</span>
                        </div>

                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                            <Flag size={14} className={priorityColors[task.priority] || ""} />
                            <span className="capitalize">{(task.priority || "medium").toLowerCase()} priority</span>
                        </div>

                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                            <Clock size={14} />
                            <span className="capitalize">{(task.type || "task").toLowerCase()}</span>
                        </div>
                    </div>

                    {project && (
                        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
                            <button
                                onClick={() => navigate(`/projectsDetail?id=${projectId}&tab=tasks`)}
                                className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
                            >
                                <PenIcon size={14} /> {project.name}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;
