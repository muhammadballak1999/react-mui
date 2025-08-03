import React, { useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useDispatch, useSelector } from "react-redux";
import {
  selectFilteredOrders,
  updateOrderStatus,
  type Order,
} from "../features/orders/ordersSlice";
import { Box, Paper, Typography, useTheme } from "@mui/material";

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
  const theme = useTheme();

  // Group orders by status (fixed stable order)
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

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const fromStatus = source.droppableId as Order["status"];
    const toStatus = destination.droppableId as Order["status"];

    // If same column, don't do anything
    if (fromStatus === toStatus) return;

    // Update only the status in Redux
    dispatch(updateOrderStatus({ id: draggableId, status: toStatus }));
  };

  const getCardBg = (isDragging: boolean) => {
    if (isDragging) {
      return theme.palette.mode === "dark"
        ? theme.palette.primary.dark
        : theme.palette.primary.light;
    }
    return theme.palette.mode === "dark" ? "grey.800" : "grey.100";
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        height: "100%",
        overflowX: "auto",
        pb: 2,
      }}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        {columns.map((status) => (
          <Droppable
            droppableId={status}
            key={status}
            isCombineEnabled={false}
            renderClone={(provided, snapshot, rubric) => {
              const draggedOrder = ordersByStatus[status][rubric.source.index];
              return (
                <Box
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 1,
                    bgcolor: getCardBg(snapshot.isDragging),
                    color:
                      theme.palette.mode === "dark"
                        ? "grey.100"
                        : "text.primary",
                    boxShadow: 3,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600}>
                    {draggedOrder.customerName}
                  </Typography>
                  <Typography variant="body2">{draggedOrder.id}</Typography>
                  <Typography variant="body2">
                    ${draggedOrder.total.toFixed(2)}
                  </Typography>
                </Box>
              );
            }}
          >
            {(provided, snapshot) => (
              <Paper
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  flex: 1,
                  p: 2,
                  minHeight: "80vh",
                  minWidth: "300px",
                  bgcolor: snapshot.isDraggingOver
                    ? theme.palette.action.hover
                    : theme.palette.background.paper,
                  transition: "background-color 0.2s ease",
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
                    key={order.id}
                    draggableId={order.id}
                    index={index}
                  >
                    {(provided, snapshot) => {
                      // Don't render the dragged item in the list
                      if (snapshot.isDragging) return null;

                      return (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{
                            mb: 2,
                            p: 2,
                            borderRadius: 1,
                            bgcolor: getCardBg(snapshot.isDragging),
                            color:
                              theme.palette.mode === "dark"
                                ? "grey.100"
                                : "text.primary",
                            boxShadow: 1,
                            cursor: "grab",
                            transition: "background-color 0.2s ease",
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
                      );
                    }}
                  </Draggable>
                ))}

                {/* Hide placeholder to prevent shifting */}
                <div style={{ display: "none" }}>{provided.placeholder}</div>
              </Paper>
            )}
          </Droppable>

        ))}
      </DragDropContext>
    </Box>
  );
}
