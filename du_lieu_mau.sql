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
