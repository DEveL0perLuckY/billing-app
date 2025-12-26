import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  customer: null,
  currentInvoice: null,
};

const MySlice = createSlice({
  name: 'MySlice',
  initialState,
  reducers: {
    setCustomer(state, action) {
      state.customer = action.payload;
    },
    setCurrentInvoice(state, action) {
      state.currentInvoice = action.payload;
    },
  },
});

export const {setCustomer, setCurrentInvoice} = MySlice.actions;
export default MySlice.reducer;
