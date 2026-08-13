import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const LiveStatsCard = ({ title, value, unit, icon, color = "#3f51b5", subtitle }) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 36px 0 ${color}33`,
        }
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 600, letterSpacing: '0.5px' }}>
            {title}
          </Typography>
          <Box 
            sx={{ 
              p: 1, 
              borderRadius: '12px', 
              backgroundColor: `${color}22`, 
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>

        <Typography variant="h3" sx={{ fontWeight: 700, my: 1, color: '#fff' }}>
          {value} <Typography component="span" variant="h6" color="textSecondary">{unit}</Typography>
        </Typography>

        {subtitle && (
          <Typography variant="caption" sx={{ color: color, fontWeight: 500 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveStatsCard;
