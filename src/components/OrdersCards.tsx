import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Checkbox,
  FormControlLabel,
  MenuItem,
  TextField,
  Button,
  Snackbar,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { useDispatch } from "react-redux";
import {
  updateOrderStatus,
  addOrder,
  type Order,
} from "../features/orders/ordersSlice";
import OrderDetailsModal from "./OrderDetailsModal";

interface OrdersCardsProps {
  rows: Order[];
}

const statusColors: Record<
  Order["status"],
  "default" | "primary" | "warning" | "success" | "error"
> = {
  pending: "default",
  processing: "warning",
  shipped: "primary",
  delivered: "success",
  cancelled: "error",
};

const bulkStatusOptions: Order["status"][] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAGE_SIZE = 9; // Number of cards per page

export default function OrdersCards({ rows }: OrdersCardsProps) {
  const dispatch = useDispatch();

    const theme = useTheme();
    const isMdDown = useMediaQuery(theme.breakpoints.down("md"));

  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<Order["status"]>("shipped");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const paginatedRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedOrderId(null);
    setModalOpen(false);
  };

  const handleCardClick = (order: Order) => {
    setSelectedOrderId(order.id);
    setModalOpen(true);
  };

  const handleCheckboxToggle = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(paginatedRows.map((r) => r.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleBulkUpdate = () => {
    selectedOrderIds.forEach((id) => {
      dispatch(updateOrderStatus({ id, status: bulkStatus }));
    });
    showSnackbar(`Updated ${selectedOrderIds.length} orders to "${bulkStatus}"`);
    setSelectedOrderIds([]);
  };

  const handlePageChange = (newPage: number) => {
    setSelectedOrderIds([]); // Clear selection on page change
    setPage(newPage);
  };

  // Generate random new order
  const generateRandomOrder = useCallback((): Order => {
    const id = `ORD-${Date.now()}`;
    const statuses: Order["status"][] = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    return {
      id,
      customerName: `Customer ${Math.floor(Math.random() * 1000)}`,
      customerEmail: `customer${Math.floor(Math.random() * 1000)}@email.com`,
      customerPhone: "+1-555-0000",
      orderDate: new Date().toISOString(),
      status: randomStatus,
      total: parseFloat((Math.random() * 500 + 20).toFixed(2)),
      items: [],
      shippingAddress: {
        street: "123 Random St",
        city: "Random City",
        state: "RC",
        zipCode: "12345",
        country: "USA",
      },
    };
  }, []);

  // Real-time effects
  useEffect(() => {
    const statusInterval = setInterval(() => {
      if (rows.length > 0) {
        const randomOrder = rows[Math.floor(Math.random() * rows.length)];
        const statuses: Order["status"][] = [
          "pending",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ];
        const newStatus =
          statuses[Math.floor(Math.random() * statuses.length)];
        dispatch(updateOrderStatus({ id: randomOrder.id, status: newStatus }));
        showSnackbar(`Order ${randomOrder.id} status updated to ${newStatus}`);
      }
    }, 15000);

    const newOrderInterval = setInterval(() => {
      const newOrder = generateRandomOrder();
      dispatch(addOrder(newOrder));
      showSnackbar(`New order ${newOrder.id} added`);
    }, 10000 + Math.random() * 5000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(newOrderInterval);
    };
  }, [rows, dispatch, generateRandomOrder]);

  return (
    <Box>
      {/* Bulk actions */}
      {selectedOrderIds.length > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
            p: 1,
            bgcolor: "background.paper",
            borderRadius: 1,
          }}
        >
          <TextField
            select
            size="small"
            label="Set Status"
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value as Order["status"])}
            sx={{ minWidth: 180 }}
          >
            {bulkStatusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" color="primary" onClick={handleBulkUpdate}>
            Apply to {selectedOrderIds.length} orders
          </Button>
        </Box>
      )}

      {/* Select all */}
      {paginatedRows.length > 0 && (
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedOrderIds.length === paginatedRows.length}
              indeterminate={
                selectedOrderIds.length > 0 &&
                selectedOrderIds.length < paginatedRows.length
              }
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
          }
          label="Select All on This Page"
        />
      )}

      <Grid container spacing={2} justifyContent={ isMdDown ? 'center' : 'start'}>
        {paginatedRows.map((order) => {
          const isSelected = selectedOrderIds.includes(order.id);
          return (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            <Grid xs={12} sm={6} md={4} key={order.id}>
              <Card
                sx={{
                  cursor: "pointer",
                  border: isSelected ? "2px solid #1976d2" : "1px solid #ccc",
                }}
                onClick={() => handleCardClick(order)}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleCheckboxToggle(order.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Chip
                      label={order.status}
                      color={statusColors[order.status]}
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                  </Box>

                  <Typography variant="h6">
                    {order.customerName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Order ID: {order.id}
                  </Typography>
                  <Typography variant="body2">
                    Amount: ${order.total.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    Date:{" "}
                    {new Date(order.orderDate).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          gap={2}
          mt={3}
        >
          <Button
            variant="outlined"
            disabled={page === 0}
            onClick={() => handlePageChange(page - 1)}
          >
            Previous
          </Button>
          <Typography>
            Page {page + 1} of {totalPages}
          </Typography>
          <Button
            variant="outlined"
            disabled={page + 1 >= totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            Next
          </Button>
        </Box>
      )}

      <OrderDetailsModal
        orderId={selectedOrderId}
        open={modalOpen}
        onClose={handleCloseModal}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
}
