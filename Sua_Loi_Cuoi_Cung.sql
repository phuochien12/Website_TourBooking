-- FILE NÀY CHUYÊN TRỊ LỖI THIẾU CỘT (DiemKhoiHanh, ThoiGian)
-- Bôi đen toàn bộ và nhấn F5 (Execute)

-- 1. Thêm cột DiemKhoiHanh (Nếu chưa có)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Tour' AND COLUMN_NAME = 'DiemKhoiHanh')
BEGIN
    ALTER TABLE Tour ADD DiemKhoiHanh NVARCHAR(100);
    PRINT N'✅ Đã thêm cột DiemKhoiHanh';
END
ELSE PRINT N'👌 Cột DiemKhoiHanh đã có';
GO

-- 2. Thêm cột ThoiGian (Nếu chưa có) - ĐÂY LÀ LỖI BẠN ĐANG GẶP
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Tour' AND COLUMN_NAME = 'ThoiGian')
BEGIN
    ALTER TABLE Tour ADD ThoiGian NVARCHAR(100);
    PRINT N'✅ Đã thêm cột ThoiGian';
END
ELSE PRINT N'👌 Cột ThoiGian đã có';
GO

-- 3. Cập nhật dữ liệu mặc định để không bị lỗi NULL
UPDATE Tour SET DiemKhoiHanh = N'TP. Hồ Chí Minh' WHERE DiemKhoiHanh IS NULL;
UPDATE Tour SET ThoiGian = N'3 Ngày 2 Đêm' WHERE ThoiGian IS NULL OR ThoiGian = '';

PRINT N'🎉 ĐÃ SỬA XONG DATABASE! HÃY RESTART SERVER BACKEND.';
GO




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




-- Dữ Liệu Mẫu Cho Website Đặt Tour (Chạy file này trong SSMS)
-- Lưu ý: Đảm bảo đã chạy file tạo bảng trước đó.

USE TourBookingDB;
GO

-- 1. Thêm Loại Tour
INSERT INTO LoaiTour (TenLoai, MoTa) VALUES 
(N'Du lịch Biển', N'Khám phá những bãi biển đẹp nhất Việt Nam'),
(N'Du lịch Núi', N'Chinh phục các đỉnh cao và không khí se lạnh'),
(N'Du lịch Văn Hóa', N'Tìm hiểu lịch sử và con người'),
(N'Du lịch Team Building', N'Hoạt động gắn kết tập thể');

