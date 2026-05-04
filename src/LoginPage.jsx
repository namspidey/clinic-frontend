import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './api';
import { useAuth } from './AuthContext';

export default function LoginPage() {
  const [tab, setTab]         = useState('login');
  const [form, setForm]       = useState({});
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleLogin() {
    setError(''); setLoading(true);
    try {
      const data = await api.login({ username: form.username, password: form.password });
      login(data);
      navigate(data.role === 'DOCTOR' ? '/doctor' : '/patient');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleRegister() {
    setError(''); setLoading(true);
    try {
      await api.register({ username: form.username, password: form.password, fullName: form.fullName, phone: form.phone });
      setTab('login');
      setError(''); // clear
      setForm({});
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const onKey = e => e.key === 'Enter' && (tab === 'login' ? handleLogin() : handleRegister());

  return (
    <div className="login-wrap">
      <div className="login-box" onKeyDown={onKey}>
        <div className="login-brand">Phòng<em>Khám</em></div>

        <div className="tabs">
          <button className={`tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Đăng nhập</button>
          <button className={`tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>Đăng ký</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {tab === 'login' ? (
          <>
            <div className="field"><label>Tên đăng nhập</label><input placeholder="username" onChange={e => set('username', e.target.value)} /></div>
            <div className="field"><label>Mật khẩu</label><input type="password" placeholder="••••••" onChange={e => set('password', e.target.value)} /></div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '.75rem' }} onClick={handleLogin} disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </>
        ) : (
          <>
            <div className="field"><label>Họ và tên</label><input placeholder="Nguyễn Văn A" onChange={e => set('fullName', e.target.value)} /></div>
            <div className="field"><label>Tên đăng nhập</label><input placeholder="username" onChange={e => set('username', e.target.value)} /></div>
            <div className="field"><label>Số điện thoại</label><input placeholder="09xxxxxxxx" onChange={e => set('phone', e.target.value)} /></div>
            <div className="field"><label>Mật khẩu</label><input type="password" placeholder="Tối thiểu 6 ký tự" onChange={e => set('password', e.target.value)} /></div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '.75rem' }} onClick={handleRegister} disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}