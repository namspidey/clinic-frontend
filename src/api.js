const BASE = 'https://clinic-backend-nvos.onrender.com/api/v1';

function headers() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Lỗi không xác định');
  return data;
}

export const api = {
  login:          (body)         => request('POST',  '/auth/login', body),
  register:       (body)         => request('POST',  '/auth/register', body),
  getDoctors:     (params = '')  => request('GET',   `/doctors?${params}`),
  getSchedules:   (doctorId)     => request('GET',   `/doctors/${doctorId}/schedules`),
  createBooking:  (body)         => request('POST',  '/bookings', body),
  myBookings:     ()             => request('GET',   '/bookings/my'),
  cancelBooking:  (id)           => request('PATCH', `/bookings/${id}/cancel`),
  doctorBookings: ()             => request('GET',   '/bookings/doctor'),
  markDone:       (id)           => request('PATCH', `/bookings/${id}/done`),
  getBookedSlots: (doctorId, date) => request('GET', `/bookings/doctor/${doctorId}/slots?date=${date}`),
};