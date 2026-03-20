const express = require('express');
const cors = require('cors');
const { connectDB, sql } = require('./db');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary (Có cơ chế kiểm tra lỗi tránh sập server)
try {
    if (process.env.CLOUDINARY_CLOUD_NAME) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        console.log("Cấu hình Cloudinary thành công! ✅");
    } else {
        console.warn("⚠️ Cảnh báo: Chưa cấu hình Cloudinary trong biến môi trường!");
    }
} catch (err) {
    console.error("Lỗi cấu hình Cloudinary:", err.message);
}
const { layCauTraLoiAI } = require('./XuLyAI'); 



// CẤU HÌNH GỬI EMAIL (Nodemailer cho Gmail hoặc Resend.com)
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);


const app = express();
const PORT = process.env.PORT || 5000;

// Bộ nhớ tạm để lưu mã OTP (Trong thực tế nên dùng Redis hoặc Table OTP trong DB)
const otpStore = new Map();

const axios = require('axios');

// Middleware
app.use(cors()); // Cho phép Frontend gọi API
app.use(express.json()); // Đọc dữ liệu JSON từ request

// Cấu hình Multer lưu vào bộ nhớ tạm (Buffer) để đẩy lên Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// API Upload ảnh lên Cloudinary
app.post('/api/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Chưa chèn ảnh!' });
    }

    // Đẩy stream ảnh lên Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'tour_website' }, // Tự tạo thư mục tên tour_website trên cloud cho gọn
        (error, result) => {
            if (error) {
                console.error("Lỗi upload Cloudinary:", error);
                return res.status(500).json({ success: false, message: 'Lỗi tải ảnh lên Cloudinary' });
            }
            // Trả về đường link URL từ Cloudinary
            res.json({ success: true, url: result.secure_url });
        }
    );

    // Ghi dữ liệu ảnh từ Buffer vào luồng tải lên
    uploadStream.end(req.file.buffer);
});

// Route kiểm tra server hoạt động
app.get('/', (req, res) => {
    res.send('Backend Du Lịch đang chạy! 🚀');
});

// API Chatbot
app.post('/api/chatbot', async (req, res) => {
    try {
        const { message } = req.body;
        const pool = await connectDB();
        const tours = await pool.request().query('SELECT TOP 10 TenTour, GiaGoc, ThoiGian FROM Tour WHERE TrangThai = 1');
        const answer = await layCauTraLoiAI(message, tours.recordset);
        res.json({ success: true, answer });
    } catch (err) {
        console.error("Lỗi Chatbot:", err.message);
        res.json({ success: false, answer: "Hệ thống đang bảo trì, vui lòng gọi hotline!" });
    }
});




