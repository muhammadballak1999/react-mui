import React, { useState, useEffect, useMemo } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  IconButton,
  Box,
  useTheme,
} from "@mui/material";
import { SnackbarProvider } from "notistack";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import DashboardPage from "./pages/DashboardPage";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Define context inside the file (not exported)
const AppThemeContext = React.createContext({
  toggleColorMode: () => {},
});

// Move the context inside the component
const ThemeToggle = () => {
  const theme = useTheme();
  const { toggleColorMode } = React.useContext(AppThemeContext);

  return (
    <IconButton onClick={toggleColorMode} color="inherit">
      {theme.palette.mode === "dark" ? (
        <Brightness7Icon />
      ) : (
        <Brightness4Icon />
      )}
    </IconButton>
  );
};

export default function App() {
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedMode = localStorage.getItem("colorMode") as
      | "light"
      | "dark"
      | null;
    if (savedMode) {
      setMode(savedMode);
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setMode("dark");
    }
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#1976d2" },
          secondary: { main: mode === "dark" ? "#ff4081" : "#f50057" },
          background: {
            default: mode === "dark" ? "#121212" : "#f5f5f5",
            paper: mode === "dark" ? "#1e1e1e" : "#ffffff",
          },
        },
      }),
    [mode]
  );

  const toggleColorMode = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("colorMode", newMode);
  };

  return (
    <Provider store={store}>
      <AppThemeContext.Provider value={{ toggleColorMode }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider
            maxSnack={3}
            autoHideDuration={3000}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Container maxWidth="xl" sx={{ paddingTop: 4, paddingBottom: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: 2,
                }}
              >
                <ThemeToggle />
              </Box>

              {/* Error boundary wrapping the dashboard */}
              <ErrorBoundary>
                <DashboardPage />
              </ErrorBoundary>
            </Container>
          </SnackbarProvider>
        </ThemeProvider>
      </AppThemeContext.Provider>
    </Provider>
  );
}
