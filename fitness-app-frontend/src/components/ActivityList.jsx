import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Grid, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import TimerIcon from '@mui/icons-material/Timer';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { getActivities } from '../services/api';

const getActivityEmoji = (type) => {
  switch (type) {
    case 'RUNNING': return '🏃‍♂️';
    case 'CYCLING': return '🚴‍♂️';
    case 'SWIMMING': return '🏊‍♂️';
    case 'YOGA': return '🧘‍♀️';
    case 'WEIGHT_TRAINING': return '🏋️‍♂️';
    case 'HIIT': return '⚡';
    default: return '🏋️‍♂️';
  }
};

const ActivityList = () => {
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

  const fetchActivities = async () => {
    try {
      const response = await getActivities();
      if (response && response.data) {
        setActivities(response.data);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Grid container spacing={2.5}>
      {activities.length === 0 ? (
        <Grid item xs={12}>
          <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 4 }}>
            No activities logged yet. Click "Log Session" to add your first workout!
          </Typography>
        </Grid>
      ) : (
        activities.map((activity) => (
          <Grid item xs={12} sm={6} md={4} key={activity.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  border: '1px solid rgba(33, 203, 243, 0.4)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                }
              }}
              onClick={() => navigate(`/activities/${activity.id}`)}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Chip 
                    label={`${getActivityEmoji(activity.type)} ${activity.type}`} 
                    sx={{ 
                      fontWeight: 700, 
                      backgroundColor: 'rgba(255, 107, 107, 0.15)',
                      color: '#FF6B6B',
                      borderRadius: '12px' 
                    }} 
                  />
                  <ArrowForwardIosIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }} />
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TimerIcon sx={{ fontSize: 18, color: '#4ECDC4' }} />
                    <Typography variant="body2" color="textSecondary">
                      {activity.duration} mins
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <LocalFireDepartmentIcon sx={{ fontSize: 18, color: '#FF6B6B' }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>
                      {activity.caloriesBurned} kcal
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default ActivityList;