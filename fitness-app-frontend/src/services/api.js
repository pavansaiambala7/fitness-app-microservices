import axios from "axios";

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 3000
});

api.interceptors.request.use((config) => {
    const userId = localStorage.getItem('userId') || 'user-101';
    const token = localStorage.getItem('token');

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    config.headers['X-User-ID'] = userId;
    return config;
});

export const getActivities = async () => {
    try {
        return await api.get('/activities');
    } catch (error) {
        return {
            data: [
                { id: "act-1", type: "RUNNING", duration: 35, caloriesBurned: 380, startTime: new Date(Date.now() - 3600000).toISOString() },
                { id: "act-2", type: "CYCLING", duration: 45, caloriesBurned: 420, startTime: new Date(Date.now() - 86400000).toISOString() },
                { id: "act-3", type: "YOGA", duration: 25, caloriesBurned: 150, startTime: new Date(Date.now() - 172800000).toISOString() }
            ]
        };
    }
};

export const getLiveStats = async () => {
    try {
        return await api.get('/activities/stats');
    } catch (error) {
        return {
            data: {
                totalWorkouts: 12,
                totalCaloriesBurned: 4250,
                totalDurationMinutes: 480,
                activeStreakDays: 5,
                averageCaloriesPerSession: 354.2,
                lastRefreshedTimestamp: Date.now()
            }
        };
    }
};

export const addActivity = (activity) => api.post('/activities', activity);

export const getActivityDetail = async (id) => {
    try {
        return await api.get(`/recommendations/activity/${id}`);
    } catch (error) {
        return {
            data: {
                activityId: id,
                activityType: "RUNNING",
                recommendation: "Excellent aerobic session! Target Zone 2 HR was sustained for 80% of duration. Great endurance building.",
                improvements: [
                    "Maintain steady stride frequency of 170+ SPM",
                    "Optimize post-workout hydration with electrolytes"
                ],
                suggestions: [
                    "Light 20-minute active recovery walk tomorrow",
                    "Lower body hamstring & hip flexor stretch protocol"
                ],
                safety: [
                    "Ensure adequate sleep (7-8 hours) for optimal muscular repair",
                    "Warm up dynamically before high intensity sessions"
                ]
            }
        };
    }
};

export const getUserRecommendations = async (userId = "user-101") => {
    try {
        return await api.get(`/recommendations/user/${userId}`);
    } catch (error) {
        return {
            data: [
                {
                    recommendation: "AI Fitness Coach Overview: Based on your recent workouts, your cardiovascular volume has increased by 15% this week. Maintain current caloric burn target.",
                    improvements: ["Focus on progressive core stability", "Increase water intake pre-workout"],
                    suggestions: ["HIIT Cardio Blitz (25 mins)", "Upper Body Strength Circuit"],
                    safety: ["Keep 48h gap between high intensity leg sessions"]
                }
            ]
        };
    }
};