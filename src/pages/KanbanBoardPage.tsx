import React, { useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useDispatch, useSelector } from "react-redux";
import {
  selectFilteredOrders,
  updateOrderStatus,
  type Order,
} from "../features/orders/ordersSlice";
import { Box, Paper, Typography } from "@mui/material";

const columns: Order["status"][] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function KanbanBoardPage() {
  const dispatch = useDispatch();
  const filteredOrders = useSelector(selectFilteredOrders);

  // Group orders by status
  const ordersByStatus = useMemo(() => {
    const grouped: Record<Order["status"], Order[]> = {
      pending: [],
      processing: [],
      shipped: [],
      delivered: [],
      cancelled: [],
    };
    filteredOrders.forEach((o) => grouped[o.status].push(o));
    return grouped;
  }, [filteredOrders]);

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const fromStatus = source.droppableId as Order["status"];
    const toStatus = destination.droppableId as Order["status"];

    if (fromStatus !== toStatus) {
      dispatch(updateOrderStatus({ id: draggableId, status: toStatus }));
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 2, height: "100%" }}>
      <DragDropContext onDragEnd={onDragEnd}>
        {columns.map((status) => (
          <Droppable droppableId={status} key={status}>
            {(provided, snapshot) => (
              <Paper
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  flex: 1,
                  p: 2,
                  minHeight: "80vh",
                  bgcolor: snapshot.isDraggingOver
                    ? "action.hover"
                    : "background.paper",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 2, textTransform: "capitalize" }}
                >
                  {status}
                </Typography>
                {ordersByStatus[status].map((order, index) => (
                  <Draggable
                    draggableId={order.id}
                    index={index}
                    key={order.id}
                  >
                    {(provided, snapshot) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{
                          mb: 2,
                          p: 2,
                          borderRadius: 1,
                          bgcolor: snapshot.isDragging
                            ? "primary.light"
                            : "grey.100",
                          boxShadow: 1,
                          cursor: "grab",
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={600}>
                          {order.customerName}
                        </Typography>
                        <Typography variant="body2">{order.id}</Typography>
                        <Typography variant="body2">
                          ${order.total.toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Paper>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </Box>
  );
}
