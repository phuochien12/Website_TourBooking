-- =============================================
-- Kịch bản Cơ sở dữ liệu cho Website Đặt Tour Du Lịch (Đồ Án 2)
-- Hệ quản trị: Microsoft SQL Server
-- Ngôn ngữ: Tiếng Việt (Bảng & Thuộc tính)
-- =============================================

-- Tạo Database (Bỏ comment dòng dưới để chạy nếu chưa có DB)
-- CREATE DATABASE TourBookingDB;
-- GO
-- USE TourBookingDB;
-- GO

-- 1. Bảng Phân Quyền (Quyen)
CREATE TABLE Quyen (
    MaQuyen INT PRIMARY KEY IDENTITY(1,1),
    TenQuyen NVARCHAR(50) NOT NULL UNIQUE, -- 'QTV' (Admin), 'KhackHang' (Customer), 'HDV' (Guide), 'NhanVien' (Staff)
    MoTa NVARCHAR(255)
);

-- 2. Bảng Người Dùng (NguoiDung)
CREATE TABLE NguoiDung (
    MaNguoiDung INT PRIMARY KEY IDENTITY(1,1),
    Email VARCHAR(100) NOT NULL UNIQUE,
    MatKhau VARCHAR(255) NOT NULL, -- Mật khẩu đã mã hóa
    HoTen NVARCHAR(100) NOT NULL,
    SoDienThoai VARCHAR(20),
    DiaChi NVARCHAR(255),
    AnhDaiDien VARCHAR(500), -- URL ảnh
    MaQuyen INT FOREIGN KEY REFERENCES Quyen(MaQuyen),
    NgayTao DATETIME DEFAULT GETDATE(),
    TrangThai BIT DEFAULT 1 -- 1: Kích hoạt, 0: Khóa
);

-- 3. Bảng Danh Mục Tour (LoaiTour)
CREATE TABLE LoaiTour (
    MaLoai INT PRIMARY KEY IDENTITY(1,1),
    TenLoai NVARCHAR(100) NOT NULL, -- Biển, Núi, Nghỉ dưỡng...
    MoTa NVARCHAR(500)
);

-- 4. Bảng Địa Điểm (DiaDiem)
CREATE TABLE DiaDiem (
    MaDiaDiem INT PRIMARY KEY IDENTITY(1,1),
    TenDiaDiem NVARCHAR(100) NOT NULL,
    Loai NVARCHAR(50), -- Thành phố, Tỉnh, Đảo
    AnhDaiDien VARCHAR(500)
);

-- 5. Bảng Tour (Tour)
CREATE TABLE Tour (
    MaTour INT PRIMARY KEY IDENTITY(1,1),
    TenTour NVARCHAR(200) NOT NULL,
    MoTa NVARCHAR(MAX), -- HTML
    SoNgay INT NOT NULL,
    SoDem INT NOT NULL,
    GiaGoc DECIMAL(18, 2) NOT NULL,
    MaDiemDi INT FOREIGN KEY REFERENCES DiaDiem(MaDiaDiem),
    MaDiemDen INT FOREIGN KEY REFERENCES DiaDiem(MaDiaDiem),
    MaLoai INT FOREIGN KEY REFERENCES LoaiTour(MaLoai),
    AnhBia VARCHAR(500),
    NoiBat BIT DEFAULT 0,
    ChinhSachHuyTour NVARCHAR(MAX), -- Quy định hoàn tiền
    TrangThai BIT DEFAULT 1 -- 1: Mở, 0: Ẩn
);

-- 6. Bảng Ảnh Tour (AnhTour)
CREATE TABLE AnhTour (
    MaAnh INT PRIMARY KEY IDENTITY(1,1),
    MaTour INT FOREIGN KEY REFERENCES Tour(MaTour) ON DELETE CASCADE,
    DuongDan VARCHAR(500) NOT NULL, -- URL ảnh
    ChuThich NVARCHAR(200)
);

-- 7. Bảng Lịch Trình (LichTrinhTour)
CREATE TABLE LichTrinhTour (
    MaLichTrinh INT PRIMARY KEY IDENTITY(1,1),
    MaTour INT FOREIGN KEY REFERENCES Tour(MaTour) ON DELETE CASCADE,
    NgayThu INT NOT NULL, -- Ngày 1, 2...
    TieuDe NVARCHAR(200) NOT NULL,
    NoiDung NVARCHAR(MAX),
    ThoiGian NVARCHAR(100) -- "08:00 - 12:00"
);

-- 8. Bảng Hướng Dẫn Viên (HuongDanVien)
CREATE TABLE HuongDanVien (
    MaHDV INT PRIMARY KEY IDENTITY(1,1),
    HoTen NVARCHAR(100) NOT NULL,
    TieuSu NVARCHAR(MAX),
    SoDienThoai VARCHAR(20),
    Email VARCHAR(100),
    AnhDaiDien VARCHAR(500),
    TrangThai BIT DEFAULT 1
);

