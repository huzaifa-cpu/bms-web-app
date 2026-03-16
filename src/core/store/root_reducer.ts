import { combineReducers } from '@reduxjs/toolkit'
import { apiSlice } from '../api/api_slices'

export const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
})

export type RootState = ReturnType<typeof rootReducer>
