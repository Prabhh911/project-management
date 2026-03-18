import { format } from "date-fns";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarIcon, MessageCircle, PenIcon, User } from "lucide-react";

const TaskDetails = () => {

    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");

    const user = { id: "user_1" };

    const [task, setTask] = useState(null);
    const [project, setProject] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

    const { currentWorkspace } = useSelector((state) => state.workspace);

    const fetchTaskDetails = async () => {
        setLoading(true);

        if (!projectId || !taskId) return;

        const proj = currentWorkspace.projects.find((p) => p.id === projectId);
        if (!proj) return;

        const tsk = proj.tasks.find((t) => t.id === taskId);
        if (!tsk) return;

        setTask(tsk);
        setProject(proj);
        setLoading(false);
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {

            toast.loading("Adding comment...");

            await new Promise((resolve) => setTimeout(resolve, 1000));

            const dummyComment = {
                id: Date.now(),
                user: { id: 1, name: "User" },
                content: newComment,
                createdAt: new Date(),
            };

            setComments((prev) => [...prev, dummyComment]);
            setNewComment("");

            toast.dismissAll();
            toast.success("Comment added.");

        } catch (error) {
            toast.dismissAll();
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchTaskDetails();
    }, [taskId]);

    if (loading) return <div className="p-6">Loading task details...</div>;
    if (!task) return <div className="p-6 text-red-500">Task not found</div>;

    return (
        <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">

            {/* Comments */}
            <div className="w-full lg:w-2/3 border p-5 rounded">

                <h2 className="flex items-center gap-2 font-semibold mb-4">
                    <MessageCircle size={18} /> Discussion
                </h2>

                {comments.map((comment) => (
                    <div key={comment.id} className="border p-3 rounded mb-3">

                        <div className="flex items-center gap-2 mb-2">

                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                                <User size={12} />
                            </div>

                            <span className="text-sm font-medium">
                                {comment.user.name}
                            </span>

                            <span className="text-xs text-gray-400">
                                {format(new Date(comment.createdAt), "dd MMM yyyy")}
                            </span>

                        </div>

                        <p className="text-sm">{comment.content}</p>

                    </div>
                ))}

                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full border rounded p-2 mt-3"
                    placeholder="Write a comment..."
                />

                <button
                    onClick={handleAddComment}
                    className="mt-3 bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Post
                </button>

            </div>

            {/* Task Info */}
            <div className="w-full lg:w-1/2 border p-5 rounded">

                <h1 className="text-lg font-semibold mb-3">{task.title}</h1>

                <p className="text-sm mb-4">{task.description}</p>

                <div className="flex items-center gap-2 text-sm">
                    <User size={14} />
                    {task.assignee?.name || "Unassigned"}
                </div>

                <div className="flex items-center gap-2 mt-2 text-sm">
                    <CalendarIcon size={14} />
                    {format(new Date(task.due_date), "dd MMM yyyy")}
                </div>

                {project && (
                    <div className="mt-5 border-t pt-4">
                        <p className="font-medium flex items-center gap-2">
                            <PenIcon size={14} /> {project.name}
                        </p>
                    </div>
                )}

            </div>

        </div>
    );
};

export default TaskDetails;