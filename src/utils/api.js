/**
 * API client for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const uploadMetrics = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = 'Upload failed';
    try {
      const error = await response.json();
      errorMessage = error.error || errorMessage;
    } catch (e) {
      // Response wasn't JSON, use status text
      errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

export const getMetrics = async () => {
  const response = await fetch(`${API_BASE_URL}/metrics`);

  if (!response.ok) {
    throw new Error('Failed to fetch metrics');
  }

  const result = await response.json();
  return result.data; // Returns NDJSON content or null
};

export const clearMetrics = async () => {
  const response = await fetch(`${API_BASE_URL}/metrics`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to clear metrics');
  }

  return response.json();
};