-- 9. Bảng Lịch Khởi Hành (LichKhoiHanh)
CREATE TABLE LichKhoiHanh (
    MaLich INT PRIMARY KEY IDENTITY(1,1),
    MaTour INT FOREIGN KEY REFERENCES Tour(MaTour),
    MaHDV INT FOREIGN KEY REFERENCES HuongDanVien(MaHDV),
    NgayKhoiHanh DATETIME NOT NULL,
    NgayVe DATETIME NOT NULL,
    SoChoToiDa INT NOT NULL,
    SoChoDaDat INT DEFAULT 0,
    GiaTourHienTai DECIMAL(18,2), -- Giá thực tế của chuyến này (có thể khác giá gốc)
    TrangThai NVARCHAR(50) DEFAULT N'Mở', -- 'Mở', 'Đóng', 'Hết chổ', 'Hoàn thành', 'Hủy'
    CONSTRAINT CHK_Ngay CHECK (NgayVe >= NgayKhoiHanh)
);

-- 10. Bảng Khuyến Mãi (KhuyenMai)
CREATE TABLE KhuyenMai (
    MaKhuyenMai INT PRIMARY KEY IDENTITY(1,1),
    MaCode VARCHAR(20) NOT NULL UNIQUE,
    PhanTramGiam FLOAT, -- 0.1 = 10%
    TienGiam DECIMAL(18, 2),
    NgayBatDau DATETIME,
    NgayKetThuc DATETIME,
    SoLuong INT,
    GiaTriToiThieu DECIMAL(18, 2)
);

-- 11. Bảng Đặt Tour (DonDatTour)
CREATE TABLE DonDatTour (
    MaDon INT PRIMARY KEY IDENTITY(1,1),
    MaNguoiDung INT FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    MaLich INT FOREIGN KEY REFERENCES LichKhoiHanh(MaLich),
    NgayDat DATETIME DEFAULT GETDATE(),
    SoKhach INT NOT NULL,
    TongTien DECIMAL(18, 2) NOT NULL,
    MaKhuyenMai INT FOREIGN KEY REFERENCES KhuyenMai(MaKhuyenMai),
    TrangThai NVARCHAR(50) DEFAULT N'Chờ xử lý', -- 'Chờ thanh toán', 'Đã xác nhận', 'Hủy', 'Hoàn thành'
    GhiChu NVARCHAR(500)
);

-- 12. Bảng Hành Khách (HanhKhach)
CREATE TABLE HanhKhach (
    MaHanhKhach INT PRIMARY KEY IDENTITY(1,1),
    MaDon INT FOREIGN KEY REFERENCES DonDatTour(MaDon) ON DELETE CASCADE,
    HoTen NVARCHAR(100) NOT NULL,
    GioiTinh NVARCHAR(10), -- Nam, Nữ, Khác
    NgaySinh DATE,
    LoaiKhach NVARCHAR(20) NOT NULL, -- Người lớn, Trẻ em, Em bé
    GiaVe DECIMAL(18, 2) NOT NULL
);

-- 13. Bảng Thanh Toán (ThanhToan)
CREATE TABLE ThanhToan (
    MaThanhToan INT PRIMARY KEY IDENTITY(1,1),
    MaDon INT FOREIGN KEY REFERENCES DonDatTour(MaDon),
    PhuongThuc NVARCHAR(50), -- Tiền mặt, Chuyển khoản, Thẻ
    SoTien DECIMAL(18, 2) NOT NULL,
    NgayThanhToan DATETIME DEFAULT GETDATE(),
    MaGiaoDich VARCHAR(100), -- Mã ngân hàng
    TrangThai NVARCHAR(50) DEFAULT N'Thành công'
);

-- 14. Bảng Đánh Giá (DanhGia)
CREATE TABLE DanhGia (
    MaDanhGia INT PRIMARY KEY IDENTITY(1,1),
    MaNguoiDung INT FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    MaTour INT FOREIGN KEY REFERENCES Tour(MaTour),
    Diem INT CHECK (Diem >= 1 AND Diem <= 5),
    BinhLuan NVARCHAR(MAX),
    NgayDanhGia DATETIME DEFAULT GETDATE()
);

-- 15. Bảng Tin Tức/Blog (TinTuc)
CREATE TABLE TinTuc (
    MaTin INT PRIMARY KEY IDENTITY(1,1),
    TieuDe NVARCHAR(255) NOT NULL,
    TomTat NVARCHAR(500),
    NoiDung NVARCHAR(MAX),
    AnhDaiDien NVARCHAR(500),
    NgayDang DATETIME DEFAULT GETDATE(),
    MaNguoiDang INT FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    LuotXem INT DEFAULT 0
);

-- 16. Bảng Tour Yêu Thích (YeuThich)
CREATE TABLE YeuThich (
    MaNguoiDung INT FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    MaTour INT FOREIGN KEY REFERENCES Tour(MaTour),
    NgayLuu DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (MaNguoiDung, MaTour)
);

-- 17. Bảng Liên Hệ (LienHe)
CREATE TABLE LienHe (
    MaLienHe INT PRIMARY KEY IDENTITY(1,1),
    HoTen NVARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    SoDienThoai VARCHAR(20),
    ChuDe NVARCHAR(200),
    NoiDung NVARCHAR(MAX),
    NgayGui DATETIME DEFAULT GETDATE(),
    TrangThai BIT DEFAULT 0 -- 0: Chưa xử lý, 1: Đã xử lý
);

-- Dữ liệu mẫu (Tiếng Việt)
INSERT INTO Quyen (TenQuyen, MoTa) VALUES 
(N'QuanTri', N'Quản trị viên toàn quyền'),
(N'KhachHang', N'Khách hàng đăng ký'),
(N'HuongDanVien', N'Hướng dẫn viên du lịch'),
(N'NhanVien', N'Nhân viên hỗ trợ');
