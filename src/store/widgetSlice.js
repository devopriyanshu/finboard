import { createSlice } from "@reduxjs/toolkit";

const widgetSlice = createSlice({
  name: "widgets",
  initialState: {
    list: [],
  },
  reducers: {
    addWidget: (state, action) => {
      state.list.push(action.payload);
    },
    deleteWidget: (state, action) => {
      state.list = state.list.filter((w) => w.id !== action.payload);
    },
    updateWidget: (state, action) => {
      const index = state.list.findIndex((w) => w.id === action.payload.id);
      if (index !== -1)
        state.list[index] = { ...state.list[index], ...action.payload.data };
    },
    clearWidgets: (state) => {
      state.list = [];
    },
  },
});

export const { addWidget, deleteWidget, updateWidget, clearWidgets } =
  widgetSlice.actions;
export default widgetSlice.reducer;
