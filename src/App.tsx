import React from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { ThemeProvider, createTheme, CssBaseline, Container } from "@mui/material";
import { SnackbarProvider } from "notistack";
import DashboardPage from "./pages/DashboardPage";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#f50057" },
  },
});

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
          <Container maxWidth="xl" sx={{ paddingTop: 4, paddingBottom: 4 }}>
            <DashboardPage />
          </Container>
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  );
}
