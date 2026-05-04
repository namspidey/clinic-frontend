import { useState, useEffect } from 'react';
import { api } from './api';
import { useToast } from './useToast.jsx';

function fmtDT(dt) {
  return new Date(dt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const STATUS = { BOOKED: ['Đã đặt', 'badge-green'], CANCELLED: ['Đã hủy', 'badge-red'], DONE: ['Hoàn thành', 'badge-gray'] };

export default function DoctorPage() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter]     = useState('');
  const [loading, setLoading]   = useState(false);
  const { show, Toast }         = useToast();

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setBookings(await api.doctorBookings()); } catch { }
    finally { setLoading(false); }
  }

  async function markDone(id) {
    try { await api.markDone(id); show('✓ Đã đánh dấu hoàn thành'); load(); }
    catch (e) { show(e.message, 'error'); }
  }

  const todayB = bookings.filter(b => b.startTime?.slice(0, 10) === today && b.status !== 'CANCELLED');
  const shown  = filter ? bookings.filter(b => b.status === filter) : bookings;

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <>
      <h1 className="page-title">Xin chào, bác sĩ 👋</h1>
      <p className="page-sub">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <div className="stats-row">
        <div className="stat"><div className="val">{todayB.length}</div><div className="lbl">Lịch hôm nay</div></div>
        <div className="stat"><div className="val">{todayB.filter(b => b.status === 'DONE').length}</div><div className="lbl">Đã khám</div></div>
        <div className="stat"><div className="val">{todayB.filter(b => b.status === 'BOOKED').length}</div><div className="lbl">Còn lại</div></div>
      </div>

      <div className="filter-bar" style={{ marginBottom: '1rem' }}>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ flex: 'none', width: 'auto' }}>
          <option value="">Tất cả trạng thái</option>
          <option value="BOOKED">Đã đặt</option>
          <option value="DONE">Hoàn thành</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Bệnh nhân</th><th>Thời gian</th><th>Ghi chú</th><th>Trạng thái</th><th></th></tr>
          </thead>
          <tbody>
            {shown.length === 0 && <tr><td colSpan={5}><div className="empty">Không có lịch nào</div></td></tr>}
            {shown.sort((a, b) => b.startTime?.localeCompare(a.startTime)).map(b => {
              const [label, cls] = STATUS[b.status] || [b.status, 'badge-gray'];
              return (
                <tr key={b.id}>
                  <td><strong>{b.patientName}</strong></td>
                  <td style={{ fontSize: '.82rem' }}>{fmtDT(b.startTime)}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '.82rem', maxWidth: 160 }}>{b.note || '—'}</td>
                  <td><span className={`badge ${cls}`}>{label}</span></td>
                  <td>{b.status === 'BOOKED' && <button className="btn btn-sm btn-outline" onClick={() => markDone(b.id)}>✓ Hoàn thành</button>}</td>
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