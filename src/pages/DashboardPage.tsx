import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Slider,
  IconButton,
  InputAdornment,
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
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ClearIcon from "@mui/icons-material/Clear";

const statusOptions: Order["status"][] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function DashboardPage() {
  const dispatch = useDispatch();
  const filteredOrders = useSelector(selectFilteredOrders);

  const [dateStart, setDateStart] = useState<Date | null>(null);
  const [dateEnd, setDateEnd] = useState<Date | null>(null);
  const [amount, setAmount] = useState<number[]>([0, 500]);

  useEffect(() => {
    if (mockOrdersData && Array.isArray(mockOrdersData.orders)) {
      dispatch(setOrders(mockOrdersData.orders as Order[]));
    }
  }, [dispatch]);

  const clearStartDate = () => {
    setDateStart(null);
    setDateEnd(null);
    dispatch(setDateRangeFilter({ start: null, end: null }));
  };

  const clearEndDate = () => {
    setDateEnd(null);
    dispatch(
      setDateRangeFilter({
        start: dateStart ? dateStart.toISOString() : null,
        end: null,
      })
    );
  };

  const handleStartDateChange = (newVal: Date | null) => {
    setDateStart(newVal);
    setDateEnd(null);
    dispatch(
      setDateRangeFilter({
        start: newVal ? newVal.toISOString() : null,
        end: null,
      })
    );
  };

  const handleEndDateChange = (newVal: Date | null) => {
    setDateEnd(newVal);
    dispatch(
      setDateRangeFilter({
        start: dateStart ? dateStart.toISOString() : null,
        end: newVal ? newVal.toISOString() : null,
      })
    );
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Order Management Dashboard
      </Typography>

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
        {/* Search */}
        <TextField
          label="Search by Name or ID"
          size="small"
          sx={{ minWidth: 200 }}
          onChange={(e) => dispatch(setSearchFilter(e.target.value))}
        />

        {/* Status Filter */}
        <TextField
          select
          label="Status"
          size="small"
          sx={{ minWidth: 150 }}
          onChange={(e) => {
            const value = e.target.value;
            dispatch(setStatusFilter(value ? [value as Order["status"]] : []));
          }}
        >
          <MenuItem value="">All</MenuItem>
          {statusOptions.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>

        {/* Date Range */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start Date"
            value={dateStart}
            onChange={handleStartDateChange}
            slotProps={{
              textField: {
                size: "small",
                sx: { minWidth: 150 },
                InputProps: dateStart
                  ? {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={clearStartDate}>
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  : undefined,
              },
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
            onChange={handleEndDateChange}
            disabled={!dateStart}
            slotProps={{
              textField: {
                size: "small",
                sx: { minWidth: 150 },
                InputProps: dateEnd
                  ? {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={clearEndDate}>
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  : undefined,
              },
            }}
          />
        </LocalizationProvider>

        {/* Amount Range */}
        <Box sx={{ width: 200, paddingX: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Amount Range
          </Typography>
          <Slider
            value={amount}
            onChange={(_, newValue) => {
              const range = newValue as number[];
              setAmount(range);
              dispatch(
                setAmountRangeFilter({ min: range[0], max: range[1] })
              );
            }}
            valueLabelDisplay="auto"
            min={0}
            max={500}
            step={10}
          />
        </Box>
      </Paper>

      <Paper sx={{ padding: 2 }}>
        <OrdersTable rows={filteredOrders} />
      </Paper>
    </Box>
  );
}
