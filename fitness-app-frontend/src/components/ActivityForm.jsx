import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import React, { useState } from 'react';
import { addActivity } from '../services/api';

const ActivityForm = ({ onActivityAdded, onActivitiesAdded }) => {
    const [activity, setActivity] = useState({
        type: "RUNNING", 
        duration: '', 
        caloriesBurned: '',
        additionalMetrics: {}
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...activity,
                duration: parseInt(activity.duration, 10) || 30,
                caloriesBurned: parseInt(activity.caloriesBurned, 10) || 250,
                startTime: new Date().toISOString()
            };
            await addActivity(payload);
            
            if (onActivityAdded) onActivityAdded();
            if (onActivitiesAdded) onActivitiesAdded();
            
            setActivity({ type: "RUNNING", duration: '', caloriesBurned: '', additionalMetrics: {} });
        } catch (error) {
            console.error("Error submitting activity:", error);
            if (onActivityAdded) onActivityAdded();
            if (onActivitiesAdded) onActivitiesAdded();
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ py: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel sx={{ color: '#aaa' }}>Activity Type</InputLabel>
                <Select
                    value={activity.type}
                    label="Activity Type"
                    onChange={(e) => setActivity({ ...activity, type: e.target.value })}
                    sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                >
                    <MenuItem value="RUNNING">🏃‍♂️ Running</MenuItem>
                    <MenuItem value="CYCLING">🚴‍♂️ Cycling</MenuItem>
                    <MenuItem value="SWIMMING">🏊‍♂️ Swimming</MenuItem>
                    <MenuItem value="YOGA">🧘‍♀️ Yoga & Stretch</MenuItem>
                    <MenuItem value="WEIGHT_TRAINING">🏋️‍♂️ Weight Training</MenuItem>
                    <MenuItem value="HIIT">⚡ HIIT Cardio</MenuItem>
                    <MenuItem value="WALKING">🚶‍♂️ Walking</MenuItem>
                </Select>
            </FormControl>

            <TextField 
                fullWidth
                label="Duration (Minutes)"
                type="number"
                required
                sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#aaa' }, fieldset: { borderColor: 'rgba(255,255,255,0.2)' } }}
                value={activity.duration}
                onChange={(e) => setActivity({ ...activity, duration: e.target.value })}
            />

            <TextField 
                fullWidth
                label="Calories Burned (kcal)"
                type="number"
                required
                sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#aaa' }, fieldset: { borderColor: 'rgba(255,255,255,0.2)' } }}
                value={activity.caloriesBurned}
                onChange={(e) => setActivity({ ...activity, caloriesBurned: e.target.value })}
            />

            <Button 
                type="submit" 
                variant="contained" 
                fullWidth
                size="large"
                sx={{ 
                    mt: 1, 
                    py: 1.5, 
                    borderRadius: '12px',
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)'
                }}
            >
                Log Session & Generate AI Feedback
            </Button>
        </Box>
    );
};

export default ActivityForm;