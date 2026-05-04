import { useState, useEffect } from 'react';
import { api } from './api';
import { useToast } from './useToast.jsx';

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16];

function initials(name = '') {
  return name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();
}

function getDates() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function pad(n) { return String(n).padStart(2, '0'); }

function SlotPicker({ doctor, onClose, onSuccess }) {
  const dates = getDates();
  const [selectedDate, setSelectedDate]     = useState(dates[0]);
  const [bookedHours, setBookedHours]       = useState([]);
  const [bookingSlot, setBookingSlot]       = useState(null);
  const [note, setNote]                     = useState('');
  const [loading, setLoading]               = useState(false);
  const [fetchingSlots, setFetchingSlots]   = useState(false);
  const [error, setError]                   = useState('');
  const { show, Toast }                     = useToast();

  useEffect(() => {
    setFetchingSlots(true);
    setBookingSlot(null);
    setError('');
    api.getBookedSlots(doctor.id, selectedDate)
      .then(hours => setBookedHours(hours))
      .catch(() => setBookedHours([]))
      .finally(() => setFetchingSlots(false));
  }, [doctor.id, selectedDate]);

  async function confirmBook(hour) {
    setError(''); setLoading(true);
    const startTime = `${selectedDate}T${pad(hour)}:00:00`;
    const endTime   = `${selectedDate}T${pad(hour + 1)}:00:00`;
    try {
      await api.createBooking({ doctorId: doctor.id, startTime, endTime, note });
      setBookedHours(h => [...h, hour]);
      setBookingSlot(null);
      setNote('');
      show('Dat lich thanh cong!');
      setTimeout(onSuccess, 1200);
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{doctor.fullName}</div>
            <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: 2 }}>
              {doctor.specialty || 'Da khoa'} {doctor.phone ? '· ' + doctor.phone : ''}
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>X</button>
        </div>

        <div style={{ display: 'flex', gap: '.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {dates.map((d, i) => {
            const label = new Date(d + 'T00:00:00').toLocaleDateString('vi-VN', {
              weekday: 'short', day: '2-digit', month: '2-digit'
            });
            return (
              <button key={d} onClick={() => setSelectedDate(d)} style={{
                padding: '.35rem .75rem', borderRadius: 6, fontSize: '.78rem',
                cursor: 'pointer', border: '1px solid', fontFamily: 'inherit',
                background: selectedDate === d ? 'var(--sage)' : 'var(--surface)',
                color: selectedDate === d ? '#fff' : 'var(--ink)',
                borderColor: selectedDate === d ? 'var(--sage)' : 'var(--border)',
              }}>
                {i === 0 ? 'Hom nay' : label}
              </button>
            );
          })}
        </div>

        {fetchingSlots ? (
          <div className="loading" style={{ padding: '1.5rem' }}>Dang tai lich...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.6rem', marginBottom: '1rem' }}>
            {HOURS.map(h => {
              const booked = bookedHours.includes(h);
              const active = bookingSlot === h;
              return (
                <button key={h} disabled={booked}
                  onClick={() => { setBookingSlot(active ? null : h); setError(''); }}
                  style={{
                    padding: '.65rem .5rem', borderRadius: 8, fontSize: '.83rem',
                    cursor: booked ? 'not-allowed' : 'pointer', border: '1px solid',
                    fontFamily: 'inherit', transition: 'all .15s', textAlign: 'center',
                    background: booked ? '#f0ede8' : active ? 'var(--sage)' : 'var(--surface)',
                    color: booked ? 'var(--muted)' : active ? '#fff' : 'var(--ink)',
                    borderColor: booked ? 'var(--border)' : active ? 'var(--sage)' : 'var(--border)',
                  }}>
                  <div>{pad(h)}:00 - {pad(h + 1)}:00</div>
                  <div style={{ fontSize: '.7rem', marginTop: 3, opacity: .75 }}>
                    {booked ? 'Da dat' : 'Con trong'}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {bookingSlot !== null && (
          <div style={{
            background: 'rgba(74,124,89,.06)', border: '1px solid rgba(74,124,89,.2)',
            borderRadius: 8, padding: '1rem', marginBottom: '.5rem',
          }}>
            <div style={{ fontSize: '.85rem', fontWeight: 500, marginBottom: '.75rem' }}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}
              {' · '}{pad(bookingSlot)}:00 - {pad(bookingSlot + 1)}:00
            </div>
            <div className="field" style={{ marginBottom: '.6rem' }}>
              <label>Ghi chu trieu chung (tuy chon)</label>
              <textarea placeholder="Mo ta ngan..." value={note}
                onChange={e => setNote(e.target.value)} style={{ minHeight: 60 }} />
            </div>
            {error && <div className="alert alert-error" style={{ marginBottom: '.6rem' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '.6rem' }}>
              <button className="btn btn-outline" onClick={() => setBookingSlot(null)} style={{ flex: 1 }}>Huy</button>
              <button className="btn btn-primary" style={{ flex: 2 }}
                onClick={() => confirmBook(bookingSlot)} disabled={loading}>
                {loading ? 'Dang dat...' : 'Xac nhan dat lich'}
              </button>
            </div>
          </div>
        )}
        {Toast}
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  const [doctors, setDoctors]     = useState([]);
  const [meta, setMeta]           = useState({});
  const [specialty, setSpecialty] = useState('');
  const [page, setPage]           = useState(0);
  const [loading, setLoading]     = useState(false);
  const [selected, setSelected]   = useState(null);
  const { Toast }                 = useToast();

  useEffect(() => {
  load(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [specialty]);

  async function load(p = 0) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, size: 6 });
      if (specialty) params.append('specialty', specialty);
      const data = await api.getDoctors(params.toString());
      setDoctors(data.content);
      setMeta(data);
      setPage(p);
    } catch { }
    finally { setLoading(false); }
  }

  return (
    <>
      <h1 className="page-title">Tim bac si</h1>
      <p className="page-sub">Chon bac si, xem lich trong va dat kham</p>

      <div className="filter-bar">
        <input placeholder="Tim theo chuyen khoa..."
          value={specialty} onChange={e => setSpecialty(e.target.value)} />
      </div>

      {loading ? <div className="loading">Dang tai...</div> : (
        <>
          <div className="grid-3">
            {doctors.length === 0 && <div className="empty">Khong tim thay bac si nao</div>}
            {doctors.map(d => (
              <div className="card" key={d.id} style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                <div style={{ display: 'flex', gap: '.85rem', alignItems: 'center' }}>
                  <div className="avatar">{initials(d.fullName)}</div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{d.fullName}</div>
                    <span className="badge badge-green">{d.specialty || 'Da khoa'}</span>
                  </div>
                </div>
                {d.description && (
                  <div style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.5 }}>{d.description}</div>
                )}
                <button className="btn btn-primary" style={{ marginTop: 'auto' }} onClick={() => setSelected(d)}>
                  Xem lich &amp; Dat kham
                </button>
              </div>
            ))}
          </div>

          {meta.totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={page === 0} onClick={() => load(page - 1)}>prev</button>
              {Array.from({ length: meta.totalPages }, (_, i) => (
                <button key={i} className={`page-btn ${i === page ? 'active' : ''}`} onClick={() => load(i)}>{i + 1}</button>
              ))}
              <button className="page-btn" disabled={page === meta.totalPages - 1} onClick={() => load(page + 1)}>next</button>
            </div>
          )}
        </>
      )}

      {selected && (
        <SlotPicker doctor={selected} onClose={() => setSelected(null)} onSuccess={() => setSelected(null)} />
      )}
      {Toast}
    </>
  );
}