import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWorkspaces } from "../features/workspaceSlice";
import api from "../api/api";

export default function InviteMemberDialog({ isOpen, setIsOpen }) {

    const dispatch = useDispatch();
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace);

    const [userId, setUserId] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("MEMBER SUBMITTED");

        try {
            await api.post("/workspaces/members", {
                workspace_id: currentWorkspace.id,
                user_id: Number(userId),
                role: "member",
            });

            dispatch(fetchWorkspaces());
            setIsOpen(false);

        } catch (err) {
            console.error(err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded">

                <input
                    placeholder="User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="border p-2 mb-3"
                />

                <button type="submit" className="bg-blue-500 text-white px-4 py-2">
                    Add Member
                </button>

            </form>
        </div>
    );
}