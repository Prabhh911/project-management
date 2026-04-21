import { useEffect, useState } from 'react';
import { CheckSquareIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function MyTasksSidebar() {

    const { currentWorkspace } = useSelector((state) => state.workspace);
    const [showMyTasks, setShowMyTasks] = useState(false);
    const [myTasks, setMyTasks] = useState([]);

    const getTaskStatusColor = (status) => {
        switch (status) {
            case 'DONE':        return 'bg-green-500';
            case 'IN_PROGRESS': return 'bg-yellow-500';
            case 'TODO':        return 'bg-zinc-400 dark:bg-zinc-500';
            default:            return 'bg-zinc-400';
        }
    };

    useEffect(() => {
        if (!currentWorkspace) return;

        // FIX: was filtering by task.assignee.id === 'user_1' (hardcoded fake ID)
        // Since there's no auth system yet, show all tasks across all projects
        // Also fix: was using task.projectId but the real field is task.project_id
        const allTasks = currentWorkspace.projects.flatMap((project) =>
            (project.tasks || []).map((task) => ({
                ...task,
                // Attach project_id explicitly so the link works
                project_id: task.project_id || String(project.id),
            }))
        );

        setMyTasks(allTasks);
    }, [currentWorkspace]);

    return (
        <div className="mt-2 px-3">
            <div
                onClick={() => setShowMyTasks((prev) => !prev)}
                className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
                <div className="flex items-center gap-2">
                    <CheckSquareIcon className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                    <h3 className="text-sm font-medium text-gray-700 dark:text-zinc-300">My Tasks</h3>
                    <span className="bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 text-xs px-2 py-0.5 rounded">
                        {myTasks.length}
                    </span>
                </div>
                {showMyTasks
                    ? <ChevronDownIcon className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                    : <ChevronRightIcon className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                }
            </div>

            {showMyTasks && (
                <div className="mt-1 pl-2 space-y-1">
                    {myTasks.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-gray-500 dark:text-zinc-500 text-center">
                            No tasks yet
                        </div>
                    ) : (
                        myTasks.map((task) => (
                            // FIX: was task.projectId — correct field is task.project_id
                            <Link
                                key={task.id}
                                to={`/taskDetails?projectId=${task.project_id}&taskId=${task.id}`}
                                className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-all"
                            >
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getTaskStatusColor(task.status)}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{task.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-zinc-500 lowercase">
                                        {/* FIX: task.status can be null */}
                                        {(task.status || 'todo').replace('_', ' ')}
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default MyTasksSidebar;
