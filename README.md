# 🏥 Clinic Frontend

React client cho hệ thống đặt lịch khám bệnh trực tuyến.

**Demo:** [clinic-frontend-e452.vercel.app](https://clinic-frontend-e452.vercel.app)  
**Backend API:** [clinic-backend-nvos.onrender.com](https://clinic-backend-nvos.onrender.com)

---

## Tính năng

- Đăng ký / Đăng nhập (JWT)
- Xem danh sách bác sĩ, tìm kiếm theo chuyên khoa, phân trang
- Xem lịch trống theo từng ngày (slot 1 tiếng, 8h–17h)
- Đặt lịch khám, hủy lịch
- Dashboard bác sĩ: xem lịch hẹn, đánh dấu hoàn thành

---

## Tech stack

| | |
|---|---|
| Framework | React 18 (Create React App) |
| Routing | React Router DOM v6 |
| State | React Context + useState |
| Styling | CSS thuần (không dùng UI library) |
| Deploy | Vercel |

---

## Cấu trúc project

```
src/
├── api.js              # Tất cả API calls (fetch wrapper)
├── AuthContext.jsx     # Global auth state (login/logout)
├── useToast.jsx        # Hook hiển thị toast notification
├── index.css           # Global styles
├── App.jsx             # Router + PrivateRoute
├── Layout.jsx          # Sidebar layout dùng chung
├── LoginPage.jsx       # Đăng nhập / Đăng ký
├── DoctorsPage.jsx     # Tìm bác sĩ + SlotPicker modal
├── MyBookingsPage.jsx  # Lịch khám của bệnh nhân
└── DoctorPage.jsx      # Dashboard bác sĩ
```

---

## Chạy local

**Yêu cầu:** Node.js 18+

```bash
# Clone repo
git clone https://github.com/your-username/clinic-frontend.git
cd clinic-frontend

# Cài dependencies
npm install

# Chạy dev server
npm start
# → http://localhost:3000
```

**Đổi URL backend** trong `src/api.js`:

```js
// Development - trỏ về local backend
const BASE = 'http://localhost:8080/api/v1';

// Production - trỏ về Render
const BASE = 'https://clinic-backend-nvos.onrender.com/api/v1';
```

---

## Tài khoản test

| Username | Password | Role |
|---|---|---|
| `benhnhan1` | `123456` | Bệnh nhân |
| `benhnhan2` | `123456` | Bệnh nhân |
| `bacsi1` | `123456` | Bác sĩ |
| `bacsi2` | `123456` | Bác sĩ |

---

## Deploy lên Vercel

```bash
# Cài Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Hoặc kết nối GitHub repo với Vercel, tự động deploy khi push.

> ⚠️ Đảm bảo `BASE` trong `api.js` trỏ đúng URL backend production trước khi deploy.
