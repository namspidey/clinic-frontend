import { useState, useEffect } from 'react';
import { api } from './api';
import { useToast } from './useToast.jsx';

function fmtDT(dt) {
  return new Date(dt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
const STATUS = { BOOKED: ['Đã đặt', 'badge-green'], CANCELLED: ['Đã hủy', 'badge-red'], DONE: ['Hoàn thành', 'badge-gray'] };

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(false);
  const { show, Toast }         = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setBookings(await api.myBookings()); } catch { }
    finally { setLoading(false); }
  }

  async function cancel(id) {
    if (!window.confirm('Xác nhận hủy lịch này?')) return;
    try { await api.cancelBooking(id); show('Đã hủy lịch'); load(); }
    catch (e) { show(e.message, 'error'); }
  }

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <>
      <h1 className="page-title">Lịch khám của tôi</h1>
      <p className="page-sub">Theo dõi và quản lý lịch hẹn</p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Bác sĩ</th><th>Thời gian</th><th>Ghi chú</th><th>Trạng thái</th><th></th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && (
              <tr><td colSpan={5}><div className="empty">Chưa có lịch khám nào</div></td></tr>
            )}
            {bookings.map(b => {
              const [label, cls] = STATUS[b.status] || [b.status, 'badge-gray'];
              return (
                <tr key={b.id}>
                  <td><strong>{b.doctorName}</strong></td>
                  <td style={{ fontSize: '.82rem' }}>{fmtDT(b.startTime)}<br /><span style={{ color: 'var(--muted)' }}>{fmtDT(b.endTime)}</span></td>
                  <td style={{ color: 'var(--muted)', fontSize: '.82rem' }}>{b.note || '—'}</td>
                  <td><span className={`badge ${cls}`}>{label}</span></td>
                  <td>{b.status === 'BOOKED' && <button className="btn btn-danger" onClick={() => cancel(b.id)}>Hủy</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {Toast}
    </>
  );
}