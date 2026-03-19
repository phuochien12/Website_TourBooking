-- Đảm bảo sử dụng đúng Database (Sửa tên DB nếu của bạn khác)
-- USE TourBookingDB;
-- GO

-- PHẦN 1: THÊM CỘT
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Tour' AND COLUMN_NAME = 'DiemKhoiHanh')
BEGIN
    ALTER TABLE Tour ADD DiemKhoiHanh NVARCHAR(100);
    PRINT N'Đã thêm cột DiemKhoiHanh thành công!';
END
ELSE
BEGIN
    PRINT N'Cột DiemKhoiHanh đã tồn tại (Không cần thêm lại).';
END
GO
-- (Chữ GO ở trên rất quan trọng, nó bắt máy tính phải TẠO xong cột mới được chạy tiếp)

-- PHẦN 2: CẬP NHẬT DỮ LIỆU
UPDATE Tour SET DiemKhoiHanh = N'TP. Hồ Chí Minh' WHERE DiemKhoiHanh IS NULL;
PRINT N'Đã cập nhật dữ liệu điểm khởi hành mặc định.';
GO
