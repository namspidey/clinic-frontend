import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from './api';
import { useAuth } from './AuthContext';


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

function SlotPicker({ doctor, onClose, onBook }) {
    const dates = getDates();
    const [selectedDate, setSelectedDate] = useState(dates[0]);
    const [bookedHours, setBookedHours] = useState([]);
    const [fetchingSlots, setFetchingSlots] = useState(false);

    useEffect(() => {
        setFetchingSlots(true);
        api.getBookedSlots(doctor.id, selectedDate)
            .then(hours => setBookedHours(hours))
            .catch(() => setBookedHours([]))
            .finally(() => setFetchingSlots(false));
    }, [doctor.id, selectedDate]);

    return (
        <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 520 }}>
                <div className="modal-header">
                    <div>
                        <div className="modal-title">{doctor.fullName}</div>
                        <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: 2 }}>
                            {doctor.specialty || 'Đa khoa'}
                        </div>
                    </div>
                    <button className="btn-close" onClick={onClose}>✕</button>
                </div>

                {/* Date tabs */}
                <div style={{ display: 'flex', gap: '.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    {dates.map((d, i) => (
                        <button key={d} onClick={() => setSelectedDate(d)} style={{
                            padding: '.35rem .75rem', borderRadius: 6, fontSize: '.78rem',
                            cursor: 'pointer', border: '1px solid', fontFamily: 'inherit',
                            background: selectedDate === d ? 'var(--sage)' : 'var(--surface)',
                            color: selectedDate === d ? '#fff' : 'var(--ink)',
                            borderColor: selectedDate === d ? 'var(--sage)' : 'var(--border)',
                        }}>
                            {i === 0 ? 'Hôm nay' : new Date(d + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                        </button>
                    ))}
                </div>

                {/* Slots */}
                {fetchingSlots ? (
                    <div className="loading">Đang tải lịch...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.6rem', marginBottom: '1rem' }}>
                        {HOURS.map(h => {
                            const booked = bookedHours.includes(h);
                            return (
                                <button key={h} disabled={booked}
                                    onClick={() => !booked && onBook(doctor, selectedDate, h)}
                                    style={{
                                        padding: '.65rem .5rem', borderRadius: 8, fontSize: '.83rem',
                                        cursor: booked ? 'not-allowed' : 'pointer',
                                        border: '1px solid', fontFamily: 'inherit', textAlign: 'center',
                                        background: booked ? '#f0ede8' : 'var(--surface)',
                                        color: booked ? 'var(--muted)' : 'var(--ink)',
                                        borderColor: 'var(--border)',
                                        transition: 'all .15s',
                                    }}
                                    onMouseEnter={e => {
                                        if (!booked) {
                                            e.currentTarget.style.background = 'var(--sage)';
                                            e.currentTarget.style.color = '#fff';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (!booked) {
                                            e.currentTarget.style.background = 'var(--surface)';
                                            e.currentTarget.style.color = 'var(--ink)';
                                        }
                                    }}
                                >
                                    <div>{pad(h)}:00 – {pad(h + 1)}:00</div>
                                    <div style={{ fontSize: '.7rem', marginTop: 3, opacity: .75 }}>
                                        {booked ? '🔴 Đã đặt' : '🟢 Còn trống'}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                <p style={{ fontSize: '.8rem', color: 'var(--muted)', textAlign: 'center' }}>
                    Chọn slot để đặt lịch
                </p>
            </div>
        </div>
    );
}

export default function HomePage() {
    const [doctors, setDoctors] = useState([]);
    const [meta, setMeta] = useState({});
    const [specialty, setSpecialty] = useState('');
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

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

    // Khi guest chọn slot → redirect login, khi đã login → đặt luôn
    function handleSlotClick(doctor, date, hour) {
        if (!user) {
            // Lưu intent để sau khi login có thể tiếp tục (tuỳ chọn)
            navigate('/login');
            return;
        }
        // Đã login → navigate sang trang patient với doctor được chọn sẵn
        navigate('/patient');
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>


            <nav style={{
                background: 'var(--ink)', padding: '0 2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                height: 56, position: 'sticky', top: 0, zIndex: 50,
            }}>
                {/* Logo + nút hướng dẫn */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontFamily: 'Lora, serif', fontSize: '1.3rem', color: '#fff' }}>
                        Phòng<em style={{ fontStyle: 'italic', color: 'var(--sage-light, #8aab8a)' }}>Khám</em>
                    </div>
                    <button
                        className="btn btn-sm"
                        style={{ background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.8)', border: '1px solid rgba(255,255,255,.2)', fontSize: 'large' }}
                        onClick={() => window.open('https://docs.google.com/document/d/1GCYifyrhPnUq6bMFg3GW0oDzUeeQmvFkfYcT8mQl_yo/edit', '_blank')}
                    >
                        📄 Hướng dẫn sử dụng
                    </button>
                </div>

                {/* Login / user */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <span style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.6)' }}>
                                Xin chào, {user.fullName?.split(' ').pop()}
                            </span>
                            <button className="btn btn-primary btn-sm"
                                onClick={() => navigate(user.role === 'DOCTOR' ? '/doctor' : '/patient')}>
                                Vào trang của tôi
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.65)', textDecoration: 'none' }}>
                                Đăng nhập
                            </Link>
                            <Link to="/login">
                                <button className="btn btn-primary btn-sm">Đăng ký</button>
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero */}
            <div style={{
                background: 'linear-gradient(135deg, var(--ink) 0%, #2d4a3a 100%)',
                padding: '3rem 2rem', textAlign: 'center',
            }}>
                <h1 style={{ fontFamily: 'Lora, serif', fontSize: '2.4rem', color: '#fff', marginBottom: '.75rem' }}>
                    Đặt lịch khám <em style={{ fontStyle: 'italic', color: '#8aab8a' }}>dễ dàng</em>
                </h1>
                <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '1rem', marginBottom: '1.5rem' }}>
                    Xem lịch trống và đặt ca khám với bác sĩ phù hợp
                </p>
                {!user && (
                    <Link to="/login">
                        <button className="btn btn-primary" style={{ padding: '.75rem 2rem', fontSize: '1rem' }}>
                            Đăng ký miễn phí
                        </button>
                    </Link>
                )}
            </div>

            {/* Main content */}
            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
                <h2 style={{ fontFamily: 'Lora, serif', fontSize: '1.5rem', marginBottom: '.5rem' }}>
                    Danh sách bác sĩ
                </h2>
                <p style={{ color: 'var(--muted)', fontSize: '.88rem', marginBottom: '1.25rem' }}>
                    Chọn bác sĩ để xem lịch trống
                    {!user && <span style={{ color: 'var(--sage)' }}> — Đăng nhập để đặt lịch</span>}
                </p>

                <div className="filter-bar">
                    <input placeholder="🔍  Tìm theo chuyên khoa..."
                        value={specialty} onChange={e => setSpecialty(e.target.value)} />
                </div>

                {loading ? <div className="loading">Đang tải...</div> : (
                    <>
                        <div className="grid-3">
                            {doctors.map(d => (
                                <div className="card" key={d.id}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                                    <div style={{ display: 'flex', gap: '.85rem', alignItems: 'center' }}>
                                        <div className="avatar">{initials(d.fullName)}</div>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{d.fullName}</div>
                                            <span className="badge badge-green">{d.specialty || 'Đa khoa'}</span>
                                        </div>
                                    </div>
                                    {d.description && (
                                        <div style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                                            {d.description}
                                        </div>
                                    )}
                                    <button className="btn btn-primary" style={{ marginTop: 'auto' }}
                                        onClick={() => setSelected(d)}>
                                        Xem lịch trống
                                    </button>
                                </div>
                            ))}
                        </div>

                        {meta.totalPages > 1 && (
                            <div className="pagination">
                                <button className="page-btn" disabled={page === 0} onClick={() => load(page - 1)}>‹</button>
                                {Array.from({ length: meta.totalPages }, (_, i) => (
                                    <button key={i} className={`page-btn ${i === page ? 'active' : ''}`} onClick={() => load(i)}>{i + 1}</button>
                                ))}
                                <button className="page-btn" disabled={page === meta.totalPages - 1} onClick={() => load(page + 1)}>›</button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Slot picker modal */}
            {selected && (
                <SlotPicker
                    doctor={selected}
                    onClose={() => setSelected(null)}
                    onBook={(doctor, date, hour) => {
                        setSelected(null);
                        handleSlotClick(doctor, date, hour);
                    }}
                />
            )}
        </div>
    );
}