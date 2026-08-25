import React, { useEffect, useState } from 'react';
import { 
  Box, Container, Typography, Grid, Button, Chip, CircularProgress, 
  Paper, IconButton, Dialog, DialogTitle, DialogContent, Tooltip, Alert, Stack
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import TimerIcon from '@mui/icons-material/Timer';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import LayersIcon from '@mui/icons-material/Layers';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LiveStatsCard from './LiveStatsCard';
import ActivityList from './ActivityList';
import ActivityForm from './ActivityForm';
import RagChunkExplorer from './RagChunkExplorer';
import { getLiveStats, getUserRecommendations } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalCaloriesBurned: 0,
    totalDurationMinutes: 0,
    activeStreakDays: 0,
    averageCaloriesPerSession: 0,
    lastRefreshedTimestamp: Date.now()
  });

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openRagModal, setOpenRagModal] = useState(false);
  const [aiOverview, setAiOverview] = useState(null);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const statsRes = await getLiveStats();
      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      }
      const aiRes = await getUserRecommendations();
      if (aiRes && aiRes.data && aiRes.data.length > 0) {
        setAiOverview(aiRes.data[0]);
      }
    } catch (err) {
      console.error("Error fetching live dashboard metrics:", err);
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // 5-second automatic refresh timer loop
  useEffect(() => {
    fetchDashboardData();

    const refreshInterval = setInterval(() => {
      fetchDashboardData();
      setCountdown(5);
    }, 5000);

    const countdownTimer = setInterval(() => {
      setCountdown(prev => (prev > 1 ? prev - 1 : 5));
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownTimer);
    };
  }, []);

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 6 }}>
      {/* Header & Live Indicator */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={4}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Fitness Platform Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Microservices Real-time Performance & Dual-Domain RAG (Workouts + Diet)
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Chip 
            icon={<span className="pulse-dot" />} 
            label={`LIVE AUTO-REFRESH (${countdown}s)`} 
            color="success" 
            variant="outlined" 
            sx={{ fontWeight: 700, borderRadius: '20px', py: 2 }} 
          />
          <Tooltip title="Trigger Manual Sync">
            <IconButton onClick={fetchDashboardData} color="primary" sx={{ border: '1px solid rgba(255,255,255,0.2)' }}>
              <RefreshIcon className={isRefreshing ? "spin-animation" : ""} />
            </IconButton>
          </Tooltip>
          <Button 
            variant="outlined"
            startIcon={<LayersIcon />}
            onClick={() => setOpenRagModal(true)}
            sx={{ 
              borderRadius: '24px', 
              px: 2.5, 
              py: 1.2,
              fontWeight: 700,
              borderColor: '#38bdf8',
              color: '#38bdf8',
              '&:hover': {
                borderColor: '#0ea5e9',
                background: 'rgba(56, 189, 248, 0.1)'
              }
            }}
          >
            RAG Chunk Explorer
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpenAddModal(true)}
            sx={{ 
              borderRadius: '24px', 
              px: 3, 
              py: 1.2,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
              boxShadow: '0 4px 20px rgba(33, 203, 243, 0.4)' 
            }}
          >
            Log Session
          </Button>
        </Box>
      </Box>

      {/* AI Recommendation Banner */}
      {aiOverview && (
        <Alert 
          icon={<AutoAwesomeIcon sx={{ color: '#FFD700' }} />}
          severity="info"
          sx={{ 
            mb: 4, 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, rgba(63,81,181,0.18) 0%, rgba(16,185,129,0.18) 100%)', 
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#fff'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFD700', mb: 0.5 }}>
            Gemini AI + LangChain4j Dual RAG Coach Insight:
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {aiOverview.recommendation}
          </Typography>
          {aiOverview.dietGuidance && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <RestaurantIcon sx={{ color: '#34d399', fontSize: 18 }} />
              <Typography variant="caption" sx={{ color: '#6ee7b7', fontWeight: 600 }}>
                Nutrition Target: {aiOverview.dietGuidance}
              </Typography>
            </Stack>
          )}
        </Alert>
      )}

      {/* Live Metrics Grid */}
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} sm={6} md={3}>
          <LiveStatsCard 
            title="TOTAL CALORIES BURNED"
            value={stats.totalCaloriesBurned?.toLocaleString() || 0}
            unit="kcal"
            icon={<LocalFireDepartmentIcon />}
            color="#FF6B6B"
            subtitle={`${stats.averageCaloriesPerSession || 0} kcal / session avg`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <LiveStatsCard 
            title="TOTAL WORKOUT DURATION"
            value={stats.totalDurationMinutes || 0}
            unit="mins"
            icon={<TimerIcon />}
            color="#4ECDC4"
            subtitle="Active aerobic & strength training"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <LiveStatsCard 
            title="SESSIONS COMPLETED"
            value={stats.totalWorkouts || 0}
            unit="workouts"
            icon={<FitnessCenterIcon />}
            color="#45B7D1"
            subtitle="Logged via Activity Microservice"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <LiveStatsCard 
            title="ACTIVE STREAK"
            value={stats.activeStreakDays || 0}
            unit="days"
            icon={<AutoAwesomeIcon />}
            color="#96CEB4"
            subtitle="Consistent activity target reached"
          />
        </Grid>
      </Grid>

      {/* Recent Activities Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: '24px', 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px solid rgba(255,255,255,0.08)' 
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Recent Activity Sessions & AI Insights
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Updates in real-time every 5 seconds
          </Typography>
        </Box>

        <ActivityList />
      </Paper>

      {/* Log Activity Modal */}
      <Dialog 
        open={openAddModal} 
        onClose={() => setOpenAddModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: '#1a1f36',
            color: '#fff',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Log New Workout Session</DialogTitle>
        <DialogContent>
          <ActivityForm onActivitiesAdded={() => {
            setOpenAddModal(false);
            fetchDashboardData();
          }} />
        </DialogContent>
      </Dialog>

      {/* RAG Knowledge Base & Chunking Explorer Dialog */}
      <RagChunkExplorer 
        open={openRagModal} 
        onClose={() => setOpenRagModal(false)} 
      />
    </Container>
  );
};

export default Dashboard;
