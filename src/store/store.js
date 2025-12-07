import { configureStore, combineReducers } from "@reduxjs/toolkit";
import widgetReducer from "./widgetSlice";

import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

const rootReducer = combineReducers({
  widgets: widgetReducer,
});

const persistConfig = {
  key: "dashboard-widgets",
  storage,
  whitelist: ["widgets"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