-- 2. Thêm Địa Điểm (Tỉnh thành)
INSERT INTO DiaDiem (TenDiaDiem, Loai, AnhDaiDien) VALUES 
(N'Hà Nội', N'Thành phố', 'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6'),
(N'Đà Nẵng', N'Thành phố', 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b'),
(N'Phú Quốc', N'Đảo', 'https://images.unsplash.com/photo-1540202404-a6f29642988c'),
(N'Sapa', N'Thị trấn', 'https://images.unsplash.com/photo-1536528731305-6e0680eb58af'),
(N'Hội An', N'Thành phố', 'https://images.unsplash.com/photo-1528127269322-539801943592');

-- 3. Thêm Tour (Dữ liệu chính)
-- Tour 1: Phú Quốc
INSERT INTO Tour (TenTour, MoTa, SoNgay, SoDem, GiaGoc, MaDiemDi, MaDiemDen, MaLoai, AnhBia, NoiBat, ChinhSachHuyTour) VALUES 
(N'Tour Phú Quốc 3N2Đ: Khám Phá Đảo Ngọc - Cáp Treo Hòn Thơm', 
 N'<h3>Điểm nhấn hành trình:</h3><ul><li>Tham quan Bãi Sao - bãi biển đẹp nhất Phú Quốc.</li><li>Trải nghiệm Cáp treo Hòn Thơm vượt biển dài nhất thế giới.</li><li>Thưởng thức hải sản tươi ngon.</li></ul>', 
 3, 2, 5990000, 
 1, -- Đi từ Hà Nội (ID 1 - giả định)
 3, -- Đến Phú Quốc (ID 3)
 1, -- Loại Biển (ID 1)
 '/images/tour_phu_quoc.svg', -- Ảnh nội bộ
 1, -- Nổi bật
 N'Hủy trước 7 ngày: Phí 10%. Hủy sau đó: Phí 100%.'
);

-- Tour 2: Sapa
INSERT INTO Tour (TenTour, MoTa, SoNgay, SoDem, GiaGoc, MaDiemDi, MaDiemDen, MaLoai, AnhBia, NoiBat, ChinhSachHuyTour) VALUES 
(N'Tour Sapa 2N1Đ: Chinh Phục Đỉnh Fansipan - Bản Cát Cát', 
 N'Khám phá thị trấn trong sương, ngắm ruộng bậc thang và chinh phục nóc nhà Đông Dương.', 
 2, 1, 3200000, 
 1, -- Đi từ Hà Nội
 4, -- Đến Sapa
 2, -- Loại Núi
 '/images/tour_sapa.svg', -- Ảnh nội bộ
 1, -- Nổi bật
 N'Hủy trước 3 ngày hoàn tiền 100%.'
);

-- Tour 3: Đà Nẵng - Hội An
INSERT INTO Tour (TenTour, MoTa, SoNgay, SoDem, GiaGoc, MaDiemDi, MaDiemDen, MaLoai, AnhBia, NoiBat, ChinhSachHuyTour) VALUES 
(N'Combo Đà Nẵng - Hội An 4N3Đ: Bà Nà Hills - Phố Cổ', 
 N'Hành trình di sản miền Trung. Tham quan Cầu Vàng, Phố cổ Hội An lung linh đèn lồng.', 
 4, 3, 4500000, 
 1, -- Đi từ Hà Nội
 2, -- Đến Đà Nẵng
 3, -- Loại Văn hóa
 '/images/tour_da_nang.svg', -- Ảnh nội bộ
 0, -- Không nổi bật
 N'Không hoàn hủy vé máy bay.'
);

-- Tour 4: Hạ Long (Thêm Địa điểm Hạ Long tạm thời nếu chưa có hoặc map vào ID khác)
-- Giả sử map tạm vào ID 1 (Hà Nội) cho demo
INSERT INTO Tour (TenTour, MoTa, SoNgay, SoDem, GiaGoc, MaDiemDi, MaDiemDen, MaLoai, AnhBia, NoiBat, ChinhSachHuyTour) VALUES 
(N'Du Thuyền Hạ Long 2N1Đ: Ngủ Đêm Trên Vịnh Lan Hạ', 
 N'Trải nghiệm đẳng cấp 5 sao trên du thuyền, chèo Kayak và thăm hang động.', 
 2, 1, 2800000, 
 1, -- Đi từ Hà Nội
 1, -- Đến Hạ Long (tạm)
 1, -- Loại Biển
 'https://images.unsplash.com/photo-1552550186-b4d081f964af', -- Ảnh Hạ Long
 1, -- Nổi bật
 N'Hủy trước 24h mất 50%.'
);

-- 4. Thêm Hướng Dẫn Viên
INSERT INTO HuongDanVien (HoTen, SoDienThoai, Email, TrangThai) VALUES
(N'Nguyễn Văn A', '0901234567', 'guideA@example.com', 1),
(N'Trần Thị B', '0909876543', 'guideB@example.com', 1);

-- 5. Thêm Lịch Khởi Hành (Để test chức năng đặt tour sau này)
-- Tour ID 1 (Phú Quốc) khởi hành ngày 20/06
INSERT INTO LichKhoiHanh (MaTour, MaHDV, NgayKhoiHanh, NgayVe, SoChoToiDa, SoChoDaDat, GiaTourHienTai, TrangThai) VALUES
(1, 1, '2024-06-20', '2024-06-23', 20, 5, 5990000, N'Mở'),
(1, 2, '2024-07-15', '2024-07-18', 20, 0, 6200000, N'Mở'); -- Giá cao điểm hè

print N'Đã thêm dữ liệu mẫu thành công!';





-- CẬP NHẬT ẢNH HẠ LONG (Chạy dòng này để sửa lỗi ảnh Tour 4)
UPDATE Tour SET AnhBia = '/images/tour_ha_long.svg' WHERE TenTour LIKE N'%Hạ Long%';

-- THÊM DỮ LIỆU LỊCH TRÌNH (Quan trọng cho trang chi tiết)

-- 1. Lịch trình Phú Quốc (3 Ngày 2 Đêm) - ID Tour giả định là 1 (hoặc check ID thực tế)
-- Lưu ý: Nếu bạn xóa đi tạo lại bảng thì ID sẽ reset về 1.
INSERT INTO LichTrinhTour (MaTour, NgayThu, TieuDe, NoiDung, ThoiGian) VALUES 
(1, 1, N'Đón Sân Bay - Tham Quan Đông Đảo', N'Xe và HDV đón đoàn tại sân bay Phú Quốc. Tham quan Suối Tranh, Làng chài Hàm Ninh.', '09:00 - 17:00'),
(1, 2, N'Khám Phá Nam Đảo - Câu Cá Lặn Ngắm San Hô', N'Di chuyển xuống cảng An Thới, lên cano tham quan 3 hòn đảo đẹp nhất: Hòn Móng Tay, Hòn Gầm Ghì, Hòn Mây Rút.', '08:00 - 16:00'),
(1, 3, N'Tự Do Mua Sắm - Tiễn Sân Bay', N'Quý khách tự do tắm biển, mua sắm đặc sản lại Chợ Dương Đông. Xe đưa đoàn ra sân bay.', '08:00 - 12:00');

-- 2. Lịch trình Sapa (2 Ngày 1 Đêm) - ID Tour giả định là 2
INSERT INTO LichTrinhTour (MaTour, NgayThu, TieuDe, NoiDung, ThoiGian) VALUES 
(2, 1, N'Hà Nội - Sapa - Bản Cát Cát', N'Xe đón quý khách khởi hành đi Sapa. Chiều tham quan bản Cát Cát, tìm hiểu văn hóa người H''Mông.', '06:00 - 18:00'),
(2, 2, N'Chinh Phục Đỉnh Fansipan - Hà Nội', N'Đi cáp treo chinh phục nóc nhà Đông Dương. Chiều lên xe về lại Hà Nội.', '07:00 - 18:00');

-- 3. Lịch trình Đà Nẵng (4 Ngày 3 Đêm) - ID Tour giả định là 3
INSERT INTO LichTrinhTour (MaTour, NgayThu, TieuDe, NoiDung, ThoiGian) VALUES 
(3, 1, N'Đón Khách - Bán Đảo Sơn Trà', N'Tham quan Chùa Linh Ứng, tắm biển Mỹ Khê.', '14:00 - 18:00'),
(3, 2, N'Bà Nà Hills - Đường Lên Tiên Cảnh', N'Đi cáp treo thăm Cầu Vàng, Làng Pháp.', '08:00 - 17:00'),
(3, 3, N'Cù Lao Chàm - Phố Cổ Hội An', N'Lặn ngắm san hô tại Cù Lao Chàm, tối dạo phố cổ.', '08:00 - 21:00'),
(3, 4, N'Mua Sắm - Tiễn Khách', N'Mua sắm đặc sản Miền Trung. Xe đưa ra sân bay.', '08:00 - 12:00');

print N'Đã thêm Lịch Trình thành công!';




-- 1. Thêm Hướng Dẫn Viên (Nếu chưa có)
IF NOT EXISTS (SELECT * FROM HuongDanVien)
BEGIN
    INSERT INTO HuongDanVien (HoTen, SoDienThoai, TrangThai) VALUES 
    (N'Nguyễn Văn Hùng', '0901234567', 1),
    (N'Trần Thị Mai', '0909876543', 1);
END

-- 2. Thêm Lịch Khởi Hành (Dữ liệu năm 2026 để đảm bảo hiện ra)
-- Bạn có thể sửa ngày lại cho phù hợp thực tế

-- Tour Phú Quốc (ID 1)
INSERT INTO LichKhoiHanh (MaTour, MaHDV, NgayKhoiHanh, NgayVe, SoChoToiDa, SoChoDaDat, GiaTourHienTai, TrangThai) VALUES
(1, 1, '2026-03-10', '2026-03-12', 20, 0, 5990000, N'Mở'),
(1, 1, '2026-04-15', '2026-04-17', 20, 5, 6200000, N'Mở'), -- Dịp lễ giá cao hơn chút
(1, 2, '2026-05-01', '2026-05-03', 25, 0, 6500000, N'Mở');

-- Tour Sapa (ID 2)
INSERT INTO LichKhoiHanh (MaTour, MaHDV, NgayKhoiHanh, NgayVe, SoChoToiDa, SoChoDaDat, GiaTourHienTai, TrangThai) VALUES
(2, 1, '2026-03-05', '2026-03-06', 15, 2, 3200000, N'Mở'),
(2, 2, '2026-03-20', '2026-03-21', 15, 0, 3200000, N'Mở'),
(2, 1, '2026-04-30', '2026-05-01', 20, 10, 3500000, N'Mở');

-- Tour Đà Nẵng (ID 3)
INSERT INTO LichKhoiHanh (MaTour, MaHDV, NgayKhoiHanh, NgayVe, SoChoToiDa, SoChoDaDat, GiaTourHienTai, TrangThai) VALUES
(3, 2, '2026-03-12', '2026-03-15', 25, 0, 4500000, N'Mở'),
(3, 2, '2026-06-01', '2026-06-04', 30, 0, 4800000, N'Mở');

-- Tour Hạ Long (ID 4) - Nếu có
INSERT INTO LichKhoiHanh (MaTour, MaHDV, NgayKhoiHanh, NgayVe, SoChoToiDa, SoChoDaDat, GiaTourHienTai, TrangThai) VALUES
(4, 1, '2026-03-08', '2026-03-09', 40, 0, 2500000, N'Mở');

print N'Đã thêm Lịch Khởi Hành thành công!';

UPDATE NguoiDung
SET MaQuyen = 1
WHERE Email = 'phuochien847@gmail.com';


-- Đảm bảo sử dụng đúng Database (Sửa tên DB nếu của bạn khác)
-- USE TourBookingDB;
-- GO

-- FILE NÀY CHUYÊN TRỊ LỖI THIẾU CỘT (DiemKhoiHanh, ThoiGian)
-- Bôi đen toàn bộ và nhấn F5 (Execute)

-- 1. Thêm cột DiemKhoiHanh (Nếu chưa có)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Tour' AND COLUMN_NAME = 'DiemKhoiHanh')
BEGIN
    ALTER TABLE Tour ADD DiemKhoiHanh NVARCHAR(100);
    PRINT N'✅ Đã thêm cột DiemKhoiHanh';
END
ELSE PRINT N'👌 Cột DiemKhoiHanh đã có';
GO

-- 2. Thêm cột ThoiGian (Nếu chưa có) - ĐÂY LÀ LỖI BẠN ĐANG GẶP
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Tour' AND COLUMN_NAME = 'ThoiGian')
BEGIN
    ALTER TABLE Tour ADD ThoiGian NVARCHAR(100);
    PRINT N'✅ Đã thêm cột ThoiGian';
END
ELSE PRINT N'👌 Cột ThoiGian đã có';
GO

-- 3. Cập nhật dữ liệu mặc định để không bị lỗi NULL
UPDATE Tour SET DiemKhoiHanh = N'TP. Hồ Chí Minh' WHERE DiemKhoiHanh IS NULL;
UPDATE Tour SET ThoiGian = N'3 Ngày 2 Đêm' WHERE ThoiGian IS NULL OR ThoiGian = '';

PRINT N'🎉 ĐÃ SỬA XONG DATABASE! HÃY RESTART SERVER BACKEND.';
GO
