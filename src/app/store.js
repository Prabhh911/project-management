import { configureStore } from "@reduxjs/toolkit";
import workspaceReducer from "../features/workspaceSlice";
import themeReducer from "../features/themeSlice";

const store = configureStore({
  reducer: {
    workspace: workspaceReducer,
    theme: themeReducer,
  },
});

export default store;