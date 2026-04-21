import { useState } from "react";
import { format, isSameDay, isBefore, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, startOfWeek } from "date-fns";
import { CalendarIcon, Clock, User, ChevronLeft, ChevronRight } from "lucide-react";

const typeColors = {
    BUG:         "bg-red-200 text-red-800 dark:bg-red-500/20 dark:text-red-400",
    FEATURE:     "bg-blue-200 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400",
    TASK:        "bg-green-200 text-green-800 dark:bg-green-500/20 dark:text-green-400",
    IMPROVEMENT: "bg-purple-200 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400",
    OTHER:       "bg-amber-200 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400",
};

const priorityBorders = {
    LOW:    "border-zinc-300 dark:border-zinc-600",
    MEDIUM: "border-amber-300 dark:border-amber-500",
    HIGH:   "border-orange-400 dark:border-orange-500",
};

const ProjectCalendar = ({ tasks }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const today = new Date();

    // FIX: wrap in try/catch — isSameDay crashes if due_date is null/invalid
    const getTasksForDate = (date) =>
        tasks.filter((task) => {
            if (!task.due_date) return false;
            try { return isSameDay(new Date(task.due_date), date); }
            catch { return false; }
        });

    const upcomingTasks = tasks
        .filter((task) => {
            if (!task.due_date) return false;
            try { return !isBefore(new Date(task.due_date), today) && task.status !== "DONE"; }
            catch { return false; }
        })
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, 5);

    const overdueTasks = tasks.filter((task) => {
        if (!task.due_date) return false;
        try { return isBefore(new Date(task.due_date), today) && task.status !== "DONE"; }
        catch { return false; }
    });

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end:   endOfMonth(currentMonth),
    });

    // Pad days so the grid starts on Sunday
    const firstDayOfWeek = startOfWeek(startOfMonth(currentMonth)).getDay();
    const paddingDays = Array(firstDayOfWeek).fill(null);

    const handleMonthChange = (dir) =>
        setCurrentMonth((prev) => dir === "next" ? addMonths(prev, 1) : subMonths(prev, 1));

    const selectedDayTasks = getTasksForDate(selectedDate);

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2 space-y-6">
                <div className="dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-zinc-900 dark:text-white flex gap-2 items-center font-medium">
                            <CalendarIcon className="size-4" /> Task Calendar
                        </h2>
                        <div className="flex gap-2 items-center">
                            <button onClick={() => handleMonthChange("prev")} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700">
                                <ChevronLeft className="size-4 text-zinc-600 dark:text-zinc-400" />
                            </button>
                            <span className="text-zinc-900 dark:text-white text-sm font-medium min-w-32 text-center">
                                {format(currentMonth, "MMMM yyyy")}
                            </span>
                            <button onClick={() => handleMonthChange("next")} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700">
                                <ChevronRight className="size-4 text-zinc-600 dark:text-zinc-400" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 text-xs text-zinc-500 dark:text-zinc-400 mb-2 text-center">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                            <div key={d} className="py-1">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {/* FIX: padding cells so month starts on correct weekday */}
                        {paddingDays.map((_, i) => <div key={`pad-${i}`} />)}
                        {daysInMonth.map((day) => {
                            const dayTasks  = getTasksForDate(day);
                            const isSelected = isSameDay(day, selectedDate);
                            const isToday    = isSameDay(day, today);
                            const hasOverdue = dayTasks.some((t) => {
                                try { return t.status !== "DONE" && isBefore(new Date(t.due_date), today); }
                                catch { return false; }
                            });

                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={`h-12 rounded-md flex flex-col items-center justify-center text-xs transition
                                        ${isSelected ? "bg-blue-500 text-white" : isToday ? "ring-1 ring-blue-400 text-blue-600 dark:text-blue-400" : "bg-zinc-50 dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"}
                                        ${hasOverdue ? "border border-red-400" : ""}`}
                                >
                                    <span>{format(day, "d")}</span>
                                    {dayTasks.length > 0 && (
                                        <span className={`text-[9px] font-medium ${isSelected ? "text-blue-100" : "text-blue-500 dark:text-blue-400"}`}>
                                            {dayTasks.length}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tasks for selected day */}
                {selectedDayTasks.length > 0 && (
                    <div className="dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-lg p-4">
                        <h3 className="text-zinc-900 dark:text-white font-medium mb-3">
                            {format(selectedDate, "MMM d, yyyy")} — {selectedDayTasks.length} task{selectedDayTasks.length > 1 ? "s" : ""}
                        </h3>
                        <div className="space-y-3">
                            {selectedDayTasks.map((task) => {
                                const taskType = task.type || "TASK";
                                return (
                                    <div key={task.id} className={`bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-lg border-l-4 ${priorityBorders[task.priority] || priorityBorders["MEDIUM"]}`}>
                                        <div className="flex justify-between mb-1">
                                            <h4 className="text-zinc-900 dark:text-white font-medium text-sm">{task.title}</h4>
                                            <span className={`px-2 py-0.5 rounded text-xs ${typeColors[taskType] || typeColors["TASK"]}`}>{taskType}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                                            <span className="capitalize">{(task.priority || "medium").toLowerCase()} priority</span>
                                            {task.assignee && (
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" /> {task.assignee.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                {/* Upcoming */}
                <div className="dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-lg p-4">
                    <h3 className="text-zinc-900 dark:text-white text-sm flex items-center gap-2 mb-3 font-medium">
                        <Clock className="w-4 h-4" /> Upcoming
                    </h3>
                    {upcomingTasks.length === 0 ? (
                        <p className="text-zinc-400 dark:text-zinc-500 text-sm text-center py-2">No upcoming tasks</p>
                    ) : (
                        <div className="space-y-2">
                            {upcomingTasks.map((task) => {
                                const taskType = task.type || "TASK";
                                return (
                                    <div key={task.id} className="bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-700 p-3 rounded-lg transition">
                                        <div className="flex justify-between items-start text-sm">
                                            <span className="text-zinc-900 dark:text-white truncate flex-1 mr-2">{task.title}</span>
                                            <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${typeColors[taskType] || typeColors["TASK"]}`}>{taskType}</span>
                                        </div>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                            {format(new Date(task.due_date), "MMM d")}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Overdue */}
                {overdueTasks.length > 0 && (
                    <div className="border border-red-300 dark:border-red-500/50 border-l-4 rounded-lg p-4">
                        <h3 className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2 mb-3 font-medium">
                            <Clock className="w-4 h-4" /> Overdue ({overdueTasks.length})
                        </h3>
                        <div className="space-y-2">
                            {overdueTasks.slice(0, 5).map((task) => (
                                <div key={task.id} className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-900 dark:text-white truncate flex-1 mr-2">{task.title}</span>
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-red-200 dark:bg-red-500/20 text-red-700 dark:text-red-400 shrink-0">
                                            {task.type || "TASK"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                        Due {format(new Date(task.due_date), "MMM d")}
                                    </p>
                                </div>
                            ))}
                            {overdueTasks.length > 5 && (
                                <p className="text-xs text-zinc-400 text-center">+{overdueTasks.length - 5} more</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectCalendar;
