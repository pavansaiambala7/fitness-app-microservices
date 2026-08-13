import { Box, Button, Typography, Container, AppBar, Toolbar } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "react-oauth2-code-pkce";
import { useDispatch } from "react-redux";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { setCredentials } from "./store/authSlice";
import Dashboard from "./components/Dashboard";
import ActivityDetail from "./components/ActivityDetail";

function App() {
  const authContext = useContext(AuthContext);
  const token = authContext?.token || "demo-token";
  const tokenData = authContext?.tokenData || { name: "Pavan Sai Ambala", preferred_username: "pavansaiambala7p" };
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      if (dispatch) dispatch(setCredentials({ token, user: tokenData }));
      localStorage.setItem('userId', 'user-101');
    }
  }, [token, tokenData, dispatch]);

  return (
    <Router>
      <Box sx={{ minHeight: '100vh', background: '#0a0e1a', color: '#fff' }}>
        <AppBar position="static" sx={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" sx={{ fontWeight: 800, background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                FITNESS PLATFORM
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" color="textSecondary">
                User: <strong>Pavan Sai Ambala</strong>
              </Typography>
              {authContext?.logOut && (
                <Button variant="outlined" color="inherit" size="small" onClick={authContext.logOut} sx={{ borderRadius: '12px' }}>
                  Logout
                </Button>
              )}
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ pt: 3, pb: 6 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/activities" element={<Dashboard />} />
            <Route path="/activities/:id" element={<ActivityDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default App;

