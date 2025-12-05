import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selectedDrone: null,
}

export const droneSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    updateSelectedDrone: (state, action) => {
      state.selectedDrone = action.payload;
    },
  },
})

// Action creators are generated for each case reducer function
export const { updateSelectedDrone } = droneSlice.actions

export default droneSlice.reducer;