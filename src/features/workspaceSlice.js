import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api";

export const fetchWorkspaces = createAsyncThunk(
  "workspace/fetchWorkspaces",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/workspaces");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchWorkspaceById = createAsyncThunk(
  "workspace/fetchWorkspaceById",
  async (workspaceId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const workspaceSlice = createSlice({
  name: "workspace",
  initialState: {
    workspaces: [],
    currentWorkspace: null,
    loading: false,   // true only on FIRST load (shows full-page spinner in Layout)
    refreshing: false, // true on background re-fetches (after create project/task)
    error: null,
  },

  reducers: {

    setCurrentWorkspace: (state, action) => {
      const id = action.payload;
      state.currentWorkspace = state.workspaces.find(
        (w) => String(w.id) === String(id)
      );
    },

    deleteTask: (state, action) => {
      const payload = action.payload;
      if (Array.isArray(payload)) {
        const idsToDelete = new Set(payload.map(String));
        for (const project of (state.currentWorkspace?.projects || [])) {
          project.tasks = project.tasks.filter((t) => !idsToDelete.has(String(t.id)));
        }
        return;
      }
      const { projectId, taskId } = payload;
      const project = state.currentWorkspace?.projects?.find(
        (p) => String(p.id) === String(projectId)
      );
      if (!project) return;
      project.tasks = project.tasks.filter((t) => String(t.id) !== String(taskId));
    },

    updateTask: (state, action) => {
      const payload = action.payload;
      let taskId, updates;
      if (payload.taskId !== undefined) {
        taskId = payload.taskId;
        updates = payload.updates;
      } else {
        taskId = payload.id;
        updates = payload;
      }
      for (const project of (state.currentWorkspace?.projects || [])) {
        const task = project.tasks.find((t) => String(t.id) === String(taskId));
        if (task) {
          Object.assign(task, updates);
          return;
        }
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        // FIX: Only show full-page spinner on the very first load (no workspaces yet)
        // After that, use `refreshing` so background re-fetches don't blank the whole UI
        if (state.workspaces.length === 0) {
          state.loading = true;
        } else {
          state.refreshing = true;
        }
        state.error = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.workspaces = action.payload;
        // FIX: preserve currently selected workspace after re-fetch
        const currentId = state.currentWorkspace?.id;
        if (currentId) {
          state.currentWorkspace =
            action.payload.find((w) => String(w.id) === String(currentId)) ||
            action.payload[0] ||
            null;
        } else {
          state.currentWorkspace = action.payload[0] || null;
        }
        state.loading = false;
        state.refreshing = false;
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload || "Failed to fetch workspaces";
      })
      .addCase(fetchWorkspaceById.fulfilled, (state, action) => {
        state.currentWorkspace = action.payload;
      });
  },
});

export const { setCurrentWorkspace, deleteTask, updateTask } = workspaceSlice.actions;
export default workspaceSlice.reducer;
