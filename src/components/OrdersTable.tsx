import React, { useEffect, useState, useMemo, useCallback } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useDispatch } from "react-redux";
import { Chip, Snackbar } from "@mui/material";
import {
  updateOrderStatus,
  addOrder,
  type Order,
} from "../features/orders/ordersSlice";
import OrderDetailsModal from "./OrderDetailsModal";

interface OrdersTableProps {
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

export default function OrdersTable({ rows }: OrdersTableProps) {
  const dispatch = useDispatch();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleCloseModal = () => {
    setSelectedOrderId(null);
    setModalOpen(false);
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleRowClick = useCallback((order: Order) => {
    setSelectedOrderId(order.id);
    setModalOpen(true);
  }, []);

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: "id", headerName: "Order ID", flex: 1, minWidth: 120 },
      { field: "customerName", headerName: "Customer", flex: 1.5, minWidth: 150 },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        minWidth: 120,
        renderCell: (params) => (
          <Chip
            label={params.value}
            color={statusColors[params.value as Order["status"]]}
            size="small"
            sx={{ textTransform: "capitalize" }}
          />
        ),
      },
      {
        field: "total",
        headerName: "Amount ($)",
        type: "number",
        flex: 1,
        minWidth: 120,
        valueFormatter: (params: number) => {
          const value = params;
          return typeof value === "number" ? `$${value.toFixed(2)}` : "$0.00";
        },
      },
      {
        field: "orderDate",
        headerName: "Order Date",
        flex: 1.2,
        minWidth: 150,
        valueFormatter: (params: string) => {
          const value = params;
          return value
            ? new Date(value).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "";
        },
      },
    ],
    []
  );

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
    <div style={{ width: "100%", height: 600 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        pageSizeOptions={[5, 10, 25]}
        disableRowSelectionOnClick
        onRowClick={(params) => handleRowClick(params.row as Order)}
      />

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
    </div>
  );
}
