import axios from 'axios';

const API_URL = 'http://localhost:3333/cameras-db';

export async function getCameras() {
  const res = await axios.get(API_URL);
  return res.data;
}

export async function addCamera(camera) {
  const res = await axios.post(API_URL, camera);
  return res.data;
}

export async function updateCamera(id, camera) {
  const res = await axios.put(`${API_URL}/${id}`, camera);
  return res.data;
}

export async function deleteCamera(id) {
  await axios.delete(`${API_URL}/${id}`);
}
