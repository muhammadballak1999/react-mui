import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Slider,
  Button,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  setOrders,
  type Order,
  setSearchFilter,
  setStatusFilter,
  setAmountRangeFilter,
  setDateRangeFilter,
  selectFilteredOrders,
} from "../features/orders/ordersSlice";
import mockOrdersData from "../data/mock-orders.json";
import OrdersTable from "../components/OrdersTable";
import KanbanBoardPage from "./KanbanBoardPage";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const statusOptions: Order["status"][] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const exportToCSV = (orders: Order[]) => {
  const headers = [
    "ID",
    "Customer Name",
    "Email",
    "Phone",
    "Status",
    "Total",
    "Order Date",
  ];

  const rows = orders.map((o) => [
    o.id,
    o.customerName,
    o.customerEmail,
    o.customerPhone,
    o.status,
    o.total,
    o.orderDate,
  ]);

  const csvContent = [headers, ...rows]
    .map((r) => r.map((val) => `"${val}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "orders.csv");
  link.click();
};

export default function DashboardPage() {
  const dispatch = useDispatch();
  const filteredOrders = useSelector(selectFilteredOrders);

  const [view, setView] = useState<"dashboard" | "kanban">("dashboard");
  const [dateStart, setDateStart] = useState<Date | null>(null);
  const [dateEnd, setDateEnd] = useState<Date | null>(null);
  const [amount, setAmount] = useState<number[]>([0, 500]);
  const [searchText, setSearchText] = useState("");

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Export to CSV (Ctrl+E)
      if (e.ctrlKey && !e.altKey && (e.key === "e" || e.key === "E")) {
        e.preventDefault();
        exportToCSV(filteredOrders);
      }

      // Switch to Kanban (Alt+K)
      if (e.altKey && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setView("kanban");
      }

      // Switch to Table (Alt+T)
      if (e.altKey && (e.key === "t" || e.key === "T")) {
        e.preventDefault();
        setView("dashboard");
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [filteredOrders]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(setSearchFilter(searchText));
    }, 300);
    return () => clearTimeout(handler);
  }, [searchText, dispatch]);

  // Load mock data
  useEffect(() => {
    if (mockOrdersData && Array.isArray(mockOrdersData.orders)) {
      dispatch(setOrders(mockOrdersData.orders as Order[]));
    }
  }, [dispatch]);

  // Summary statistics
  const { totalOrders, totalRevenue } = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce(
      (sum, o) => sum + (o.total || 0),
      0
    );
    return { totalOrders, totalRevenue };
  }, [filteredOrders]);

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Order Management Dashboard
      </Typography>

      {/* View toggle buttons */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant={view === "dashboard" ? "contained" : "outlined"}
          onClick={() => setView("dashboard")}
          sx={{ mr: 1 }}
        >
          Table View (Alt+T)
        </Button>
        <Button
          variant={view === "kanban" ? "contained" : "outlined"}
          onClick={() => setView("kanban")}
        >
          Kanban View (Alt+K)
        </Button>
      </Box>

      {/* Summary cards */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">Total Orders</Typography>
          <Typography variant="h4">{totalOrders}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">Total Revenue</Typography>
          <Typography variant="h4">${totalRevenue.toFixed(2)}</Typography>
        </Paper>
      </Box>

      {/* Filters */}
      <Paper
        sx={{
          padding: 2,
          marginBottom: 3,
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
        }}
      >
        <TextField
          label="Search by Name or ID"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <TextField
          select
          label="Status"
          size="small"
          onChange={(e) => {
            const value = e.target.value;
            dispatch(setStatusFilter(value ? [value as Order["status"]] : []));
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          {statusOptions.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start Date"
            value={dateStart}
            onChange={(newVal) => {
              setDateStart(newVal);
              setDateEnd(null);
              dispatch(
                setDateRangeFilter({
                  start: newVal ? newVal.toISOString() : null,
                  end: null,
                })
              );
            }}
            slotProps={{
              field: { clearable: true },
            }}
          />
          <DatePicker
            label="End Date"
            value={dateEnd}
            minDate={
              dateStart
                ? new Date(dateStart.getTime() + 24 * 60 * 60 * 1000)
                : undefined
            }
            onChange={(newVal) => {
              setDateEnd(newVal);
              dispatch(
                setDateRangeFilter({
                  start: dateStart ? dateStart.toISOString() : null,
                  end: newVal ? newVal.toISOString() : null,
                })
              );
            }}
            slotProps={{
              field: { clearable: true },
            }}
          />
        </LocalizationProvider>

        <Box sx={{ width: 200, paddingX: 2 }}>
          <Typography variant="body2">Amount Range</Typography>
          <Slider
            value={amount}
            onChange={(_, newValue) => {
              const range = newValue as number[];
              setAmount(range);
              dispatch(setAmountRangeFilter({ min: range[0], max: range[1] }));
            }}
            valueLabelDisplay="auto"
            min={0}
            max={500}
            step={10}
          />
        </Box>

        <Button variant="outlined" onClick={() => exportToCSV(filteredOrders)}>
          Export CSV (Ctrl+E)
        </Button>
      </Paper>

      {/* Show Table or Kanban */}
      {view === "dashboard" ? (
        <Paper sx={{ padding: 2 }}>
          <OrdersTable rows={filteredOrders} />
        </Paper>
      ) : (
        <KanbanBoardPage />
      )}
    </Box>
  );
}
