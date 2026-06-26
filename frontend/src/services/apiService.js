import { getAuth } from 'firebase/auth';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

const getHeaders = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const getFeed = async () => {
  const response = await fetch(`${API_URL}/feed`, {
    headers: await getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch feed');
  return response.json();
};

export const createPost = async (body, type = 'post', mediaUrl = null) => {
  const response = await fetch(`${API_URL}/feed`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ body, type, media_url: mediaUrl })
  });
  if (!response.ok) throw new Error('Failed to create post');
  return response.json();
};

export const getMatches = async () => {
  const response = await fetch(`${API_URL}/connections/matches`, {
    headers: await getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch matches');
  return response.json();
};

export const getRecommendations = async () => {
  const response = await fetch(`${API_URL}/connections/recommendations`, {
    headers: await getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch recommendations');
  return response.json();
};

export const getAllUsers = async (identity = null) => {
  let url = `${API_URL}/connections/all-users`;
  if (identity) {
    url += `?identity=${identity}`;
  }
  const response = await fetch(url, {
    headers: await getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const requestConnection = async (receiverId) => {
  const response = await fetch(`${API_URL}/connections/request`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ receiverId })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to request connection');
  }
  return response.json();
};

export const getPendingRequests = async () => {
  const response = await fetch(`${API_URL}/connections/requests`, {
    headers: await getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch pending requests');
  return response.json();
};

export const getAcceptedConnections = async () => {
  const response = await fetch(`${API_URL}/connections/accepted`, {
    headers: await getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch connections');
  return response.json();
};

export const acceptConnection = async (connectionId) => {
  const response = await fetch(`${API_URL}/connections/accept`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ connectionId })
  });
  if (!response.ok) throw new Error('Failed to accept connection');
  return response.json();
};

export const rejectConnection = async (connectionId) => {
  const response = await fetch(`${API_URL}/connections/reject`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ connectionId })
  });
  if (!response.ok) throw new Error('Failed to reject connection');
  return response.json();
};

export const getPointsSummary = async (userId) => {
  const response = await fetch(`${API_URL}/points/${userId}`, {
    headers: await getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch points summary');
  return response.json();
};

export const getLeaderboard = async () => {
  const response = await fetch(`${API_URL}/points/leaderboard`, {
    headers: await getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch leaderboard');
  return response.json();
};

export const getThreads = async () => {
  const response = await fetch(`${API_URL}/messages/threads`, {
    headers: await getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch threads');
  return response.json();
};

export const getMessages = async (threadId) => {
  const response = await fetch(`${API_URL}/messages/${threadId}`, {
    headers: await getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch messages');
  return response.json();
};

export const sendMessage = async (receiverId, content, type = 'text', mediaUrl = null, transcription = null) => {
  const response = await fetch(`${API_URL}/messages/send`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ receiverId, content, type, mediaUrl, transcription })
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
};

export const uploadChatMedia = async (fileBase64, resourceType = 'auto') => {
  const response = await fetch(`${API_URL}/messages/upload`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ file: fileBase64, resourceType })
  });
  if (!response.ok) throw new Error('Failed to upload media');
  return response.json();
};

