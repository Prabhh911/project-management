import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus, X, Building2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkspace, fetchWorkspaces } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import toast from "react-hot-toast";

function WorkspaceDropdown() {
    const dispatch         = useDispatch();
    const navigate         = useNavigate();
    const { workspaces }   = useSelector((state) => state.workspace);
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);

    const [isOpen, setIsOpen]           = useState(false);
    const [showCreate, setShowCreate]   = useState(false);
    const [newName, setNewName]         = useState("");
    const [isCreating, setIsCreating]   = useState(false);
    const dropdownRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
                setShowCreate(false);
                setNewName("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const onSelectWorkspace = (id) => {
        dispatch(setCurrentWorkspace(id));
        setIsOpen(false);
        navigate("/");
    };

    const handleCreateWorkspace = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        const toastId = toast.loading("Creating workspace...");
        try {
            setIsCreating(true);
            const res = await api.post("/workspaces", {
                name: newName.trim(),
                // Use the owner id from current workspace if available
                owner_id: currentWorkspace?.owner?.id || null,
            });
            await dispatch(fetchWorkspaces());
            // Switch to the newly created workspace
            dispatch(setCurrentWorkspace(String(res.data.id)));
            toast.success(`Workspace "${newName}" created`, { id: toastId });
            setNewName("");
            setShowCreate(false);
            setIsOpen(false);
            navigate("/");
        } catch (err) {
            console.error(err);
            toast.error("Failed to create workspace", { id: toastId });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="relative m-4" ref={dropdownRef}>

            {/* Trigger button */}
            <button
                onClick={() => { setIsOpen((prev) => !prev); setShowCreate(false); }}
                className="w-full flex items-center justify-between p-3 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                        {currentWorkspace?.name?.[0]?.toUpperCase() || "W"}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                            {currentWorkspace?.name || "Select Workspace"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                            {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg top-full left-0 overflow-hidden">

                    {/* Workspace list */}
                    <div className="p-2 max-h-48 overflow-y-auto">
                        <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 px-2">
                            Workspaces
                        </p>
                        {workspaces.map((ws) => (
                            <div
                                key={ws.id}
                                onClick={() => onSelectWorkspace(ws.id)}
                                className="flex items-center gap-3 p-2 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                            >
                                <div className="w-7 h-7 rounded bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {ws.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{ws.name}</p>
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                                        {ws.projects?.length || 0} project{ws.projects?.length !== 1 ? "s" : ""}
                                    </p>
                                </div>
                                {String(currentWorkspace?.id) === String(ws.id) && (
                                    <Check className="w-4 h-4 text-blue-500 shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>

                    <hr className="border-gray-100 dark:border-zinc-800" />

                    {/* Create workspace */}
                    {!showCreate ? (
                        <div className="p-2">
                            <button
                                onClick={() => setShowCreate(true)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition"
                            >
                                <Plus className="w-4 h-4" /> Create Workspace
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleCreateWorkspace} className="p-3 space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                <Building2 className="size-4 text-blue-500" />
                                <p className="text-sm font-medium text-zinc-800 dark:text-white">New Workspace</p>
                                <button
                                    type="button"
                                    onClick={() => { setShowCreate(false); setNewName(""); }}
                                    className="ml-auto text-zinc-400 hover:text-zinc-600"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                            <input
                                autoFocus
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Workspace name"
                                className="w-full border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                                required
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={isCreating || !newName.trim()}
                                    className="flex-1 bg-blue-500 hover:opacity-90 disabled:opacity-50 text-white text-sm py-1.5 rounded transition"
                                >
                                    {isCreating ? "Creating..." : "Create"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowCreate(false); setNewName(""); }}
                                    className="flex-1 border border-zinc-300 dark:border-zinc-700 text-sm py-1.5 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}

export default WorkspaceDropdown;
