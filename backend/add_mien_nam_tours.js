const { connectDB, sql } = require('./db');
async function insertData() {
    const pool = await connectDB();
    try {
        // 1. Thêm Loại Tour "Tour Miền Nam" nếu chưa có
        let loaiTourRes = await pool.request().query("SELECT MaLoai FROM LoaiTour WHERE TenLoai = N'Tour Miền Nam'");
        let maLoaiMienNam;
        if (loaiTourRes.recordset.length === 0) {
            let insertLoai = await pool.request().query("INSERT INTO LoaiTour (TenLoai, MoTa) OUTPUT INSERTED.MaLoai VALUES (N'Tour Miền Nam', N'Các tour du lịch khám phá vẻ đẹp miền Nam Việt Nam')");
            maLoaiMienNam = insertLoai.recordset[0].MaLoai;
            console.log("Đã thêm loại Tour Miền Nam, ID:", maLoaiMienNam);
        } else {
            maLoaiMienNam = loaiTourRes.recordset[0].MaLoai;
            console.log("Đã tồn tại Tour Miền Nam, ID:", maLoaiMienNam);
        }

        // 2. Thêm Điểm Đến (Tây Ninh, TP. Hồ Chí Minh, Vũng Tàu)
        const diaDiemNames = ['Tây Ninh', 'TP. Hồ Chí Minh', 'Vũng Tàu', 'Bình Dương'];
        const diaDiemIds = {};
        for (let name of diaDiemNames) {
            let res = await pool.request().input('name', sql.NVarChar, name).query("SELECT MaDiaDiem FROM DiaDiem WHERE TenDiaDiem = @name");
            if (res.recordset.length === 0) {
                let ins = await pool.request().input('name', sql.NVarChar, name).query("INSERT INTO DiaDiem (TenDiaDiem, Loai, AnhDaiDien) OUTPUT INSERTED.MaDiaDiem VALUES (@name, N'Thành phố', '')");
                diaDiemIds[name] = ins.recordset[0].MaDiaDiem;
            } else {
                diaDiemIds[name] = res.recordset[0].MaDiaDiem;
            }
        }

        // 3. Thêm các Tour
        const tours = [
            {
                TenTour: 'TOUR HÀNH HƯƠNG NÚI BÀ - TÂM AN LỘC ĐẾN - CHINH PHỤC NÓC NHÀ ĐÔNG NAM BỘ',
                SoNgay: 1, SoDem: 0, GiaGoc: 850000,
                MaDiemDi: diaDiemIds['TP. Hồ Chí Minh'], MaDiemDen: diaDiemIds['Tây Ninh'],
                MaLoai: maLoaiMienNam,
                AnhBia: 'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6',
                MoTa: '<p>Khởi Hành: Thứ 4 - Thứ 7 - Chủ Nhật Hàng Tuần<br/>Phương Tiện: Xe ghế ngồi bật đời mới<br/>Thưởng thức đặc sản bánh canh Trảng Bàng</p>',
                DiemKhoiHanh: 'TP. Hồ Chí Minh',
                ThoiGian: '1 Ngày',
                KhuyenMai: 700000
            },
            {
                TenTour: 'TOUR THAM QUAN HỒ CHÍ MINH CITY 1 NGÀY',
                SoNgay: 1, SoDem: 0, GiaGoc: 1150000,
                MaDiemDi: diaDiemIds['TP. Hồ Chí Minh'], MaDiemDen: diaDiemIds['TP. Hồ Chí Minh'],
                MaLoai: maLoaiMienNam,
                AnhBia: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482',
                MoTa: '<p>THAM QUAN DINH ĐỘC LẬP - NHÀ THỜ ĐỨC BÀ - BƯU ĐIỆN THÀNH PHỐ - BẢO TÀNG CHỨNG TÍCH CHIẾN TRANH</p>',
                DiemKhoiHanh: 'TP. Hồ Chí Minh',
                ThoiGian: '1 Ngày',
                KhuyenMai: 999000
            },
            {
                TenTour: 'THAM QUAN ĐỊA ĐẠO CỦ CHI 1/2 NGÀY - SỐNG LẠI KÝ ỨC HÀO HÙNG',
                SoNgay: 1, SoDem: 0, GiaGoc: 500000,
                MaDiemDi: diaDiemIds['TP. Hồ Chí Minh'], MaDiemDen: diaDiemIds['TP. Hồ Chí Minh'],
                MaLoai: maLoaiMienNam,
                AnhBia: 'https://images.unsplash.com/photo-1590226456722-b5af5ea21147',
                MoTa: '<p>Khám phá địa đạo Củ Chi với hệ thống đường hầm bí mật dưới lòng đất.</p>',
                DiemKhoiHanh: 'TP. Hồ Chí Minh',
                ThoiGian: '1/2 Ngày',
                KhuyenMai: 400000
            },
            {
                TenTour: 'TOUR CANO TRÊN SÔNG SÀI GÒN : THAM QUAN ĐỊA ĐẠO CỦ CHI BẰNG CANO',
                SoNgay: 1, SoDem: 0, GiaGoc: 1450000,
                MaDiemDi: diaDiemIds['TP. Hồ Chí Minh'], MaDiemDen: diaDiemIds['TP. Hồ Chí Minh'],
                MaLoai: maLoaiMienNam,
                AnhBia: 'https://images.unsplash.com/photo-1542382103-247ac41fe587',
                MoTa: '<p>Khởi Hành: Hàng ngày<br/>Phương Tiện: Cano trên sông Sài Gòn</p>',
                DiemKhoiHanh: 'TP. Hồ Chí Minh',
                ThoiGian: '1 Ngày',
                KhuyenMai: 1399000
            },
            {
                TenTour: 'TOUR THAM QUAN ĐẢO KHỈ CẦN GIỜ 1 NGÀY',
                SoNgay: 1, SoDem: 0, GiaGoc: 750000,
                MaDiemDi: diaDiemIds['TP. Hồ Chí Minh'], MaDiemDen: diaDiemIds['TP. Hồ Chí Minh'],
                MaLoai: maLoaiMienNam,
                AnhBia: 'https://images.unsplash.com/photo-1540202404-a6f29642988c',
                MoTa: '<p>Khám phá hệ sinh thái rừng ngập mặn Cần Giờ, tham quan Đảo Khỉ</p>',
                DiemKhoiHanh: 'TP. Hồ Chí Minh',
                ThoiGian: '1 Ngày',
                KhuyenMai: 750000
            },
            {
                TenTour: 'TOUR VŨNG TÀU 1N: SÀI GÒN - NÔNG TRẠI CỪU - TẮM BIỂN VŨNG TÀU',
                SoNgay: 1, SoDem: 0, GiaGoc: 899000,
                MaDiemDi: diaDiemIds['TP. Hồ Chí Minh'], MaDiemDen: diaDiemIds['Vũng Tàu'],
                MaLoai: maLoaiMienNam,
                AnhBia: 'https://images.unsplash.com/photo-1594950341907-f32ab53f2c5f',
                MoTa: '<p>Tham quan nông trại cừu Suối Nghệ, tắm biển Vũng Tàu, ăn hải sản.</p>',
                DiemKhoiHanh: 'TP. Hồ Chí Minh',
                ThoiGian: '1 Ngày',
                KhuyenMai: 799000
            },
            {
                TenTour: 'TOUR HÀNG NGÀY : THAM QUAN TẮM BIỂN VŨNG TÀU 1 NGÀY',
                SoNgay: 1, SoDem: 0, GiaGoc: 630000,
                MaDiemDi: diaDiemIds['TP. Hồ Chí Minh'], MaDiemDen: diaDiemIds['Vũng Tàu'],
                MaLoai: maLoaiMienNam,
                AnhBia: 'https://images.unsplash.com/photo-1502693822160-503b41da2d10',
                MoTa: '<p>Đổi gió ngày cuối tuần với Vũng Tàu biển xanh nắng vàng.</p>',
                DiemKhoiHanh: 'TP. Hồ Chí Minh',
                ThoiGian: '1 Ngày',
                KhuyenMai: 580000
            }
        ];

        for (let tour of tours) {
            let res = await pool.request()
                .input('TenTour', sql.NVarChar, tour.TenTour)
                .input('MoTa', sql.NVarChar, tour.MoTa)
                .input('SoNgay', sql.Int, tour.SoNgay)
                .input('SoDem', sql.Int, tour.SoDem)
                .input('GiaGoc', sql.Decimal, tour.GiaGoc)
                .input('MaDiemDi', sql.Int, tour.MaDiemDi)
                .input('MaDiemDen', sql.Int, tour.MaDiemDen)
                .input('MaLoai', sql.Int, tour.MaLoai)
                .input('AnhBia', sql.VarChar, tour.AnhBia)
                .input('DiemKhoiHanh', sql.NVarChar, tour.DiemKhoiHanh)
                .input('ThoiGian', sql.NVarChar, tour.ThoiGian)
                .query(`
                    INSERT INTO Tour (TenTour, MoTa, SoNgay, SoDem, GiaGoc, MaDiemDi, MaDiemDen, MaLoai, AnhBia, NoiBat, ChinhSachHuyTour, TrangThai, DiemKhoiHanh, ThoiGian)
                    OUTPUT INSERTED.MaTour
                    VALUES (@TenTour, @MoTa, @SoNgay, @SoDem, @GiaGoc, @MaDiemDi, @MaDiemDen, @MaLoai, @AnhBia, 1, N'Không hoàn tiền', 1, @DiemKhoiHanh, @ThoiGian)
                `);
            let newTourId = res.recordset[0].MaTour;
            console.log("Đã thêm Tour:", tour.TenTour, "ID:", newTourId);

            // Add basic LichKhoiHanh for tomorrow, next week
            let tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            let nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);

            await pool.request()
                .input('MaTour', sql.Int, newTourId)
                .input('NgayKhoiHanh1', sql.Date, tomorrow)
                .input('NgayKhoiHanh2', sql.Date, nextWeek)
                .input('NgayVe1', sql.Date, tomorrow) // 1 day tour
                .input('NgayVe2', sql.Date, nextWeek)
                .input('GiaTour', sql.Decimal, tour.KhuyenMai)
                .query(`
                    INSERT INTO LichKhoiHanh (MaTour, NgayKhoiHanh, NgayVe, SoChoToiDa, SoChoDaDat, GiaTourHienTai, TrangThai)
                    VALUES 
                    (@MaTour, @NgayKhoiHanh1, @NgayVe1, 30, 0, @GiaTour, N'Mở'),
                    (@MaTour, @NgayKhoiHanh2, @NgayVe2, 30, 0, @GiaTour, N'Mở')
                `);
        }

        console.log("Hoàn tất thêm dữ liệu.");
        process.exit(0);

    } catch (err) {
        console.error("Lỗi:", err);
        process.exit(1);
    }
}
insertData();
