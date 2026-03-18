import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWorkspaces } from "../features/workspaceSlice";
import api from "../api/api";

export default function CreateProjectDialog({ show, setShow }) {

    const dispatch = useDispatch();
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace);

    const [name, setName] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("PROJECT SUBMITTED");

        try {
            await api.post("/projects", {
                workspace_id: currentWorkspace.id,
                name,
            });

            dispatch(fetchWorkspaces());
            setShow(false);

        } catch (err) {
            console.error(err);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded">

                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Project Name"
                    className="border p-2 mb-3"
                />

                <button type="submit" className="bg-blue-500 text-white px-4 py-2">
                    Create Project
                </button>

            </form>
        </div>
    );
}