import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  MenuItem,
  TextField,
  Divider,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { type Order, updateOrderStatus } from "../features/orders/ordersSlice";
import { type RootState } from "../store";

interface OrderDetailsModalProps {
  orderId: string | null;
  open: boolean;
  onClose: () => void;
}

const statusOptions: Order["status"][] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrderDetailsModal({
  orderId,
  open,
  onClose,
}: OrderDetailsModalProps) {
  const dispatch = useDispatch();

  // Always get the latest order from the store
  const order = useSelector((state: RootState) =>
    state.orders.list.find((o) => o.id === orderId) || null
  );

  if (!order) return null;

  const handleStatusChange = (newStatus: string) => {
    dispatch(
      updateOrderStatus({
        id: order.id,
        status: newStatus as Order["status"],
      })
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Order Details - {order.id}</DialogTitle>
      <DialogContent dividers>
        {/* Customer Info */}
        <Typography variant="h6" gutterBottom>
          Customer
        </Typography>
        <Typography>Name: {order.customerName}</Typography>
        <Typography>Email: {order.customerEmail}</Typography>
        <Typography>Phone: {order.customerPhone}</Typography>

        <Divider sx={{ my: 2 }} />

        {/* Shipping Address */}
        <Typography variant="h6" gutterBottom>
          Shipping Address
        </Typography>
        <Typography>
          {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
          {order.shippingAddress.state} {order.shippingAddress.zipCode},{" "}
          {order.shippingAddress.country}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Status Update */}
        <Typography variant="h6" gutterBottom>
          Status
        </Typography>
        <TextField
          select
          size="small"
          value={order.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {statusOptions.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>

        <Divider sx={{ my: 2 }} />

        {/* Order Items */}
        <Typography variant="h6" gutterBottom>
          Items
        </Typography>
        {order.items.map((item) => (
          <Box
            key={item.id}
            sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
          >
            <Typography>
              {item.name} (x{item.quantity})
            </Typography>
            <Typography>
              ${(item.price * item.quantity).toFixed(2)}
            </Typography>
          </Box>
        ))}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">Total</Typography>
          <Typography variant="h6">${order.total.toFixed(2)}</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
