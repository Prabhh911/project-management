import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api";

export const fetchWorkspaces = createAsyncThunk(
  "workspace/fetchWorkspaces",
  async () => {
    const res = await api.get("/workspaces");
    return res.data;
  }
);

export const fetchWorkspaceById = createAsyncThunk(
  "workspace/fetchWorkspaceById",
  async (workspaceId) => {
    const res = await api.get(`/workspaces/${workspaceId}`);
    return res.data;
  }
);

const workspaceSlice = createSlice({
  name: "workspace",
  initialState: {
    workspaces: [],
    currentWorkspace: null,
    loading: false,
  },

  reducers: {

    setCurrentWorkspace: (state, action) => {
      const id = action.payload;
      state.currentWorkspace = state.workspaces.find((w) => w.id === id);
    },

    deleteTask: (state, action) => {
      const { projectId, taskId } = action.payload;

      const project = state.currentWorkspace?.projects?.find(
        (p) => p.id === projectId
      );

      if (!project) return;

      project.tasks = project.tasks.filter((t) => t.id !== taskId);
    },

    updateTask: (state, action) => {
      const { projectId, taskId, updates } = action.payload;

      const project = state.currentWorkspace?.projects?.find(
        (p) => p.id === projectId
      );

      if (!project) return;

      const task = project.tasks.find((t) => t.id === taskId);

      if (!task) return;

      Object.assign(task, updates);
    }

  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.workspaces = action.payload;
        state.currentWorkspace = action.payload[0] || null;
        state.loading = false;
      })
      .addCase(fetchWorkspaceById.fulfilled, (state, action) => {
        state.currentWorkspace = action.payload;
      });
  },
});

export const {
  setCurrentWorkspace,
  deleteTask,
  updateTask
} = workspaceSlice.actions;

export default workspaceSlice.reducer;