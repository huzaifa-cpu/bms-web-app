import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '../api/api_slices'
import { rootReducer } from './root_reducer'

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
})

export type AppDispatch = typeof store.dispatch
