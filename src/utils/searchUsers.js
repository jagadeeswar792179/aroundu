import api from "./api";

export const searchUsers = async (server, token, q) => {
  if (!q.trim()) return [];

  const [students, professors] = await Promise.all([
    api.get(`${server}/api/search/students`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { q },
    }),
    api.get(`${server}/api/search/professors`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { q },
    }),
  ]);

  return [...students.data.results, ...professors.data.results];
};
