import React, { useEffect, useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useDispatch } from "react-redux";
import { Chip } from "@mui/material";
import { updateOrderStatus, type Order } from "../features/orders/ordersSlice";
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

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

const handleRowClick = (order: Order) => {
  setSelectedOrderId(order.id);
  setModalOpen(true);
};

const handleCloseModal = () => {
  setSelectedOrderId(null);
  setModalOpen(false);
};


  const columns: GridColDef[] = [
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
  ];

  // Simulate random status updates
  useEffect(() => {
    const interval = setInterval(() => {
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
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [rows, dispatch]);

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
    </div>
  );
}
