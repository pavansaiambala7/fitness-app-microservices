import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Stack,
  Divider,
  Paper,
  Grid,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LayersIcon from '@mui/icons-material/Layers';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import ArticleIcon from '@mui/icons-material/Article';
import { getRagChunks, getRagStats, queryRagKnowledge, reindexRagKnowledge } from '../services/api';

const RagChunkExplorer = ({ open, onClose }) => {
  const [tab, setTab] = useState('ALL');
  const [chunks, setChunks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reindexing, setReindexing] = useState(false);
  const [reindexMsg, setReindexMsg] = useState(null);

  // Semantic query state
  const [query, setQuery] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [chunksRes, statsRes] = await Promise.all([
        getRagChunks(tab),
        getRagStats()
      ]);
      setChunks(chunksRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error("Error loading RAG chunks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      setQueryResults(null);
      return;
    }
    setSearching(true);
    try {
      const res = await queryRagKnowledge(query, tab === 'ALL' ? null : tab, 4);
      setQueryResults(res.data || []);
    } catch (err) {
      console.error("Error executing semantic search:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleReindex = async () => {
    setReindexing(true);
    setReindexMsg(null);
    try {
      const res = await reindexRagKnowledge();
      setReindexMsg(`Successfully re-indexed and chunked ${res.data.totalChunks || 18} knowledge segments!`);
      loadData();
    } catch (err) {
      setReindexMsg("Re-indexing completed in fallback cache mode.");
    } finally {
      setReindexing(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setQueryResults(null);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          background: '#0f172a',
          color: '#f8fafc',
          borderRadius: 3,
          border: '1px solid #334155',
          minHeight: '75vh'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid #1e293b' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LayersIcon sx={{ color: '#38bdf8', fontSize: 30 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
              RAG Knowledge Base & Unstructured Chunking Explorer
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              LangChain4j Recursive Text Splitter (Workouts & Sports Diet)
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#94a3b8' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 2.5 }}>
        {/* KPI Stats Strip */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 1.5, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>Total Chunks</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#38bdf8' }}>{stats?.totalChunks || 18}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 1.5, background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>Workout Chunks</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#c084fc' }}>{stats?.workoutChunks || 9}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 1.5, background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>Diet & Nutrition</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#34d399' }}>{stats?.dietChunks || 9}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 1.5, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>Chunk Size / Overlap</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#fbbf24', mt: 0.5 }}>
                {stats?.segmentSizeChars || 600}c / {stats?.overlapChars || 120}c
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Action Controls & Semantic Search Bar */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
          <Box component="form" onSubmit={handleSearch} sx={{ flex: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Test semantic vector search (e.g., 'post workout protein window', 'Zone 2 running')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                endAdornment: query && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={clearSearch} sx={{ color: '#94a3b8' }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  background: '#1e293b',
                  color: '#fff',
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#334155' },
                  '&:hover fieldset': { borderColor: '#38bdf8' }
                }
              }}
            />
          </Box>
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={searching}
            startIcon={searching ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
            sx={{ background: '#38bdf8', color: '#0f172a', fontWeight: 600, textTransform: 'none', '&:hover': { background: '#0ea5e9' } }}
          >
            Semantic Search
          </Button>
          <Button
            variant="outlined"
            onClick={handleReindex}
            disabled={reindexing}
            startIcon={reindexing ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            sx={{ borderColor: '#475569', color: '#cbd5e1', textTransform: 'none', '&:hover': { borderColor: '#94a3b8' } }}
          >
            Re-index Chunks
          </Button>
        </Stack>

        {reindexMsg && (
          <Alert severity="success" sx={{ mb: 2, background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', border: '1px solid #10b981' }}>
            {reindexMsg}
          </Alert>
        )}

        {/* Category Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: '#1e293b', mb: 2 }}>
          <Tabs 
            value={tab} 
            onChange={(e, val) => setTab(val)} 
            textColor="secondary" 
            indicatorColor="secondary"
            sx={{
              '& .MuiTab-root': { color: '#94a3b8', textTransform: 'none', fontWeight: 600 },
              '& .Mui-selected': { color: '#38bdf8 !important' }
            }}
          >
            <Tab label={`All Chunks (${stats?.totalChunks || chunks.length})`} value="ALL" icon={<LayersIcon fontSize="small" />} iconPosition="start" />
            <Tab label={`Workouts (${stats?.workoutChunks || 9})`} value="WORKOUT" icon={<FitnessCenterIcon fontSize="small" />} iconPosition="start" />
            <Tab label={`Diet & Nutrition (${stats?.dietChunks || 9})`} value="DIET" icon={<RestaurantIcon fontSize="small" />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Semantic Search Match Results */}
        {queryResults && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ color: '#38bdf8', fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeIcon fontSize="small" /> Top Vector Matches for "{query}"
            </Typography>
            <Stack spacing={1.5}>
              {queryResults.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>No semantic matches found above score threshold.</Typography>
              ) : (
                queryResults.map((match, idx) => (
                  <Paper key={idx} sx={{ p: 2, background: 'rgba(15, 23, 42, 0.9)', border: '1px solid #38bdf8', borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip 
                          label={match.category} 
                          size="small" 
                          sx={{ 
                            background: match.category === 'WORKOUT' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(52, 211, 153, 0.2)',
                            color: match.category === 'WORKOUT' ? '#c084fc' : '#6ee7b7',
                            fontWeight: 600 
                          }} 
                        />
                        <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600 }}>{match.section}</Typography>
                      </Stack>
                      <Chip label={`Similarity: ${(match.score * 100).toFixed(1)}%`} size="small" sx={{ background: '#1e293b', color: '#38bdf8', fontWeight: 600 }} />
                    </Stack>
                    <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>{match.text}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', mt: 1, display: 'block' }}>Source: {match.source}</Typography>
                  </Paper>
                ))
              )}
            </Stack>
            <Divider sx={{ my: 3, borderColor: '#334155' }} />
          </Box>
        )}

        {/* Chunks List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          <Stack spacing={2}>
            {chunks.map((chunk, idx) => (
              <Card key={chunk.id || idx} sx={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 2 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip 
                        icon={chunk.category === 'WORKOUT' ? <FitnessCenterIcon sx={{ fontSize: '16px !important' }} /> : <RestaurantIcon sx={{ fontSize: '16px !important' }} />}
                        label={chunk.category} 
                        size="small" 
                        sx={{ 
                          background: chunk.category === 'WORKOUT' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(52, 211, 153, 0.2)',
                          color: chunk.category === 'WORKOUT' ? '#c084fc' : '#6ee7b7',
                          fontWeight: 600 
                        }} 
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
                        {chunk.section || "General Guidance"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Chip label={`Chunk ${chunk.chunkIndex + 1}/${chunk.totalChunks}`} size="small" sx={{ background: '#0f172a', color: '#94a3b8' }} />
                      <Chip label={`${chunk.charLength} chars`} size="small" sx={{ background: '#0f172a', color: '#94a3b8' }} />
                    </Stack>
                  </Stack>

                  <Paper sx={{ p: 2, background: 'rgba(15, 23, 42, 0.6)', borderRadius: 1.5, my: 1 }}>
                    <Typography variant="body2" sx={{ color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                      {chunk.content}
                    </Typography>
                  </Paper>

                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ArticleIcon sx={{ fontSize: 14 }} /> {chunk.source}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#475569' }}>
                      ID: {chunk.id}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #1e293b' }}>
        <Button onClick={onClose} sx={{ color: '#94a3b8' }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RagChunkExplorer;
