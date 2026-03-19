
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
