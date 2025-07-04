# SWP391 - Hệ thống Tư vấn Sức khỏe Sinh sản

Dự án SWP391 là một hệ thống tư vấn sức khỏe sinh sản trực tuyến, giúp người dùng dễ dàng tiếp cận các dịch vụ tư vấn, đặt lịch hẹn với chuyên gia, theo dõi chu kỳ kinh nguyệt, và truy cập các bài viết về sức khỏe sinh sản.

## Tính năng chính

- **Xác thực người dùng**: Đăng ký, đăng nhập, quên mật khẩu, xác thực OTP
- **Quản lý hồ sơ**: Xem và cập nhật thông tin cá nhân
- **Đặt lịch hẹn**: Đặt lịch hẹn với chuyên gia tư vấn
- **Thanh toán**: Thanh toán trực tuyến cho các dịch vụ
- **Theo dõi chu kỳ**: Công cụ theo dõi chu kỳ kinh nguyệt
- **Blog và bài viết**: Đọc các bài viết về sức khỏe sinh sản
- **Quản lý kết quả xét nghiệm**: Xem và quản lý kết quả xét nghiệm
- **Hệ thống vai trò**: Admin, Manager, Consultant, Staff, User

## Công nghệ sử dụng

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **State Management**: React Context API
- **Routing**: React Router
- **Styling**: CSS Modules, TailwindCSS
- **API Client**: Fetch API
- **Authentication**: JWT (JSON Web Token)

## Cấu trúc thư mục

```
SWP391/
├── public/             # Tài nguyên tĩnh (hình ảnh, favicon, v.v.)
├── src/                # Mã nguồn chính
│   ├── assets/         # Tài nguyên nội bộ (CSS, hình ảnh, v.v.)
│   ├── components/     # Các component React có thể tái sử dụng
│   │   ├── ApiTesters/ # Components để test API
│   │   └── layout/     # Components bố cục (Layout, Navbar, Footer, v.v.)
│   ├── config/         # Cấu hình ứng dụng, hằng số
│   ├── pages/          # Các trang của ứng dụng
│   │   ├── Admin/      # Trang quản trị viên
│   │   ├── Appointments/ # Trang quản lý cuộc hẹn
│   │   ├── Auth/       # Trang xác thực (đăng nhập, đăng ký, v.v.)
│   │   ├── Blog/       # Trang blog
│   │   ├── Booking/    # Trang đặt lịch hẹn
│   │   ├── Consultant/ # Trang dành cho tư vấn viên
│   │   ├── Contact/    # Trang liên hệ
│   │   ├── CycleTracker/ # Trang theo dõi chu kỳ
│   │   ├── Home/       # Trang chủ
│   │   ├── Manager/    # Trang quản lý
│   │   ├── Payment/    # Trang thanh toán
│   │   ├── QnA/        # Trang hỏi đáp
│   │   ├── Services/   # Trang dịch vụ
│   │   ├── Staff/      # Trang nhân viên
│   │   └── User/       # Trang người dùng
│   ├── services/       # Các service gọi API
│   ├── types/          # Định nghĩa TypeScript
│   ├── utils/          # Các tiện ích
│   ├── App.css         # CSS chung cho ứng dụng
│   ├── App.tsx         # Component gốc của ứng dụng
│   ├── global.css      # CSS toàn cục
│   ├── index.css       # CSS cho index
│   └── main.tsx        # Điểm vào của ứng dụng
├── .gitignore          # Danh sách các file/thư mục bị bỏ qua bởi Git
├── eslint.config.js    # Cấu hình ESLint
├── index.html          # File HTML gốc
├── package.json        # Cấu hình dự án và dependencies
├── tailwind.config.js  # Cấu hình TailwindCSS
├── tsconfig.json       # Cấu hình TypeScript
└── vite.config.ts      # Cấu hình Vite
```

## Cài đặt và chạy dự án

### Yêu cầu

- Node.js (v14.0.0 trở lên)
- npm hoặc yarn

### Các bước cài đặt

1. Clone dự án:
   ```bash
   git clone <repository-url>
   cd SWP391
   ```

2. Cài đặt dependencies:
   ```bash
   npm install
   # hoặc
   yarn install
   ```

3. Chạy dự án ở môi trường development:
   ```bash
   npm run dev
   # hoặc
   yarn dev
   ```

4. Build dự án cho production:
   ```bash
   npm run build
   # hoặc
   yarn build
   ```

5. Preview phiên bản build:
   ```bash
   npm run preview
   # hoặc
   yarn preview
   ```

## Tài khoản demo

### Admin
- **Username**: admin
- **Password**: Admin@123

### Manager
- **Username**: manager
- **Password**: Manager@123

### Staff
- **Username**: staff
- **Password**: Staff@123

### Consultant
- **Username**: consultant
- **Password**: Consultant@123

### User
- **Username**: user
- **Password**: User@123

## API Documentation

API được cung cấp bởi backend và có base URL là:
```
https://ghsmsystemdemopublish.azurewebsites.net/api
```

Tài liệu API chi tiết có thể được truy cập qua Swagger UI tại:
```
https://ghsmsystemdemopublish.azurewebsites.net/swagger
```

## Quy trình làm việc với Git

1. Clone repository
2. Tạo branch mới cho tính năng/fix: `git checkout -b feature/ten-tinh-nang`
3. Commit thay đổi: `git commit -m "Mô tả thay đổi"`
4. Push lên repository: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request để merge vào branch chính

## Tối ưu hóa và bảo trì

Dự án đã được tối ưu hóa để dễ bảo trì và mở rộng:

1. **Cấu trúc thư mục rõ ràng**: Tổ chức code theo tính năng và vai trò
2. **Constants tập trung**: Các hằng số được định nghĩa trong `src/config/constants.ts`
3. **Xử lý API thống nhất**: Tất cả các gọi API được xử lý qua `src/utils/api.ts`
4. **Services tách biệt**: Mỗi tính năng có service riêng trong thư mục `src/services`
5. **CSS có thể tái sử dụng**: Sử dụng biến CSS và cấu trúc rõ ràng
6. **Xử lý lỗi nhất quán**: Cơ chế xử lý lỗi thống nhất trong toàn bộ ứng dụng

## Liên hệ

Nếu có bất kỳ câu hỏi hoặc đề xuất nào, vui lòng liên hệ với chúng tôi qua email: [email@example.com](mailto:email@example.com)

---

© 2023 SWP391 Team. All Rights Reserved.