// Lấy danh sách danh mục (LoaiTour) để dùng trong combobox
app.get('/api/categories', async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM LoaiTour');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route test kết nối CSDL & Hỗ trợ tìm kiếm: Lấy danh sách Tour
app.get('/api/tours', async (req, res) => {
    try {
        const { diemDi, diemDen, mucGia, thoiGian } = req.query;
        let queryStr = `
            SELECT t.*, 
                   (SELECT COUNT(*) FROM LichKhoiHanh l 
                    WHERE l.MaTour = t.MaTour 
                    AND l.TrangThai = N'Mở' 
                    AND l.NgayKhoiHanh >= CAST(GETDATE() AS DATE)) as SoLich
            FROM Tour t 
            WHERE t.TrangThai = 1`;

        // Xây dựng câu truy vấn động dựa trên tham số truyền vào từ Front-End
        if (diemDi) queryStr += " AND DiemKhoiHanh LIKE N'%' + @diemDi + '%'";
        if (diemDen) {
            queryStr += " AND (TenTour LIKE N'%' + @diemDen + '%' OR MaLoai IN (SELECT MaLoai FROM LoaiTour WHERE TenLoai LIKE N'%' + @diemDen + '%') OR MaDiemDen IN (SELECT MaDiaDiem FROM DiaDiem WHERE TenDiaDiem LIKE N'%' + @diemDen + '%'))";
        }
        // Chỉ ghép LIKE @thoiGian + '%' để lấy chính xác số ngày ở đầu tiên (vd: '2 Ngày', '2 Ngày 1 Đêm') chứ không lấy sai lệch ('12 Ngày')
        if (thoiGian) queryStr += " AND ThoiGian LIKE @thoiGian + '%'";
        if (mucGia) {
            if (mucGia === 'duoi5') queryStr += " AND GiaGoc < 5000000";
            else if (mucGia === '5-10') queryStr += " AND GiaGoc BETWEEN 5000000 AND 10000000";
            else if (mucGia === 'tren10') queryStr += " AND GiaGoc > 10000000";
        }

        const pool = await connectDB();
        const request = pool.request();

        // Gán giá trị an toàn chống SQL Injection (Fix lỗi cắt 1 ký tự của mssql)
        if (diemDi) request.input('diemDi', sql.NVarChar(255), diemDi);
        if (diemDen) request.input('diemDen', sql.NVarChar(255), diemDen);
        if (thoiGian) request.input('thoiGian', sql.NVarChar(255), thoiGian);

        console.log("thoiGian param:", thoiGian, "queryString:", queryStr);

        const result = await request.query(queryStr);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route lấy chi tiết 1 tour (kèm lịch trình)
app.get('/api/tours/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await connectDB();

        // Lấy thông tin Tour kèm số lượng lịch khởi hành còn mở
        const tourResult = await pool.request()
            .input('Id', sql.Int, id)
            .query(`
                SELECT t.*, 
                    (SELECT COUNT(*) FROM LichKhoiHanh l 
                    WHERE l.MaTour = t.MaTour 
                    AND l.TrangThai = N'Mở' 
                    AND l.NgayKhoiHanh >= CAST(GETDATE() AS DATE)) as SoLich
                FROM Tour t WHERE t.MaTour = @Id
            `);

        // Lấy lịch trình
        const lichTrinhResult = await pool.request()
            .input('Id', sql.Int, id)
            .query('SELECT * FROM LichTrinhTour WHERE MaTour = @Id ORDER BY NgayThu ASC');

        // Lấy Hướng Dẫn Viên từ lịch khởi hành gần nhất có gán HDV
        const hdvResult = await pool.request()
            .input('Id', sql.Int, id)
            .query(`
                SELECT TOP 1 h.MaHDV, h.HoTen, h.TieuSu, h.SoDienThoai, h.Email, h.AnhDaiDien
                FROM LichKhoiHanh l
                JOIN HuongDanVien h ON l.MaHDV = h.MaHDV
                WHERE l.MaTour = @Id AND h.TrangThai = 1
                ORDER BY l.NgayKhoiHanh DESC
            `);

        if (tourResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy tour' });
        }

        const tour = tourResult.recordset[0];
        tour.LichTrinh = lichTrinhResult.recordset;
        tour.HuongDanVien = hdvResult.recordset.length > 0 ? hdvResult.recordset[0] : null;

        res.json(tour);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route lấy lịch khởi hành của 1 tour
app.get('/api/tours/:id/lich-khoi-hanh', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await connectDB();

        // Chỉ lấy những lịch còn mở và chưa khởi hành
        const result = await pool.request()
            .input('MaTour', sql.Int, id)
            .query(`
                SELECT * FROM LichKhoiHanh 
                WHERE MaTour = @MaTour 
                AND TrangThai = N'Mở' 
                AND NgayKhoiHanh >= CAST(GETDATE() AS DATE)
                ORDER BY NgayKhoiHanh ASC
            `);

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy lịch sử đặt tour của một khách hàng cụ thể
// [NÂNG CẤP]: Trả thêm ChinhSachHuyTour và GiaGoc để hiển thị chính sách hoàn tiền khi khách muốn hủy
app.get('/api/bookings/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await connectDB();

        const result = await pool.request()
            .input('MaNguoiDung', sql.Int, id)
            .query(`
                SELECT 
                    d.MaDon, d.NgayDat, d.SoKhach, d.TongTien, d.TrangThai, d.GhiChu,
                    t.TenTour, t.AnhBia, t.GiaGoc, t.ChinhSachHuyTour,
                    l.NgayKhoiHanh, d.MaLich
                FROM DonDatTour d
                JOIN LichKhoiHanh l ON d.MaLich = l.MaLich
                JOIN Tour t ON l.MaTour = t.MaTour
                WHERE d.MaNguoiDung = @MaNguoiDung
                ORDER BY d.NgayDat DESC
            `);

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// API XÁC THỰC (ĐĂNG NHẬP / ĐĂNG KÝ)
// ==========================================

// 1. Đăng ký tài khoản mới
app.post('/api/dang-ky', async (req, res) => {
    try {
        const { HoTen, Email, MatKhau, SoDienThoai } = req.body;
        const pool = await connectDB();

        // Kiểm tra xem Email đã tồn tại chưa
        const checkUser = await pool.request()
            .input('Email', sql.VarChar, Email)
            .query('SELECT * FROM NguoiDung WHERE Email = @Email');

        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ success: false, message: 'Email này đã được đăng ký!' });
        }

        // Thêm người dùng mới (Mặc định quyền = 2: Khách hàng)
        await pool.request()
            .input('Email', sql.VarChar, Email)
            .input('MatKhau', sql.VarChar, MatKhau)
            .input('HoTen', sql.NVarChar, HoTen)
            .input('SoDienThoai', sql.VarChar, SoDienThoai)
            .query(`
                INSERT INTO NguoiDung (Email, MatKhau, HoTen, SoDienThoai, MaQuyen, TrangThai)
                VALUES (@Email, @MatKhau, @HoTen, @SoDienThoai, 2, 1)
            `);

        res.json({ success: true, message: 'Đăng ký thành công! Hãy đăng nhập ngay.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. Đăng nhập
app.post('/api/dang-nhap', async (req, res) => {
    try {
        const { Email, MatKhau } = req.body;
        const pool = await connectDB();

        // Tìm người dùng theo Email và Mật khẩu
        const result = await pool.request()
            .input('Email', sql.VarChar, Email)
            .input('MatKhau', sql.VarChar, MatKhau)
            .query(`
                SELECT MaNguoiDung, HoTen, Email, MaQuyen 
                FROM NguoiDung 
                WHERE Email = @Email AND MatKhau = @MatKhau AND TrangThai = 1
            `);

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            // Trả về thông tin user để Frontend lưu lại
            res.json({ success: true, message: 'Đăng nhập thành công!', user });
        } else {
            res.status(401).json({ success: false, message: 'Email hoặc Mật khẩu không đúng!' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 3. Quên mật khẩu - Gửi mã OTP
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { Email } = req.body;
        if (!Email) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp Email!' });
        }
        const pool = await connectDB();

        // Kiểm tra khách hàng có tồn tại không
        const userResult = await pool.request()
            .input('Email', sql.VarChar, Email)
            .query('SELECT HoTen FROM NguoiDung WHERE Email = @Email AND TrangThai = 1');

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Email này không tồn tại trên hệ thống hoặc đã bị khóa!' });
        }

        const hoTen = userResult.recordset[0].HoTen;
        // Tạo mã OTP 6 chữ số ngẫu nhiên
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Lưu OTP vào bộ nhớ tạm (hết hạn sau 10 phút)
        otpStore.set(Email, {
            otp,
            expires: Date.now() + 10 * 60 * 1000 // 10 phút
        });

        // Gửi Email chứa mã OTP qua Resend
        const { data, error } = await resend.emails.send({
            from: 'Du Lịch Việt <hotro@dulichviet.click>',
            to: [Email],
            subject: 'Mã xác thực (OTP) đặt lại mật khẩu - Du Lịch Việt',
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); background-color: #ffffff;">
                    <div style="background-color: #003c71; padding: 40px 20px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 3px; font-weight: 900;">Xác thực tài khoản</h1>
                        <p style="color: rgba(255,255,255,0.7); margin-top: 10px; font-size: 14px;">Hệ thống đặt lại mật khẩu của Du Lịch Việt</p>
                    </div>
                    <div style="padding: 40px; text-align: left;">
                        <p style="color: #1e293b; font-size: 16px; line-height: 24px; margin-bottom: 20px;">Xin chào <b>${hoTen}</b>,</p>
                        <p style="color: #475569; font-size: 15px; line-height: 24px;">Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã xác thực dưới đây để hoàn tất quy trình:</p>
                        
                        <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); border: 2px dashed #cbd5e1; border-radius: 20px; padding: 30px; text-align: center; margin: 30px 0;">
                            <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #003c71; font-family: monospace;">${otp}</span>
                        </div>
                        
                        <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 15px; margin-bottom: 30px;">
                            <p style="color: #9a3412; font-size: 13px; margin: 0; font-weight: 600;">Lưu ý: Mã này có hiệu lực trong vòng 10 phút. Tuyệt đối không chia sẻ mã này cho bắt kỳ ai.</p>
                        </div>
                        
                        <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 25px;">
                            Nếu bạn không yêu cầu thay đổi này, hãy bỏ qua email này.<br/>
                            &copy; 2026 <b>Du Lịch Việt</b> - Trải nghiệm hành trình hoàn hảo.
                        </p>
                    </div>
                </div>
            `
        });

        if (error) {
            console.error("Lỗi gửi mail OTP qua Resend:", error);
            return res.status(500).json({ success: false, message: 'Lỗi khi gửi email xác thực.' });
        }
        res.json({ success: true, message: 'Mã OTP đã được gửi vào email của bạn!' });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 4. Xác nhận mã OTP
app.post('/api/verify-otp', (req, res) => {
    const { Email, OTP } = req.body;
    if (!Email || !OTP) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin Email hoặc OTP!' });
    }
    const storedData = otpStore.get(Email);

    if (!storedData) {
        return res.status(400).json({ success: false, message: 'Mã OTP không hợp lệ hoặc đã hết hạn!' });
    }

    if (Date.now() > storedData.expires) {
        otpStore.delete(Email);
        return res.status(400).json({ success: false, message: 'Mã OTP đã hết hạn!' });
    }

    if (storedData.otp !== OTP) {
        return res.status(400).json({ success: false, message: 'Mã OTP không chính xác!' });
    }

    res.json({ success: true, message: 'Xác thực OTP thành công!' });
});

// 5. Đặt lại mật khẩu mới
app.post('/api/reset-password', async (req, res) => {
    try {
        const { Email, OTP, MatKhauMoi } = req.body;
        if (!Email || !OTP || !MatKhauMoi) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin để đặt lại mật khẩu!' });
        }
        const storedData = otpStore.get(Email);

        // Bảo mật thêm: Kiểm tra lại OTP trước khi đổi
        if (!storedData || storedData.otp !== OTP || Date.now() > storedData.expires) {
            return res.status(400).json({ success: false, message: 'Yêu cầu không hợp lệ hoặc phiên xác thực đã hết hạn!' });
        }

        const pool = await connectDB();
        await pool.request()
            .input('Email', sql.VarChar, Email)
            .input('MatKhauMoi', sql.VarChar, MatKhauMoi)
            .query('UPDATE NguoiDung SET MatKhau = @MatKhauMoi WHERE Email = @Email');

        // Xóa OTP sau khi đổi mật khẩu thành công
        otpStore.delete(Email);

        res.json({ success: true, message: 'Mật khẩu đã được thay đổi thành công!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// API XỬ LÝ ĐẶT TOUR (QUAN TRỌNG)
// ==========================================
app.post('/api/dat-tour', async (req, res) => {
    try {
        // Nhận dữ liệu từ Frontend gửi xuống
        const { HoTen, Email, SoDienThoai, SoKhach, MaLich, TongTien, PhuongThucThanhToan = 'chuyen_khoan', MaNguoiDung: inputMaNguoiDung } = req.body;
        const pool = await connectDB();

        console.log("📝 Nhận yêu cầu đặt tour:", { HoTen, Email, MaLich });

        // --- BƯỚC 1: XỬ LÝ NGƯỜI DÙNG (USER) ---
        let MaNguoiDung = inputMaNguoiDung;

        if (MaNguoiDung) {
            // Kiểm tra trạng thái tài khoản nếu đã đăng nhập
            let checkStatus = await pool.request()
                .input('MaNguoiDung', sql.Int, MaNguoiDung)
                .query('SELECT TrangThai FROM NguoiDung WHERE MaNguoiDung = @MaNguoiDung');
            if (checkStatus.recordset.length > 0 && checkStatus.recordset[0].TrangThai === 0) {
                return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị khóa. Không thể đặt tour!' });
            }
        }

        if (!MaNguoiDung) {
            // Kiểm tra xem Email này đã có trong hệ thống chưa
            let ketQuaUser = await pool.request()
                .input('Email', sql.VarChar, Email)
                .query('SELECT MaNguoiDung, TrangThai FROM NguoiDung WHERE Email = @Email');

            if (ketQuaUser.recordset.length > 0) {
                if (ketQuaUser.recordset[0].TrangThai === 0) {
                    return res.status(403).json({ success: false, message: 'Email (Tài khoản) này đã bị khóa. Không thể tiếp tục đặt tour!' });
                }
                // Trường hợp 1: Khách cũ -> Lấy ID dùng luôn
                MaNguoiDung = ketQuaUser.recordset[0].MaNguoiDung;
            } else {
                // Trường hợp 2: Khách mới -> Tạo tài khoản tự động
                let taoUserMoi = await pool.request()
                    .input('Email', sql.VarChar, Email)
                    .input('HoTen', sql.NVarChar, HoTen)
                    .input('SoDienThoai', sql.VarChar, SoDienThoai)
                    .query(`
                        INSERT INTO NguoiDung (Email, MatKhau, HoTen, SoDienThoai, MaQuyen, TrangThai) 
                        OUTPUT INSERTED.MaNguoiDung -- Lấy ngay ID vừa tạo
                        VALUES (@Email, '123456', @HoTen, @SoDienThoai, 2, 1) 
                    `);
                MaNguoiDung = taoUserMoi.recordset[0].MaNguoiDung;
            }
        }

        // =====================================================
        // [NÂNG CẤP] BƯỚC 1.5: KIỂM TRA CHỐNG ĐẶT TRÙNG & CHỒNG CHÉO LỊCH
        // =====================================================
        
        // 1. Lấy thông tin ngày đi/ngày về của lịch đang định đặt
        const thongTinLichMoi = await pool.request()
            .input('MaLich', sql.Int, MaLich)
            .query('SELECT NgayKhoiHanh, NgayVe FROM LichKhoiHanh WHERE MaLich = @MaLich');
        
        if (thongTinLichMoi.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Lịch khởi hành không tồn tại!' });
        }
        
        const { NgayKhoiHanh: moiS, NgayVe: moiE } = thongTinLichMoi.recordset[0];

        // 2. Tìm các đơn hàng hiện có của khách (chưa hủy) bị trùng hoặc chồng chéo thời gian
        // Công thức: (A.Start <= B.End) AND (A.End >= B.Start)
        const ktraChongCheo = await pool.request()
            .input('MaNguoiDung', sql.Int, MaNguoiDung)
            .input('MaLichMoi', sql.Int, MaLich)
            .input('NgayS', sql.Date, moiS)
            .input('NgayE', sql.Date, moiE)
            .query(`
                SELECT TOP 1 d.MaDon, t.TenTour, l.NgayKhoiHanh, l.NgayVe, l.MaLich
                FROM DonDatTour d
                JOIN LichKhoiHanh l ON d.MaLich = l.MaLich
                JOIN Tour t ON l.MaTour = t.MaTour
                WHERE d.MaNguoiDung = @MaNguoiDung 
                AND d.TrangThai NOT IN (N'Hủy', N'Đã hủy', N'Khách đã hủy')
                AND (
                    (@NgayS <= l.NgayVe AND @NgayE >= l.NgayKhoiHanh)
                )
            `);

        if (ktraChongCheo.recordset.length > 0) {
            const trung = ktraChongCheo.recordset[0];
            
            // Nếu trùng chính xác cái MaLich đó luôn
            if (trung.MaLich === MaLich) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Bạn đã đặt tour này rồi! Vui lòng kiểm tra lại đơn hàng #${trung.MaDon} trong lịch sử.` 
                });
            }
            
            // Nếu chỉ là trùng ngày (đi tour khác)
            return res.status(400).json({ 
                success: false, 
                message: `Lịch trình bị chồng chéo! Bạn đã có lịch đi tour "${trung.TenTour}" từ ngày ${new Date(trung.NgayKhoiHanh).toLocaleDateString('vi-VN')} đến ${new Date(trung.NgayVe).toLocaleDateString('vi-VN')}.` 
            });
        }

        // --- BƯỚC 2: TẠO ĐƠN ĐẶT TOUR (BOOKING) ---
        const resultBooking = await pool.request()
            .input('MaNguoiDung', sql.Int, MaNguoiDung)
            .input('MaLich', sql.Int, MaLich)
            .input('SoKhach', sql.Int, SoKhach)
            .input('TongTien', sql.Decimal, TongTien)
            .input('TrangThai', sql.NVarChar, PhuongThucThanhToan === 'chuyen_khoan' ? 'Chờ thanh toán' : 'Chờ xử lý')
            .query(`
                INSERT INTO DonDatTour (MaNguoiDung, MaLich, SoKhach, TongTien, TrangThai)
                OUTPUT INSERTED.MaDon
                VALUES (@MaNguoiDung, @MaLich, @SoKhach, @TongTien, @TrangThai)
            `);

        const MaDon = resultBooking.recordset[0].MaDon;

        // --- BƯỚC 2.5: GHI NHẬN THANH TOÁN THỦ CÔNG ---
        if (PhuongThucThanhToan === 'chuyen_khoan') {
            await pool.request()
                .input('MaDon', sql.Int, MaDon)
                .input('PhuongThuc', sql.NVarChar, 'Chuyển khoản (Thủ công)')
                .input('SoTien', sql.Decimal, TongTien)
                .query(`
                    INSERT INTO ThanhToan (MaDon, PhuongThuc, SoTien, TrangThai)
                    VALUES (@MaDon, @PhuongThuc, @SoTien, N'Chờ xác nhận')
                `);
        }

        // --- BƯỚC 3: CẬP NHẬT SỐ CHỖ (SLOT) ---
        // Trừ đi số chỗ trống trong lịch khởi hành
        await pool.request()
            .input('MaLich', sql.Int, MaLich)
            .input('SoKhach', sql.Int, SoKhach)
            .query(`UPDATE LichKhoiHanh SET SoChoDaDat = SoChoDaDat + @SoKhach WHERE MaLich = @MaLich`);

        // --- BƯỚC 4: GỬI EMAIL XÁC NHẬN QUA RESEND ---
        try {
        // --- BƯỚC 4: GỬI EMAIL XÁC NHẬN QUA RESEND ---
        try {
            // [QUAN TRỌNG]: Mã hóa nội dung chuyển khoản để link mã QR không bị lỗi dấu cách
            const qrAddInfo = encodeURIComponent(`DULICHVIET ${MaDon} ${HoTen}`);
            const qrAccountName = encodeURIComponent("CONG TY DU LICH VIET");
            const qrUrl = `https://img.vietqr.io/image/MB-0354858892-compact2.png?amount=${TongTien}&addInfo=${qrAddInfo}&accountName=${qrAccountName}`;

            await resend.emails.send({
                from: 'Du Lịch Việt <hotro@dulichviet.click>',
                to: [Email],
                subject: `🎫 XÁC NHẬN ĐẶT TOUR #${MaDon} THÀNH CÔNG - DU LỊCH VIỆT`,
                html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                        <div style="background: linear-gradient(135deg, #1e3a8a, #1d4ed8); padding: 40px 20px; text-align: center; color: #ffffff;">
                            <h1 style="margin: 0; font-size: 28px; letter-spacing: 1px;">XÁC NHẬN ĐẶT TOUR</h1>
                            <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">Cảm ơn quý khách đã tin tưởng lựa chọn dịch vụ của chúng tôi</p>
                        </div>
                        
                        <div style="padding: 30px;">
                            <p style="font-size: 16px; color: #334155;">Xin chào <b>${HoTen}</b>,</p>
                            <p style="font-size: 15px; color: #64748b; line-height: 1.6;">Yêu cầu đặt tour của bạn đã được hệ thống ghi nhận thành công. Dưới đây là thông tin chi tiết đơn hàng:</p>
                            
                            <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #f1f5f9;">
                                <table style="width: 100%; font-size: 15px;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #94a3b8;">Mã đơn hàng:</td>
                                        <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #1e3a8a;">#${MaDon}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #94a3b8;">Số lượng khách:</td>
                                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">${SoKhach} người</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 15px 0 0; color: #94a3b8; border-top: 1px solid #e2e8f0;">Tổng thanh toán:</td>
                                        <td style="padding: 15px 0 0; text-align: right; border-top: 1px solid #e2e8f0; font-size: 22px; font-weight: 900; color: #e11d48;">
                                            ${new Intl.NumberFormat('vi-VN').format(TongTien)} VNĐ
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            ${PhuongThucThanhToan === 'chuyen_khoan' ? `
                                <div style="background-color: #fffbeb; border: 2px dashed #f59e0b; border-radius: 12px; padding: 25px;">
                                    <h3 style="color: #92400e; margin-top: 0; font-size: 18px; text-align: center;">🛡️ THÔNG TIN CHUYỂN KHOẢN</h3>
                                    <div style="margin: 20px 0; font-size: 14px; color: #78350f;">
                                        <p style="margin: 5px 0;">🏦 Ngân hàng: <b>MB Bank (Quân Đội)</b></p>
                                        <p style="margin: 5px 0;">👤 Chủ TK: <b>CONG TY DU LICH VIET</b></p>
                                        <p style="margin: 5px 0;">💳 Số TK: <b style="font-size: 20px; color: #d97706;">0354858892</b></p>
                                        <p style="margin: 5px 0;">📝 Nội dung: <b style="background: white; padding: 4px 8px; border-radius: 4px; color: #dc2626;">DULICHVIET ${MaDon} ${HoTen}</b></p>
                                    </div>
                                    <div style="text-align: center; margin-top: 20px;">
                                        <img src="${qrUrl}" alt="QR Thanh Toán" style="width: 220px; height: 220px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
                                        <p style="font-size: 12px; color: #92400e; margin-top: 15px;">Sử dụng App Ngân hàng quét mã để thanh toán ngay</p>
                                    </div>
                                </div>
                            ` : `
                                <div style="background-color: #f0fdf4; border: 2px dashed #166534; border-radius: 12px; padding: 25px; text-align: center;">
                                    <h3 style="color: #166534; margin-top: 0; font-size: 18px;">📍 THANH TOÁN TẠI VĂN PHÒNG</h3>
                                    <p style="font-size: 14px; color: #166534;">Quý khách vui lòng đến trực tiếp văn phòng trong vòng <b>24 giờ</b> để hoàn tất thanh toán.</p>
                                    <p style="font-weight: bold; margin-top: 10px; color: #14532d;">Trụ sở chính: 273 Nguyễn Văn Linh, Q. Ninh Kiều, TP. Cần Thơ</p>
                                </div>
                            `}

                            <div style="margin-top: 35px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 30px;">
                                <p style="font-size: 14px; color: #64748b; margin-bottom: 5px;">Mọi thắc mắc vui lòng liên hệ hotline:</p>
                                <a href="tel:0354858892" style="font-size: 24px; font-weight: bold; color: #1d4ed8; text-decoration: none;">0354858892</a>
                            </div>
                        </div>
                        
                        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
                            <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; 2026 Du Lịch Việt - All rights reserved</p>
                        </div>
                    </div>
                `
            });
            console.log("✅ Đã gửi email xác nhận đặt tour qua Resend đến:", Email);
        } catch (mailError) {
            console.log("⚠️ Lỗi gửi email xác nhận cho khách qua Resend:", mailError.message);
        }
            console.log("✅ Đã gửi email xác nhận đặt tour qua Resend đến:", Email);
        } catch (mailError) {
            console.log("⚠️ Lỗi gửi email xác nhận cho khách qua Resend:", mailError.message);
        }

        // --- BƯỚC 5: GỬI EMAIL THÔNG BÁO CHO ADMIN QUA RESEND ---
        try {
            const adminEmail = process.env.ADMIN_EMAIL || 'phuochien847@gmail.com'; 
            await resend.emails.send({
                from: 'Hệ Thống Tour <hotro@dulichviet.click>',
                to: [adminEmail],
                reply_to: 'phuochien847@gmail.com',
                subject: `🚨 ĐƠN MỚI #${MaDon} - ${HoTen} - DU LỊCH VIỆT`,
                html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #1e3a8a; padding: 0; border-radius: 16px; overflow: hidden;">
                        <div style="background-color: #1e3a8a; color: white; padding: 30px; text-align: center;">
                            <h2 style="margin: 0; font-size: 24px; letter-spacing: 1px;">THÔNG BÁO ĐƠN HÀNG MỚI</h2>
                            <p style="margin: 10px 0 0; opacity: 0.8;">Hệ thống vừa nhận được yêu cầu đặt tour mới</p>
                        </div>
                        
                        <div style="padding: 25px;">
                            <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
                                <h3 style="color: #1e3a8a; margin-top: 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 10px;">👤 Thông tin khách hàng</h3>
                                <p style="margin: 10px 0;"><strong>Họ và tên:</strong> ${HoTen}</p>
                                <p style="margin: 10px 0;"><strong>Email:</strong> ${Email}</p>
                                <p style="margin: 10px 0;"><strong>Điện thoại:</strong> ${SoDienThoai}</p>
                            </div>

                            <div style="background-color: #fffaf0; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #fde68a;">
                                <h3 style="color: #92400e; margin-top: 0; border-bottom: 1px solid #fde68a; padding-bottom: 10px;">📦 Chi tiết đơn hàng #${MaDon}</h3>
                                <p style="margin: 10px 0;"><strong>Tên Tour:</strong> ${TenTour}</p>
                                <p style="margin: 10px 0;"><strong>Ngày khởi hành:</strong> ${new Date(NgayKhoiHanh).toLocaleDateString('vi-VN')}</p>
                                <p style="margin: 10px 0;"><strong>Số lượng:</strong> ${SoKhach} người</p>
                                <p style="margin: 10px 0; font-size: 18px; color: #dc2626;"><strong>Tổng tiền: ${new Intl.NumberFormat('vi-VN').format(TongTien)} VNĐ</strong></p>
                                <p style="margin: 10px 0;"><strong>Phương thức:</strong> <b style="color: #1e3a8a;">${PhuongThucThanhToan === 'chuyen_khoan' ? 'Chuyển khoản' : 'Tiền mặt'}</b></p>
                            </div>

                            ${PhuongThucThanhToan === 'chuyen_khoan' ? `
                                <div style="text-align: center; background-color: #f0fdf4; padding: 20px; border-radius: 12px; border: 1px solid #bbf7d0;">
                                    <p style="margin-bottom: 15px; color: #166534; font-weight: bold;">Mã QR Khách đang dùng để chuyển khoản:</p>
                                    <img src="${qrUrl}" alt="QR" style="width: 180px; height: 180px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" />
                                    <p style="margin-top: 10px; font-size: 13px; color: #166534;">ND: DULICHVIET ${MaDon} ${HoTen}</p>
                                </div>
                            ` : ''}

                            <div style="text-align: center; margin-top: 30px;">
                                <a href="https://dulichviet.click/admin/don-hang" style="display: inline-block; background-color: #1e3a8a; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 12px rgba(30,58,138,0.2);">TRUY CẬP TRANG QUẢN TRỊ</a>
                            </div>
                        </div>

                        <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
                            <p>© 2026 dulichviet.click - Hệ thống Tour Booking</p>
                        </div>
                    </div>
                `
            });
            console.log('✅ Đã gửi mail thông báo cho Admin qua Resend');
        } catch (adminMailErr) {
            console.log('⚠️ Lỗi gửi mail admin qua Resend:', adminMailErr.message);
        }

        // Trả về kết quả thành công cho Frontend
        res.json({ 
            message: 'Đặt tour thành công! Vui lòng thực hiện chuyển khoản để hoàn tất.', 
            success: true, 
            maDon: MaDon
        });

    } catch (loi) {
        console.error("❌ Lỗi đặt tour:", loi);
        res.status(500).json({ error: 'Lỗi server', details: loi.message });
    }
});

// (Các API PayOS và VietQR tự động đã được gỡ bỏ để chuyển sang luồng thủ công)

// ==========================================
// KHÁCH HÀNG TỰ HỦY ĐƠN
// Nâng cấp: Lưu lý do hủy + Gửi email xác nhận hủy tour
// Chỉ được hủy khi trạng thái còn 'Chờ xử lý'
// ==========================================
app.put('/api/bookings/huy-don/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { lyDoHuy } = req.body;
        const pool = await connectDB();

        const donHang = await pool.request()
            .input('MaDon', sql.Int, id)
            .query(`
                SELECT d.*, n.HoTen, n.Email, n.SoDienThoai, t.TenTour, l.NgayKhoiHanh
                FROM DonDatTour d
                JOIN NguoiDung n ON d.MaNguoiDung = n.MaNguoiDung
                JOIN LichKhoiHanh l ON d.MaLich = l.MaLich
                JOIN Tour t ON l.MaTour = t.MaTour
                WHERE d.MaDon = @MaDon
            `);

        if (donHang.recordset.length === 0) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        const don = donHang.recordset[0];

        if (don.TrangThai !== 'Chờ xử lý' && don.TrangThai !== 'Chờ thanh toán') {
            return res.status(400).json({ message: 'Đơn này không thể hủy tự động, vui lòng liên hệ hotline 0354858892.' });
        }

        const ghiChuStr = lyDoHuy ? `Lý do khách hủy: ${lyDoHuy}` : 'Khách tự hủy đơn';
        await pool.request()
            .input('MaDon', sql.Int, id)
            .input('GhiChu', sql.NVarChar, ghiChuStr)
            .query("UPDATE DonDatTour SET TrangThai = N'Khách đã hủy', GhiChu = @GhiChu WHERE MaDon = @MaDon");

        await pool.request()
            .input('MaLich', sql.Int, don.MaLich)
            .input('SoKhach', sql.Int, don.SoKhach)
            .query("UPDATE LichKhoiHanh SET SoChoDaDat = SoChoDaDat - @SoKhach WHERE MaLich = @MaLich");

        try {
            const adminEmail = 'phuochien847@gmail.com';
            await resend.emails.send({
                from: 'Du Lịch Việt <hotro@dulichviet.click>',
                to: [don.Email],
                subject: `🚫 XÁC NHẬN HỦY TOUR #${id} - DU LỊCH VIỆT`,
                html: `<div style="font-family: Arial; max-width: 600px; margin: 0 auto; border: 1px solid #fca5a5; border-radius: 16px; overflow: hidden;">
                        <div style="background: #dc2626; color: white; padding: 30px; text-align: center;"><h2>THÔNG BÁO HỦY TOUR</h2><p>Đơn hàng #${id} đã được hủy</p></div>
                        <div style="padding: 25px;">
                            <p>Chào <b>${don.HoTen}</b>, đơn hàng tour <b>${don.TenTour}</b> của bạn đã được hủy thành công. Lý do: ${lyDoHuy || 'Khách chủ động hủy'}. Số tiền hoàn lại (nếu có) sẽ được xử lý trong 24h.</p>
                        </div></div>`
            });

            await resend.emails.send({
                from: 'Hệ Thống Tour <hotro@dulichviet.click>',
                to: [adminEmail],
                subject: `🚨 CẢNH BÁO: KHÁCH HỦY TOUR #${id}`,
                html: `<div style="font-family: Arial; border: 2px solid #ef4444; padding: 20px; border-radius: 12px;">
                        <h3 style="color: #dc2626;">KHÁCH VỪA HỦY ĐƠN HÀNG!</h3>
                        <p>🆔 Mã đơn: #${id}<br/>👤 Khách: ${don.HoTen} (${don.SoDienThoai})<br/>🌍 Tour: ${don.TenTour}<br/>❌ Lý do: ${lyDoHuy || 'Không có'}</p>
                        <a href="https://dulichviet.click/admin/don-hang" style="background: #1e3a8a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">XỬ LÝ NGAY</a>
                    </div>`
            });
        } catch (mErr) { console.log("⚠️ Lỗi gửi mail hủy:", mErr.message); }

        res.json({ success: true, message: 'Đã hủy đơn thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// API ADMIN (QUẢN TRỊ)
// ==========================================

// Lấy danh sách tất cả đơn đặt tour (Hỗ trợ lọc theo ngày đặt)
app.get('/api/admin/bookings', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const pool = await connectDB();
        
        let queryStr = `
            SELECT d.MaDon, d.NgayDat, d.SoKhach, d.TongTien, d.TrangThai, 
                   n.HoTen, n.Email, n.SoDienThoai, 
                   t.TenTour, l.NgayKhoiHanh 
            FROM DonDatTour d 
            JOIN NguoiDung n ON d.MaNguoiDung = n.MaNguoiDung 
            JOIN LichKhoiHanh l ON d.MaLich = l.MaLich 
            JOIN Tour t ON l.MaTour = t.MaTour
            WHERE 1=1
        `;

        const request = pool.request();

        console.log(`🔍 Lọc đơn hàng: startDate=${startDate}, endDate=${endDate}`);

        if (startDate && endDate) {
            queryStr += " AND CAST(d.NgayDat AS DATE) BETWEEN @sd AND @ed";
            request.input('sd', sql.NVarChar, startDate);
            request.input('ed', sql.NVarChar, endDate);
            console.log("✅ Đã áp dụng điều kiện lọc ngày vào SQL");
        }

        queryStr += " ORDER BY d.NgayDat DESC";
        
        const result = await request.query(queryStr);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cập nhật trạng thái đơn hàng (Duyệt đơn / Hủy đơn)
app.put('/api/admin/bookings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const status = req.body.status;
        const pool = await connectDB();

        await pool.request()
            .input('MaDon', sql.Int, id)
            .input('TrangThai', sql.NVarChar, status)
            .query('UPDATE DonDatTour SET TrangThai = @TrangThai WHERE MaDon = @MaDon');

        res.json({ message: 'Cập nhật thành công', success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy thông tin 1 người dùng (Profile)
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await connectDB();
        const result = await pool.request()
            .input('Id', sql.Int, id)
            .query('SELECT MaNguoiDung, HoTen, Email, SoDienThoai, DiaChi, AnhDaiDien, MaQuyen, TrangThai FROM NguoiDung WHERE MaNguoiDung = @Id');
        
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy danh sách khách hàng
app.get('/api/admin/users', async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT MaNguoiDung, HoTen, Email, SoDienThoai, MaQuyen, TrangThai FROM NguoiDung ORDER BY MaQuyen ASC, MaNguoiDung DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cập nhật người dùng (Vai trò / Trạng thái / Thông tin)
app.put('/api/admin/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { MaQuyen, TrangThai, HoTen, Email, SoDienThoai, AnhDaiDien, MatKhau, DiaChi } = req.body;
        const pool = await connectDB();

        // Kiểm tra trùng lặp SĐT / Email nếu có thay đổi
        if (Email || SoDienThoai) {
            let checkQuery = 'SELECT MaNguoiDung FROM NguoiDung WHERE MaNguoiDung != @Id AND (';
            let checks = [];
            if (Email) checks.push('Email = @Email');
            if (SoDienThoai) checks.push('SoDienThoai = @SoDienThoai');
            checkQuery += checks.join(' OR ') + ')';

            const checkReq = pool.request().input('Id', sql.Int, id);
            if (Email) checkReq.input('Email', sql.VarChar, Email);
            if (SoDienThoai) checkReq.input('SoDienThoai', sql.VarChar, SoDienThoai);

            const checkRes = await checkReq.query(checkQuery);
            if (checkRes.recordset.length > 0) {
                return res.status(400).json({ success: false, message: 'Email hoặc Số điện thoại đã tồn tại trên một tài khoản khác!' });
            }
        }

        // Xử lý giá trị (chỉ update trường nào được truyền vào)
        let queryStr = 'UPDATE NguoiDung SET ';
        let fields = [];
        if (MaQuyen !== undefined) fields.push('MaQuyen = @MaQuyen');
        if (TrangThai !== undefined) fields.push('TrangThai = @TrangThai');
        if (HoTen !== undefined) fields.push('HoTen = @HoTen');
        if (Email !== undefined) fields.push('Email = @Email');
        if (SoDienThoai !== undefined) fields.push('SoDienThoai = @SoDienThoai');
        if (AnhDaiDien !== undefined) fields.push('AnhDaiDien = @AnhDaiDien');
        if (MatKhau !== undefined) fields.push('MatKhau = @MatKhau');
        if (DiaChi !== undefined) fields.push('DiaChi = @DiaChi');

        if (fields.length === 0) return res.json({ success: true }); // Không có gì đổi

        queryStr += fields.join(', ') + ' WHERE MaNguoiDung = @MaNguoiDung';

        const request = pool.request().input('MaNguoiDung', sql.Int, id);
        if (MaQuyen !== undefined) request.input('MaQuyen', sql.Int, MaQuyen);
        if (TrangThai !== undefined) request.input('TrangThai', sql.Int, TrangThai);
        if (HoTen !== undefined) request.input('HoTen', sql.NVarChar, HoTen);
        if (Email !== undefined) request.input('Email', sql.VarChar, Email);
        if (SoDienThoai !== undefined) request.input('SoDienThoai', sql.VarChar, SoDienThoai);
        if (AnhDaiDien !== undefined) request.input('AnhDaiDien', sql.VarChar, AnhDaiDien);
        if (MatKhau !== undefined) request.input('MatKhau', sql.VarChar, MatKhau);
        if (DiaChi !== undefined) request.input('DiaChi', sql.NVarChar, DiaChi);

        await request.query(queryStr);
        res.json({ message: 'Cập nhật thành công', success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Xóa khách hàng (Admin)
app.delete('/api/admin/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await connectDB();
        await pool.request().input('Id', sql.Int, id).query('DELETE FROM NguoiDung WHERE MaNguoiDung = @Id');
        res.json({ message: 'Xóa tài khoản thành công', success: true });
    } catch (err) {
        // Nếu user này đã từng đặt tour thì không thể xóa do khóa ngoại
        if (err.message.includes('REFERENCE') || err.message.includes('FOREIGN KEY')) {
            return res.status(400).json({ success: false, message: 'Tài khoản này đã từng giao dịch đặt tour nên không thể xóa! Hãy dùng tính năng KHÓA tài khoản.' });
        }
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// API BẢNG ĐIỀU KHIỂN & THỐNG KÊ (ADMIN DASHBOARD)
// ==========================================
app.get('/api/admin/dashboard', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const pool = await connectDB();

        // Câu truy vấn Doanh thu (Áp dụng lọc ngày)
        let request = pool.request();
        let dateCondition = "";
        if (startDate && endDate) {
            dateCondition = " AND CAST(NgayDat AS DATE) BETWEEN @sd AND @ed";
            request.input('sd', sql.NVarChar, startDate);
            request.input('ed', sql.NVarChar, endDate);
        }

        const doanhThuQuery = await request.query(`
            SELECT SUM(TongTien) as TongDoanhThu 
            FROM DonDatTour 
            WHERE TrangThai IN (N'Đã thanh toán', N'Hoàn thành', N'Đã xác nhận') ${dateCondition}
        `);
        const tongDoanhThu = doanhThuQuery.recordset[0].TongDoanhThu || 0;

        // Tổng số tour (đang hoạt động - không phụ thuộc ngày)
        const tourQuery = await pool.request().query("SELECT COUNT(*) as TongTour FROM Tour WHERE TrangThai = 1");
        const tongTour = tourQuery.recordset[0].TongTour;

        // Tổng số đơn (áp dụng lọc ngày)
        const donHangRequest = pool.request();
        let donHangDateCondition = "";
        if (startDate && endDate) {
            donHangDateCondition = " WHERE CAST(NgayDat AS DATE) BETWEEN @sd AND @ed";
            donHangRequest.input('sd', sql.NVarChar, startDate);
            donHangRequest.input('ed', sql.NVarChar, endDate);
        }
        const donHangQuery = await donHangRequest.query(`SELECT COUNT(*) as TongDon FROM DonDatTour ${donHangDateCondition}`);
        const tongDon = donHangQuery.recordset[0].TongDon;

        // Tổng số khách hàng (toàn hệ thống)
        const khachHangQuery = await pool.request().query("SELECT COUNT(*) as TongKhach FROM NguoiDung WHERE MaQuyen = 2");
        const tongKhach = khachHangQuery.recordset[0].TongKhach;

        // Câu truy vấn biểu đồ theo NGÀY
        const chartQueryDay = await pool.request()
            .input('sd', sql.NVarChar, startDate)
            .input('ed', sql.NVarChar, endDate)
            .query(`
                SELECT ${startDate && endDate ? "" : "TOP 14"} 
                    FORMAT(NgayDat, 'dd/MM') as ThoiGian, 
                    SUM(TongTien) as DoanhThu 
                FROM DonDatTour 
                WHERE TrangThai IN (N'Đã thanh toán', N'Hoàn thành', N'Đã xác nhận')
                ${startDate && endDate ? " AND CAST(NgayDat AS DATE) BETWEEN @sd AND @ed" : ""}
                GROUP BY FORMAT(NgayDat, 'dd/MM'), CAST(NgayDat AS DATE)
                ORDER BY CAST(NgayDat AS DATE) ASC
            `);

        // Câu truy vấn biểu đồ theo THÁNG
        const chartQueryMonth = await pool.request()
            .input('sd', sql.NVarChar, startDate)
            .input('ed', sql.NVarChar, endDate)
            .query(`
                SELECT ${startDate && endDate ? "" : "TOP 6"} 
                    FORMAT(NgayDat, 'MM/yyyy') as ThoiGian, 
                    SUM(TongTien) as DoanhThu 
                FROM DonDatTour 
                WHERE TrangThai IN (N'Đã thanh toán', N'Hoàn thành', N'Đã xác nhận')
                ${startDate && endDate ? " AND CAST(NgayDat AS DATE) BETWEEN @sd AND @ed" : ""}
                GROUP BY FORMAT(NgayDat, 'MM/yyyy'), YEAR(NgayDat), MONTH(NgayDat)
                ORDER BY YEAR(NgayDat) ASC, MONTH(NgayDat) ASC
            `);

        // Câu truy vấn biểu đồ theo NĂM
        const chartQueryYear = await pool.request()
            .input('sd', sql.NVarChar, startDate)
            .input('ed', sql.NVarChar, endDate)
            .query(`
                SELECT ${startDate && endDate ? "" : "TOP 5"} 
                    FORMAT(NgayDat, 'yyyy') as ThoiGian, 
                    SUM(TongTien) as DoanhThu 
                FROM DonDatTour 
                WHERE TrangThai IN (N'Đã thanh toán', N'Hoàn thành', N'Đã xác nhận')
                ${startDate && endDate ? " AND CAST(NgayDat AS DATE) BETWEEN @sd AND @ed" : ""}
                GROUP BY FORMAT(NgayDat, 'yyyy')
                ORDER BY FORMAT(NgayDat, 'yyyy') ASC
            `);

        res.json({
            tongDoanhThu,
            tongTour,
            tongDon,
            tongKhach,
            chartDataDay: chartQueryDay.recordset,
            chartDataMonth: chartQueryMonth.recordset,
            chartDataYear: chartQueryYear.recordset
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// API TIN TỨC & LIÊN HỆ
// ==========================================

// Lấy danh sách tin tức
app.get('/api/tin-tuc', async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM TinTuc ORDER BY NgayDang DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Gửi liên hệ
app.post('/api/lien-he', async (req, res) => {
    try {
        const { HoTen, Email, SoDienThoai, ChuDe, NoiDung } = req.body;
        const pool = await connectDB();

        await pool.request()
            .input('HoTen', sql.NVarChar, HoTen)
            .input('Email', sql.VarChar, Email)
            .input('SoDienThoai', sql.VarChar, SoDienThoai)
            .input('ChuDe', sql.NVarChar, ChuDe)
            .input('NoiDung', sql.NVarChar, NoiDung)
            .query(`
                INSERT INTO LienHe (HoTen, Email, SoDienThoai, ChuDe, NoiDung, TrangThai)
                VALUES (@HoTen, @Email, @SoDienThoai, @ChuDe, @NoiDung, 0)
            `);

        // GỬI EMAIL THÔNG BÁO CHO ADMIN
        try {
            const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
            if (adminEmail) {
                const mailToAdmin = {
                    from: process.env.EMAIL_USER || '"Du Lịch Việt" <noreply@dulichviet.com>',
                    to: adminEmail,
                    subject: `[Liên Hệ Mới] ${ChuDe || 'Yêu cầu tư vấn'} - từ ${HoTen}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                            <h2 style="color: #2563eb; text-align: center;">📩 CÓ KHÁCH HÀNG MỚI LIÊN HỆ TƯ VẤN</h2>
                            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                                <tr style="background-color: #f3f4f6;"><td style="padding: 10px; border: 1px solid #ddd;"><b>Họ tên:</b></td><td style="padding: 10px; border: 1px solid #ddd;">${HoTen}</td></tr>
                                <tr><td style="padding: 10px; border: 1px solid #ddd;"><b>Email:</b></td><td style="padding: 10px; border: 1px solid #ddd;">${Email}</td></tr>
                                <tr style="background-color: #f3f4f6;"><td style="padding: 10px; border: 1px solid #ddd;"><b>Số ĐT:</b></td><td style="padding: 10px; border: 1px solid #ddd;">${SoDienThoai || 'Không cung cấp'}</td></tr>
                                <tr><td style="padding: 10px; border: 1px solid #ddd;"><b>Chủ đề:</b></td><td style="padding: 10px; border: 1px solid #ddd;">${ChuDe || 'Không có'}</td></tr>
                                <tr style="background-color: #fffbeb;"><td style="padding: 10px; border: 1px solid #ddd;"><b>Nội dung:</b></td><td style="padding: 10px; border: 1px solid #ddd;">${NoiDung}</td></tr>
                            </table>
                            <p style="margin-top: 15px; color: #6b7280; font-size: 12px; text-align: center;">Vui lòng phản hồi sớm cho khách hàng qua email hoặc số điện thoại trên.</p>
                        </div>
                    `
                };
                transporter.sendMail(mailToAdmin, (err, info) => {
                    if (err) console.log('⚠️ Gửi mail liên hệ cho Admin thất bại:', err.message);
                    else console.log('✅ Đã gửi mail thông báo liên hệ mới cho Admin');
                });
            }
        } catch (mailErr) {
            console.log('⚠️ Lỗi gửi mail liên hệ:', mailErr.message);
        }

        res.json({ success: true, message: 'Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// API QUẢN LÝ TOUR (ADMIN)
// ==========================================

// 1. Thêm Tour mới
app.post('/api/admin/tours', async (req, res) => {
    try {
        const { TenTour, AnhBia, GiaGoc, PhanTramGiamGia, MoTa, ThoiGian, LichTrinh, DiemKhoiHanh, MaLoai } = req.body;
        const pool = await connectDB();

        // Insert Tour
        const result = await pool.request()
            .input('TenTour', sql.NVarChar, TenTour)
            .input('AnhBia', sql.VarChar, AnhBia)
            .input('GiaGoc', sql.Decimal, GiaGoc)
            .input('PhanTramGiamGia', sql.Int, PhanTramGiamGia || 0)
            .input('MoTa', sql.NVarChar, MoTa)
            .input('ThoiGian', sql.NVarChar, ThoiGian)
            .input('DiemKhoiHanh', sql.NVarChar, DiemKhoiHanh)
            .input('MaLoai', sql.Int, MaLoai || null)
            .query(`
                INSERT INTO Tour (TenTour, AnhBia, GiaGoc, PhanTramGiamGia, MoTa, ThoiGian, DiemKhoiHanh, MaLoai)
                OUTPUT INSERTED.MaTour
                VALUES (@TenTour, @AnhBia, @GiaGoc, @PhanTramGiamGia, @MoTa, @ThoiGian, @DiemKhoiHanh, @MaLoai)
            `);

        const maTourMoi = result.recordset[0].MaTour;

        // [QUAN TRỌNG]: Thêm lịch trình chi tiết vào Database
        if (LichTrinh && Array.isArray(LichTrinh) && LichTrinh.length > 0) {
            for (let i = 0; i < LichTrinh.length; i++) {
                const item = LichTrinh[i];
                await pool.request()
                    .input('MaTour', sql.Int, maTourMoi)
                    .input('NgayThu', sql.Int, item.NgayThu || (i + 1))
                    .input('TieuDe', sql.NVarChar, item.TieuDe || '')
                    .input('ThoiGian', sql.NVarChar, item.ThoiGian || '')
                    .input('NoiDung', sql.NVarChar, item.NoiDung || '')
                    .query(`
                        INSERT INTO LichTrinhTour (MaTour, NgayThu, TieuDe, ThoiGian, NoiDung)
                        VALUES (@MaTour, @NgayThu, @TieuDe, @ThoiGian, @NoiDung)
                    `);
            }
        }

        res.json({ success: true, message: 'Thêm tour thành công!', MaTour: maTourMoi });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Sửa Tour
app.put('/api/admin/tours/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log("🛠 Đang cập nhật Tour ID:", id);
        console.log("📦 Dữ liệu nhận được:", req.body);

        const { TenTour, AnhBia, GiaGoc, PhanTramGiamGia, MoTa, ThoiGian, DiemKhoiHanh, LichTrinh, MaLoai } = req.body;
        const pool = await connectDB();

        await pool.request()
            .input('MaTour', sql.Int, id)
            .input('TenTour', sql.NVarChar, TenTour)
            .input('AnhBia', sql.VarChar, AnhBia)
            .input('GiaGoc', sql.Decimal, GiaGoc)
            .input('PhanTramGiamGia', sql.Int, PhanTramGiamGia || 0)
            .input('MoTa', sql.NVarChar, MoTa)
            .input('ThoiGian', sql.NVarChar, ThoiGian)
            .input('DiemKhoiHanh', sql.NVarChar, DiemKhoiHanh || null) // Handle null/undefined
            .input('MaLoai', sql.Int, MaLoai || null)
            .query(`
                UPDATE Tour 
                SET TenTour = @TenTour, AnhBia = @AnhBia, GiaGoc = @GiaGoc, PhanTramGiamGia = @PhanTramGiamGia,
                    MoTa = @MoTa, ThoiGian = @ThoiGian, DiemKhoiHanh = @DiemKhoiHanh, MaLoai = @MaLoai
                WHERE MaTour = @MaTour
            `);

        // [QUAN TRỌNG]: Cập nhật Lịch trình chi tiết (Update)
        // Bằng cách xóa toàn bộ lịch trình cũ của Tour này và thêm mới lại
        if (LichTrinh && Array.isArray(LichTrinh)) {
            // 1. Xóa lịch trình cũ
            await pool.request()
                .input('MaTour', sql.Int, id)
                .query('DELETE FROM LichTrinhTour WHERE MaTour = @MaTour');

            // 2. Thêm lại từng ngày
            for (let i = 0; i < LichTrinh.length; i++) {
                const item = LichTrinh[i];
                await pool.request()
                    .input('MaTour', sql.Int, id)
                    .input('NgayThu', sql.Int, item.NgayThu || (i + 1))
                    .input('TieuDe', sql.NVarChar, item.TieuDe || '')
                    .input('ThoiGian', sql.NVarChar, item.ThoiGian || '')
                    .input('NoiDung', sql.NVarChar, item.NoiDung || '')
                    .query(`
                        INSERT INTO LichTrinhTour (MaTour, NgayThu, TieuDe, ThoiGian, NoiDung)
                        VALUES (@MaTour, @NgayThu, @TieuDe, @ThoiGian, @NoiDung)
                    `);
            }
        }

        res.json({ success: true, message: 'Cập nhật tour thành công!' });
    } catch (err) {
        console.error("❌ Lỗi Cập Nhật Tour:", err); // Log lỗi chi tiết
        res.status(500).json({ error: err.message });
    }
});

// 3. Xóa Tour
app.delete('/api/admin/tours/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await connectDB();

        // 1. Kiểm tra xem tour này có đơn đặt hàng nào chưa (DonDatTour)
        // Kết nối qua bảng LichKhoiHanh để đếm số đơn hàng chưa hủy
        const checkBooking = await pool.request()
            .input('MaTour', sql.Int, id)
            .query(`
                SELECT COUNT(d.MaDon) as SoDon 
                FROM DonDatTour d
                JOIN LichKhoiHanh l ON d.MaLich = l.MaLich
                WHERE l.MaTour = @MaTour AND d.TrangThai != N'Hủy'
            `);

        if (checkBooking.recordset[0].SoDon > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Không thể xóa Tour này vì đang có ${checkBooking.recordset[0].SoDon} đơn đặt hàng của khách! Hãy hủy các đơn hàng trước hoặc chuyển sang trạng thái Ngừng kinh doanh.` 
            });
        }

        // 2. Nếu không có khách, tiến hành xóa các dữ liệu liên quan để tránh lỗi khóa ngoại (FK)
        // Xóa Lịch trình chi tiết
        await pool.request().input('MaTour', sql.Int, id).query('DELETE FROM LichTrinhTour WHERE MaTour = @MaTour');

        // Xóa Lịch Chạy (LichKhoiHanh)
        await pool.request().input('MaTour', sql.Int, id).query('DELETE FROM LichKhoiHanh WHERE MaTour = @MaTour');

        // Xóa khỏi danh sách Yêu thích
        await pool.request().input('MaTour', sql.Int, id).query('DELETE FROM YeuThich WHERE MaTour = @MaTour');

        // Cuối cùng mới xóa Tour chính
        await pool.request()
            .input('MaTour', sql.Int, id)
            .query('DELETE FROM Tour WHERE MaTour = @MaTour');

        res.json({ success: true, message: 'Đã xóa tour và các dữ liệu liên quan thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// API QUẢN LÝ LỊCH KHỞI HÀNH (ADMIN)
// ==========================================

// 1. Lấy danh sách lịch khởi hành của 1 tour (Bao gồm cả lịch đã qua + Tên HDV)
app.get('/api/admin/schedules/:tourId', async (req, res) => {
    try {
        const { tourId } = req.params;
        const pool = await connectDB();
        const result = await pool.request()
            .input('MaTour', sql.Int, tourId)
            .query(`
                SELECT l.*, h.HoTen AS TenHDV 
                FROM LichKhoiHanh l 
                LEFT JOIN HuongDanVien h ON l.MaHDV = h.MaHDV 
                WHERE l.MaTour = @MaTour 
                ORDER BY l.NgayKhoiHanh DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Thêm lịch khởi hành mới (có gán Hướng Dẫn Viên)
app.post('/api/admin/schedules', async (req, res) => {
    try {
        const { MaTour, NgayKhoiHanh, NgayVe, SoChoToiDa, GiaTourHienTai, MaHDV } = req.body;
        const pool = await connectDB();

        await pool.request()
            .input('MaTour', sql.Int, MaTour)
            .input('NgayKhoiHanh', sql.Date, NgayKhoiHanh)
            .input('NgayVe', sql.Date, NgayVe)
            .input('SoChoToiDa', sql.Int, SoChoToiDa)
            .input('GiaTourHienTai', sql.Decimal, GiaTourHienTai)
            .input('MaHDV', sql.Int, MaHDV || null)
            .query(`
                INSERT INTO LichKhoiHanh (MaTour, NgayKhoiHanh, NgayVe, SoChoToiDa, SoChoDaDat, GiaTourHienTai, TrangThai, MaHDV)
                VALUES (@MaTour, @NgayKhoiHanh, @NgayVe, @SoChoToiDa, 0, @GiaTourHienTai, N'Mở', @MaHDV)
            `);

        res.json({ success: true, message: 'Thêm lịch khởi hành thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Xóa lịch khởi hành
app.delete('/api/admin/schedules/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await connectDB();

        // Kiểm tra xem đã có ai đặt chưa before delete
        const check = await pool.request().input('MaLich', sql.Int, id)
            .query('SELECT SoChoDaDat FROM LichKhoiHanh WHERE MaLich = @MaLich');

        if (check.recordset[0] && check.recordset[0].SoChoDaDat > 0) {
            return res.status(400).json({ message: 'Không thể xóa lịch này vì đã có khách đặt! Hãy sử dụng tính năng HỦY LỊCH.' });
        }

        await pool.request().input('MaLich', sql.Int, id).query('DELETE FROM LichKhoiHanh WHERE MaLich = @MaLich');
        res.json({ success: true, message: 'Đã xóa lịch thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Hủy lịch khởi hành (DO SỰ CỐ - ADMIN)
// Mục đích: Hủy cả chuyến đi (VD: do bão), tự động hủy toàn bộ đơn của khách
app.put('/api/admin/schedules/cancel/:id', async (req, res) => {
    try {
        const { id } = req.params; // MaLich
        const { lyDoHuy } = req.body;
        const pool = await connectDB();

        console.log(`📡 Đang xử lý hủy lịch #${id}. Lý do: ${lyDoHuy}`);

        // 1. Lấy thông tin lịch và tour
        const lichInfo = await pool.request()
            .input('MaLich', sql.Int, id)
            .query(`
                SELECT l.*, t.TenTour 
                FROM LichKhoiHanh l 
                JOIN Tour t ON l.MaTour = t.MaTour 
                WHERE l.MaLich = @MaLich
            `);

        if (lichInfo.recordset.length === 0) return res.status(404).json({ message: 'Không tìm thấy lịch!' });
        const lich = lichInfo.recordset[0];

        // 2. Lấy danh sách khách hàng bị ảnh hưởng (chưa hủy)
        const dskhach = await pool.request()
            .input('MaLich', sql.Int, id)
            .query(`
                SELECT d.MaDon, d.TongTien, n.HoTen, n.Email 
                FROM DonDatTour d
                JOIN NguoiDung n ON d.MaNguoiDung = n.MaNguoiDung
                WHERE d.MaLich = @MaLich AND d.TrangThai != N'Hủy'
            `);

        // 3. Cập nhật trạng thái Lịch thành 'Hủy'
        await pool.request()
            .input('MaLich', sql.Int, id)
            .query("UPDATE LichKhoiHanh SET TrangThai = N'Đã hủy' WHERE MaLich = @MaLich");

        // 4. Cập nhật tất cả các đơn hàng liên quan
        const ghiChuMoi = `Hủy bởi Admin - Lý do: ${lyDoHuy || 'Sự cố bất khả kháng'}`;
        await pool.request()
            .input('MaLich', sql.Int, id)
            .input('GhiChu', sql.NVarChar, ghiChuMoi)
            .query("UPDATE DonDatTour SET TrangThai = N'Đã hủy', GhiChu = @GhiChu WHERE MaLich = @MaLich AND TrangThai != N'Hủy'");

        // 5. Gửi email thông báo cho từng khách
        for (const khách of dskhach.recordset) {
            const mailOptions = {
                from: process.env.EMAIL_USER || '"Du Lịch Việt" <noreply@dulichviet.com>',
                to: khách.Email,
                subject: `[QUAN TRỌNG] Thông báo Hủy Tour khẩn cấp - ${lich.TenTour}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #dc2626; border-radius: 15px; overflow: hidden;">
                        <div style="background-color: #dc2626; color: white; padding: 30px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px;">THÔNG BÁO HỦY TOUR</h1>
                            <p style="margin-top: 10px; font-size: 16px;">Sự cố bất khả kháng</p>
                        </div>
                        <div style="padding: 30px; line-height: 1.6; color: #333;">
                            <p>Xin chào <b>${khách.HoTen}</b>,</p>
                            <p>Chúng tôi rất tiếc phải thông báo rằng chuyến đi <b>${lich.TenTour}</b> khởi hành ngày <b>${new Date(lich.NgayKhoiHanh).toLocaleDateString('vi-VN')}</b> buộc phải hủy bỏ vì lý do: <b style="color: #dc2626;">${lyDoHuy || 'Sự cố thời tiết/kỹ thuật'}</b>.</p>
                            
                            <div style="background-color: #fef2f2; border-left: 5px solid #dc2626; padding: 20px; margin: 25px 0;">
                                <h3 style="margin-top: 0; color: #991b1b;">CHÍNH SÁCH HOÀN TIỀN 100%</h3>
                                <p style="margin-bottom: 0;">Vì đây là sự cố ngoài ý muốn, Du Lịch Việt cam kết <b>hoàn lại 100%</b> số tiền khách đã thanh toán (<b>${new Intl.NumberFormat('vi-VN').format(khách.TongTien)} VNĐ</b>).</p>
                            </div>

                            <p>Bộ phận kế toán của chúng tôi sẽ liên hệ với bạn trong vòng <b>24 giờ</b> làm việc để thực hiện thủ tục hoàn tiền qua tài khoản ngân hàng của bạn.</p>
                            
                            <p>Một lần nữa, chúng tôi chân thành xin lỗi vì sự bất tiện này và hy vọng sẽ được phục vụ bạn trong những hành trình tiếp theo.</p>
                            
                            <div style="margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
                                <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Mọi thắc mắc vui lòng liên hệ hotline:</p>
                                <p style="font-size: 20px; font-weight: bold; color: #dc2626;">📞 0354858892 (Hỗ trợ 24/7)</p>
                            </div>
                        </div>
                        <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #999;">
                            &copy; 2026 <b>Công ty Du Lịch Việt</b> - Trân trọng cảm ơn.
                        </div>
                    </div>
                `
            };

            // Gửi mail (không block luồng)
            transporter.sendMail(mailOptions, (err) => {
                if (err) console.log(`❌ Lỗi gửi mail hủy cho ${khách.Email}:`, err.message);
                else console.log(`✅ Đã gửi mail hủy cho khách đơn #${khách.MaDon}`);
            });
        }

        res.json({ success: true, message: `Đã hủy lịch khởi hành và gửi thông báo hoàn tiền cho ${dskhach.recordset.length} khách hàng.` });

    } catch (err) {
        console.error("❌ Lỗi hủy lịch Admin:", err);
        res.status(500).json({ error: err.message });
    }
});

// =============================================
// API QUẢN LÝ HƯỚNG DẪN VIÊN (HuongDanVien)
// =============================================

// Lấy tất cả HDV
app.get('/api/huong-dan-vien', async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM HuongDanVien ORDER BY MaHDV DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy HDV theo ID
app.get('/api/huong-dan-vien/:id', async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('MaHDV', sql.Int, req.params.id)
            .query('SELECT * FROM HuongDanVien WHERE MaHDV = @MaHDV');
        if (result.recordset.length === 0) return res.status(404).json({ message: 'Không tìm thấy HDV!' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Thêm HDV mới
app.post('/api/huong-dan-vien', async (req, res) => {
    try {
        const { HoTen, TieuSu, SoDienThoai, Email, AnhDaiDien, TrangThai } = req.body;
        const pool = await connectDB();
        await pool.request()
            .input('HoTen', sql.NVarChar, HoTen)
            .input('TieuSu', sql.NVarChar, TieuSu || '')
            .input('SoDienThoai', sql.VarChar, SoDienThoai || '')
            .input('Email', sql.VarChar, Email || '')
            .input('AnhDaiDien', sql.VarChar, AnhDaiDien || '')
            .input('TrangThai', sql.Bit, TrangThai !== undefined ? TrangThai : 1)
            .query(`INSERT INTO HuongDanVien (HoTen, TieuSu, SoDienThoai, Email, AnhDaiDien, TrangThai)
                    VALUES (@HoTen, @TieuSu, @SoDienThoai, @Email, @AnhDaiDien, @TrangThai)`);
        res.json({ success: true, message: 'Thêm hướng dẫn viên thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cập nhật HDV
app.put('/api/huong-dan-vien/:id', async (req, res) => {
    try {
        const { HoTen, TieuSu, SoDienThoai, Email, AnhDaiDien, TrangThai } = req.body;
        const pool = await connectDB();
        await pool.request()
            .input('MaHDV', sql.Int, req.params.id)
            .input('HoTen', sql.NVarChar, HoTen)
            .input('TieuSu', sql.NVarChar, TieuSu || '')
            .input('SoDienThoai', sql.VarChar, SoDienThoai || '')
            .input('Email', sql.VarChar, Email || '')
            .input('AnhDaiDien', sql.VarChar, AnhDaiDien || '')
            .input('TrangThai', sql.Bit, TrangThai !== undefined ? TrangThai : 1)
            .query(`UPDATE HuongDanVien SET 
                    HoTen = @HoTen, TieuSu = @TieuSu, SoDienThoai = @SoDienThoai, 
                    Email = @Email, AnhDaiDien = @AnhDaiDien, TrangThai = @TrangThai
                    WHERE MaHDV = @MaHDV`);
        res.json({ success: true, message: 'Cập nhật hướng dẫn viên thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Xóa HDV
app.delete('/api/huong-dan-vien/:id', async (req, res) => {
    try {
        const pool = await connectDB();
        // Kiểm tra HDV có đang gắn với lịch khởi hành không
        const check = await pool.request()
            .input('MaHDV', sql.Int, req.params.id)
            .query('SELECT COUNT(*) as count FROM LichKhoiHanh WHERE MaHDV = @MaHDV');
        if (check.recordset[0].count > 0) {
            return res.status(400).json({ message: 'Không thể xóa! HDV đang được gán vào lịch khởi hành.' });
        }
        await pool.request()
            .input('MaHDV', sql.Int, req.params.id)
            .query('DELETE FROM HuongDanVien WHERE MaHDV = @MaHDV');
        res.json({ success: true, message: 'Đã xóa hướng dẫn viên thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============================================
// API QUẢN LÝ TOUR YÊU THÍCH (Wishlist)
// =============================================

// Lấy danh sách tour yêu thích của user
app.get('/api/wishlist/:userId', async (req, res) => {
    try {
        console.log("🔍 API Lấy wishlist cho User ID:", req.params.userId);
        const pool = await connectDB();
        const result = await pool.request()
            .input('MaNguoiDung', sql.Int, req.params.userId)
            .query(`
                SELECT t.*, y.NgayLuu
                FROM YeuThich y
                JOIN Tour t ON y.MaTour = t.MaTour
                WHERE y.MaNguoiDung = @MaNguoiDung
                ORDER BY y.NgayLuu DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Thêm/Xóa tour yêu thích (Toggle)
app.post('/api/wishlist/toggle', async (req, res) => {
    try {
        const { MaNguoiDung, MaTour } = req.body;
        const pool = await connectDB();
        
        // Kiểm tra xem đã yêu thích chưa
        const check = await pool.request()
            .input('MaNguoiDung', sql.Int, MaNguoiDung)
            .input('MaTour', sql.Int, MaTour)
            .query('SELECT * FROM YeuThich WHERE MaNguoiDung = @MaNguoiDung AND MaTour = @MaTour');

        if (check.recordset.length > 0) {
            // Nếu có rồi thì xóa (Unlike)
            await pool.request()
                .input('MaNguoiDung', sql.Int, MaNguoiDung)
                .input('MaTour', sql.Int, MaTour)
                .query('DELETE FROM YeuThich WHERE MaNguoiDung = @MaNguoiDung AND MaTour = @MaTour');
            res.json({ success: true, isFavorite: false, message: 'Đã xóa khỏi danh sách yêu thích!' });
        } else {
            // Nếu chưa có thì thêm (Like)
            await pool.request()
                .input('MaNguoiDung', sql.Int, MaNguoiDung)
                .input('MaTour', sql.Int, MaTour)
                .query('INSERT INTO YeuThich (MaNguoiDung, MaTour) VALUES (@MaNguoiDung, @MaTour)');
            res.json({ success: true, isFavorite: true, message: 'Đã thêm vào danh sách yêu thích!' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Kiểm tra danh sách ID tour đã yêu thích của user (để hiện tim đỏ/trắng)
app.get('/api/wishlist/check/:userId', async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('MaNguoiDung', sql.Int, req.params.userId)
            .query('SELECT MaTour FROM YeuThich WHERE MaNguoiDung = @MaNguoiDung');
        // Trả về mảng các MaTour
        res.json(result.recordset.map(item => item.MaTour));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ==========================================
// API QUẢN LÝ ĐÁNH GIÁ & PHẢN HỒI
// ==========================================

// 1. Lấy danh sách đánh giá của 1 tour (cho khách xem)
app.get('/api/reviews/tour/:tourId', async (req, res) => {
    try {
        const { tourId } = req.params;
        const pool = await connectDB();
        const result = await pool.request()
            .input('MaTour', sql.Int, tourId)
            .query(`
                SELECT d.*, n.HoTen, n.AnhDaiDien 
                FROM DanhGia d
                JOIN NguoiDung n ON d.MaNguoiDung = n.MaNguoiDung
                WHERE d.MaTour = @MaTour AND d.TrangThai = 1
                ORDER BY d.NgayDanhGia DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Gửi đánh giá mới (cho khách)
app.post('/api/reviews', async (req, res) => {
    try {
        const { MaNguoiDung, MaTour, Diem, BinhLuan } = req.body;
        const pool = await connectDB();
        
        await pool.request()
            .input('MaNguoiDung', sql.Int, MaNguoiDung)
            .input('MaTour', sql.Int, MaTour)
            .input('Diem', sql.Int, Diem)
            .input('BinhLuan', sql.NVarChar, BinhLuan)
            .query(`
                INSERT INTO DanhGia (MaNguoiDung, MaTour, Diem, BinhLuan, TrangThai)
                VALUES (@MaNguoiDung, @MaTour, @Diem, @BinhLuan, 1)
            `);
        
        res.json({ success: true, message: 'Cảm ơn bạn đã đánh giá!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Lấy tất cả đánh giá (cho Admin)
app.get('/api/admin/reviews', async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .query(`
                SELECT d.*, n.HoTen, n.Email, t.TenTour, t.AnhBia
                FROM DanhGia d
                JOIN NguoiDung n ON d.MaNguoiDung = n.MaNguoiDung
                JOIN Tour t ON d.MaTour = t.MaTour
                ORDER BY d.NgayDanhGia DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Admin phản hồi và cập nhật trạng thái
app.put('/api/admin/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { PhanHoi, TrangThai } = req.body;
        const pool = await connectDB();
        
        await pool.request()
            .input('MaDanhGia', sql.Int, id)
            .input('PhanHoi', sql.NVarChar, PhanHoi)
            .input('TrangThai', sql.Bit, TrangThai)
            .query(`
                UPDATE DanhGia 
                SET PhanHoi = @PhanHoi, 
                    TrangThai = @TrangThai,
                    NgayPhanHoi = CASE WHEN @PhanHoi IS NOT NULL THEN GETDATE() ELSE NgayPhanHoi END
                WHERE MaDanhGia = @MaDanhGia
            `);
            
        res.json({ success: true, message: 'Cập nhật đánh giá thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Admin xóa đánh giá
app.delete('/api/admin/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await connectDB();
        await pool.request()
            .input('MaDanhGia', sql.Int, id)
            .query('DELETE FROM DanhGia WHERE MaDanhGia = @MaDanhGia');
        res.json({ success: true, message: 'Đã xóa đánh giá!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, async () => {

    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    // Thử kết nối DB khi server bật
    await connectDB();
});
