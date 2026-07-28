# LocalFood

LocalFood là ứng dụng khám phá và chia sẻ địa điểm ẩm thực địa phương. Dự án gồm giao diện React và REST API Spring Boot kết nối MySQL.

## Công nghệ

- Frontend: React 18, Vite 5, React Router, Axios, Leaflet.
- Backend: Java 17, Spring Boot 3.1, Spring Web, Spring Data JPA, Validation, Lombok, BCrypt.
- Database: MySQL.
- Build: Maven cho backend và npm cho frontend.

## Cấu trúc dự án

    localfood/
    ├── backend/             Spring Boot REST API
    ├── database/            Script khởi tạo MySQL
    ├── frontend/            React/Vite
    └── README.md

## Yêu cầu môi trường

- JDK 17 trở lên.
- Maven 3.8 trở lên.
- Node.js 18 trở lên và npm.
- MySQL 8 trở lên.

Lưu ý: repository hiện chưa chứa Maven Wrapper, vì vậy máy phát triển cần có lệnh mvn trong PATH.

## Cài đặt và chạy

### 1. Khởi tạo database

Tạo database tên doiquadi, sau đó chạy script:

    mysql -u root -p doiquadi < database/localfood.sql

Backend đọc cấu hình kết nối từ các biến môi trường sau:

| Biến | Giá trị mặc định | Ý nghĩa |
| --- | --- | --- |
| DB_URL | jdbc:mysql://localhost:3306/doiquadi | JDBC URL |
| DB_USERNAME | root | Tài khoản MySQL |
| DB_PASSWORD | rỗng | Mật khẩu MySQL |

Ví dụ trên PowerShell:

    $env:DB_USERNAME = 'root'
    $env:DB_PASSWORD = 'your-password'

Không lưu mật khẩu database trực tiếp vào source code.

### 2. Chạy backend

    cd backend
    mvn clean spring-boot:run

Backend mặc định chạy tại http://localhost:8080/api.

### Upload ảnh với R2/S3

Ảnh được upload trực tiếp từ trình duyệt lên object storage bằng presigned URL.
Backend chỉ tạo URL tạm thời, xác nhận object và lưu URL CDN/khóa object trong MySQL.

Sao chép các biến trong `.env.example` vào môi trường chạy backend. Với Cloudflare R2:

- `STORAGE_ENDPOINT`: endpoint S3 API của tài khoản R2.
- `STORAGE_BUCKET`: tên bucket.
- `STORAGE_ACCESS_KEY` và `STORAGE_SECRET_KEY`: API token giới hạn trong bucket.
- `STORAGE_PUBLIC_BASE_URL`: custom domain hoặc public development URL dùng để hiển thị ảnh.
- `STORAGE_ENABLED=true`: bật upload sau khi đã điền đủ cấu hình.

Bucket phải cho phép CORS `PUT`, `GET`, `HEAD` từ domain frontend và header
`Content-Type`. Không đưa access key hoặc secret key vào frontend.

Chạy kiểm thử backend:

    mvn test

### 3. Chạy frontend

Mở terminal khác:

    cd frontend
    npm install
    npm run dev

Các lệnh frontend:

| Lệnh | Chức năng |
| --- | --- |
| npm run dev | Chạy Vite development server |
| npm run build | Tạo production build |
| npm run preview | Xem thử production build |
| npm run lint | Kiểm tra ESLint |

## REST API hiện có

Tất cả endpoint có tiền tố /api.

| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | /api | Kiểm tra backend |
| POST | /api/auth/register | Đăng ký tài khoản |
| POST | /api/auth/login | Đăng nhập |
| GET | /api/users/{id} | Lấy người dùng theo UUID |
| GET | /api/foods | Lấy danh sách món ăn |
| POST | /api/foods | Thêm món ăn |
| GET | /api/locations | Lấy danh sách địa điểm |

Validation áp dụng cho email, mật khẩu, tên người dùng và tên món ăn. Mật khẩu được băm bằng BCrypt trước khi lưu.

## Mô hình dữ liệu

Các entity backend đã triển khai:

- User: UUID, username, email, password hash, avatar, bio và thời gian tạo.
- Food: UUID, tên, mô tả và URL hình ảnh.
- Location: UUID, tên, địa chỉ, tọa độ, giờ mở cửa, điện thoại và giá trung bình.

Script đầy đủ nằm tại database/localfood.sql và còn định nghĩa post, tag, comment, like, follow, favorite, check-in, collection và notification cho các chức năng tiếp theo.

## Quy ước phát triển

- Class Java và tên file dùng PascalCase.
- DTO request dùng Jakarta Validation.
- Controller xử lý HTTP; nghiệp vụ người dùng đặt trong service.
- Không trả password hash trong response.
- Không commit mật khẩu, API key hoặc thông tin kết nối thật.

## Trạng thái

Backend hiện cung cấp luồng xác thực cơ bản và API đọc dữ liệu món ăn, địa điểm. Frontend vẫn sử dụng một phần mock data; các module xã hội trong schema chưa có đầy đủ entity, repository, service và controller.
