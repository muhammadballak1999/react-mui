import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// Order item type
export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  sku: string;
}

// Shipping address type
export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Order type
export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderDate: string; // ISO date string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
}

// Filters state
interface FiltersState {
  status: Order["status"][]; // multiple statuses
  dateRange: { start: string | null; end: string | null };
  amountRange: { min: number | null; max: number | null };
  search: string; // search by name or ID
}

// Initial state
interface OrdersState {
  list: Order[];
  filters: FiltersState;
}

const initialState: OrdersState = {
  list: [],
  filters: {
    status: [],
    dateRange: { start: null, end: null },
    amountRange: { min: null, max: null },
    search: "",
  },
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    // Set all orders (initial load)
    setOrders(state, action: PayloadAction<Order[]>) {
      state.list = action.payload;
    },

    // Add a new order (used for real-time simulation)
    addOrder(state, action: PayloadAction<Order>) {
      state.list.unshift(action.payload);
    },

    // Update single order status
    updateOrderStatus(
      state,
      action: PayloadAction<{ id: string; status: Order["status"] }>
    ) {
      const order = state.list.find((o) => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
      }
    },

    // === Filters ===
    setStatusFilter(state, action: PayloadAction<Order["status"][]>) {
      state.filters.status = action.payload;
    },
    setDateRangeFilter(
      state,
      action: PayloadAction<{ start: string | null; end: string | null }>
    ) {
      state.filters.dateRange = action.payload;
    },
    setAmountRangeFilter(
      state,
      action: PayloadAction<{ min: number | null; max: number | null }>
    ) {
      state.filters.amountRange = action.payload;
    },
    setSearchFilter(state, action: PayloadAction<string>) {
      state.filters.search = action.payload;
    },
  },
});

export const {
  setOrders,
  addOrder,
  updateOrderStatus,
  setStatusFilter,
  setDateRangeFilter,
  setAmountRangeFilter,
  setSearchFilter,
} = ordersSlice.actions;
export default ordersSlice.reducer;

// Selector that returns filtered orders
export const selectFilteredOrders = (state: { orders: OrdersState }) => {
  const { list, filters } = state.orders;

  return list.filter((order) => {
    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(order.status)) {
      return false;
    }

    // Date filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const orderDate = new Date(order.orderDate).getTime();
      if (filters.dateRange.start) {
        const start = new Date(filters.dateRange.start).getTime();
        if (orderDate < start) return false;
      }
      if (filters.dateRange.end) {
        const end = new Date(filters.dateRange.end).getTime();
        if (orderDate > end) return false;
      }
    }

    // Amount filter
    if (
      filters.amountRange.min !== null &&
      order.total < filters.amountRange.min
    ) {
      return false;
    }
    if (
      filters.amountRange.max !== null &&
      order.total > filters.amountRange.max
    ) {
      return false;
    }

    // Search filter
    const search = filters.search.toLowerCase();
    if (search) {
      const combined = `${order.customerName} ${order.id}`.toLowerCase();
      if (!combined.includes(search)) return false;
    }

    return true;
  });
};
