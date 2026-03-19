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
