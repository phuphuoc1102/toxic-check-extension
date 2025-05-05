import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {IItem} from "@/model/item"; // Định nghĩa interface IItem

interface ItemState {
  items: IItem[];
}

const initialState: ItemState = {
  items: [],
};

const itemSlice = createSlice({
  name: "items",
  initialState,
  reducers: {
    setItems(state, action: PayloadAction<IItem[]>) {
      state.items = action.payload;
    },
    addItem(state, action: PayloadAction<IItem>) {
      state.items = [action.payload, ...state.items];
    },
    updateItem(state, action: PayloadAction<IItem>) {
      const index = state.items.findIndex(
        item => item.id === action.payload.id,
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
  },
});

export const {setItems, addItem, updateItem, deleteItem} = itemSlice.actions;
export default itemSlice.reducer;
