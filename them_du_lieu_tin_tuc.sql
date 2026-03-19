-- Thêm dữ liệu mẫu cho bảng Tin Tức
INSERT INTO TinTuc (TieuDe, TomTat, NoiDung, AnhDaiDien, NgayDang, MaNguoiDang) VALUES 
(N'Top 10 địa điểm du lịch hè 2026 không thể bỏ qua', N'Mùa hè này đi đâu? Cùng điểm qua những thiên đường biển đảo tuyệt đẹp...', N'<p>Nội dung chi tiết bài viết về du lịch hè...</p>', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', GETDATE(), 1),

(N'Kinh nghiệm du lịch Sapa tự túc cho người mới', N'Sapa mùa nào đẹp nhất? Ăn gì, chơi gì ở thị trấn sương mù? Tất cả sẽ có trong bài viết này.', N'<p>Nội dung chi tiết bài viết về Sapa...</p>', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800', GETDATE(), 1),

(N'Lễ hội pháo hoa Đà Nẵng trở lại hoành tráng', N'DIFF 2026 hứa hẹn mang đến những màn trình diễn ánh sáng mãn nhãn bên sông Hàn.', N'<p>Nội dung chi tiết về lễ hội pháo hoa...</p>', 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=800', GETDATE(), 1);

print N'Đã thêm Tin Tức mẫu thành công!';
