import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { getActivityDetail } from '../services/api';
import { Box, Card, CardContent, Divider, Typography, Chip, Button, Stack, Paper, CircularProgress, Grid } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import TimerIcon from '@mui/icons-material/Timer';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PsychologyIcon from '@mui/icons-material/Psychology';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SpaIcon from '@mui/icons-material/Spa';

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivityDetail = async () => {
      try {
        setLoading(true);
        const response = await getActivityDetail(id);
        setRecommendation(response.data);
      } catch (err) {
        console.error(err);
        setError("AI recommendation is currently being processed by the LangChain4j engine. Please refresh in a few seconds.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivityDetail();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
        <CircularProgress color="secondary" size={48} />
        <Typography sx={{ mt: 2, color: '#aaa' }}>Connecting to LangChain4j & Gemini Dual-Domain RAG AI Engine...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/')} 
        sx={{ mb: 3, color: '#90caf9' }}
      >
        Back to Activities
      </Button>

      {/* Activity Overview Header Card */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff', borderRadius: 3, boxShadow: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FitnessCenterIcon sx={{ color: '#38bdf8', fontSize: 32 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {recommendation?.activityType || "Workout Session"}
              </Typography>
            </Box>
            <Chip 
              icon={<AutoAwesomeIcon sx={{ color: '#f59e0b !important' }} />} 
              label="LangChain4j Dual RAG (Workouts + Diet)" 
              sx={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid #f59e0b', fontWeight: 600 }}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimerIcon sx={{ color: '#94a3b8' }} />
              <Typography variant="body1">
                <strong>Duration:</strong> {recommendation?.duration || 35} mins
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalFireDepartmentIcon sx={{ color: '#f87171' }} />
              <Typography variant="body1">
                <strong>Calories Burned:</strong> {recommendation?.caloriesBurned || 380} kcal
              </Typography>
            </Box>
            {recommendation?.createdAt && (
              <Typography variant="body2" sx={{ color: '#94a3b8', alignSelf: 'center' }}>
                Logged: {new Date(recommendation.createdAt).toLocaleString()}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* AI Recommendation Details */}
      {recommendation ? (
        <Stack spacing={3}>
          {/* 1. Exercise Science & Performance Card */}
          <Card sx={{ background: '#1e293b', color: '#f8fafc', borderRadius: 3, boxShadow: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <PsychologyIcon sx={{ color: '#a855f7', fontSize: 34 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Exercise Science & Biomechanics Analysis
                </Typography>
              </Box>

              <Paper sx={{ p: 2.5, mb: 3, background: 'rgba(15, 23, 42, 0.6)', color: '#e2e8f0', borderRadius: 2, borderLeft: '4px solid #a855f7' }}>
                <Typography paragraph sx={{ whitespace: 'pre-line', mb: 0, lineHeight: 1.7 }}>
                  {recommendation.recommendation || "No analysis generated yet."}
                </Typography>
              </Paper>

              <Divider sx={{ my: 3, borderColor: '#334155' }} />

              {/* Improvements Section */}
              {recommendation.improvements?.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <TrendingUpIcon sx={{ color: '#34d399' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#34d399' }}>
                      Key Technique & Performance Adjustments
                    </Typography>
                  </Box>
                  <Stack spacing={1}>
                    {recommendation.improvements.map((item, idx) => (
                      <Paper key={idx} sx={{ p: 1.5, background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#e2e8f0', borderRadius: 2 }}>
                        <Typography variant="body2">• {item}</Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Workout Suggestions */}
              {recommendation.suggestions?.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#38bdf8', mb: 1.5 }}>
                    Recommended Next Training Sessions
                  </Typography>
                  <Stack spacing={1}>
                    {recommendation.suggestions.map((item, idx) => (
                      <Paper key={idx} sx={{ p: 1.5, background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#e2e8f0', borderRadius: 2 }}>
                        <Typography variant="body2">• {item}</Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Safety Guidelines */}
              {recommendation.safety?.length > 0 && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <SecurityIcon sx={{ color: '#fb7185' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#fb7185' }}>
                      Safety & Overtraining Prevention
                    </Typography>
                  </Box>
                  <Stack spacing={1}>
                    {recommendation.safety.map((item, idx) => (
                      <Paper key={idx} sx={{ p: 1.5, background: 'rgba(251, 113, 133, 0.08)', border: '1px solid rgba(251, 113, 133, 0.3)', color: '#e2e8f0', borderRadius: 2 }}>
                        <Typography variant="body2">• {item}</Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* 2. Sports Diet & Nutrition Strategy Card */}
          <Card sx={{ background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)', color: '#f8fafc', borderRadius: 3, boxShadow: 4, border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <RestaurantIcon sx={{ color: '#34d399', fontSize: 34 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  AI Sports Nutrition & Fueling Plan
                </Typography>
              </Box>

              {recommendation.dietGuidance && (
                <Paper sx={{ p: 2.5, mb: 3, background: 'rgba(6, 78, 59, 0.5)', color: '#e2e8f0', borderRadius: 2, borderLeft: '4px solid #34d399' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#6ee7b7', mb: 1 }}>
                    Post-Workout Anabolic Fueling & Glycogen Restoration
                  </Typography>
                  <Typography paragraph sx={{ whitespace: 'pre-line', mb: 0, lineHeight: 1.7 }}>
                    {recommendation.dietGuidance}
                  </Typography>
                </Paper>
              )}

              {/* Hydration & Electrolytes */}
              {recommendation.hydrationPlan && (
                <Paper sx={{ p: 2.5, mb: 3, background: 'rgba(14, 116, 144, 0.3)', color: '#e2e8f0', borderRadius: 2, borderLeft: '4px solid #38bdf8' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <WaterDropIcon sx={{ color: '#38bdf8' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#7dd3fc' }}>
                      Hydration & Electrolyte Replenishment
                    </Typography>
                  </Box>
                  <Typography paragraph sx={{ whitespace: 'pre-line', mb: 0, lineHeight: 1.7 }}>
                    {recommendation.hydrationPlan}
                  </Typography>
                </Paper>
              )}

              {/* Nutrition Tips */}
              {recommendation.nutritionTips?.length > 0 && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <SpaIcon sx={{ color: '#a7f3d0' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#a7f3d0' }}>
                      Key Micronutrient & Recovery Tips
                    </Typography>
                  </Box>
                  <Stack spacing={1}>
                    {recommendation.nutritionTips.map((tip, idx) => (
                      <Paper key={idx} sx={{ p: 1.5, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#e2e8f0', borderRadius: 2 }}>
                        <Typography variant="body2">• {tip}</Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        </Stack>
      ) : (
        <Card sx={{ p: 3, background: '#1e293b', color: '#f8fafc' }}>
          <Typography>{error || "No recommendation available for this activity."}</Typography>
        </Card>
      )}
    </Box>
  );
};

export default ActivityDetail;