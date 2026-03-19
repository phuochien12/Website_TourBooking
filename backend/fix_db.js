const sql = require('mssql/msnodesqlv8');
const dotenv = require('dotenv');

// Load đúng file .env của backend
dotenv.config({ path: './backend/.env' });
// Hoặc nếu chạy từ thư mục gốc thì path có thể khác, ta load mặc định luôn
dotenv.config();

const config = {
    user: process.env.DB_USER,      // Lấy user từ .env
    password: process.env.DB_PASSWORD, // Lấy pass từ .env
    server: process.env.DB_SERVER,  // Lấy server từ .env
    database: process.env.DB_DATABASE, // Lấy DB Name từ .env
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function fixDatabase() {
    try {
        console.log(`⏳ Đang kết nối tới ${config.server} -> ${config.database}...`);
        const pool = await sql.connect(config);

        // 1. Kiểm tra và thêm cột DiemKhoiHanh
        console.log("🛠 Đang kiểm tra cột DiemKhoiHanh...");

        try {
            await pool.request().query("SELECT TOP 1 DiemKhoiHanh FROM Tour");
            console.log("✅ Cột DiemKhoiHanh ĐÃ TỒN TẠI trong Database này.");
        } catch (err) {
            console.log("⚠️ Cột DiemKhoiHanh CHƯA CÓ. Đang thêm vào...");
            await pool.request().query("ALTER TABLE Tour ADD DiemKhoiHanh NVARCHAR(100)");
            console.log("✅ Đã tạo cột DiemKhoiHanh thành công!");
        }

        // 2. Kiểm tra và thêm cột ThoiGian (Nguồn gốc lỗi 500 vừa rồi)
        console.log("🛠 Đang kiểm tra cột ThoiGian...");
        try {
            await pool.request().query("SELECT TOP 1 ThoiGian FROM Tour");
            console.log("✅ Cột ThoiGian ĐÃ TỒN TẠI.");
        } catch (err) {
            console.log("⚠️ Cột ThoiGian CHƯA CÓ. Đang thêm vào...");
            await pool.request().query("ALTER TABLE Tour ADD ThoiGian NVARCHAR(50)");
            console.log("✅ Đã tạo cột ThoiGian thành công!");
        }

        // 3. Cập nhật dữ liệu cũ
        console.log("🔄 Đang cập nhật dữ liệu mặc định...");
        await pool.request().query("UPDATE Tour SET DiemKhoiHanh = N'TP. Hồ Chí Minh' WHERE DiemKhoiHanh IS NULL");

        // Cập nhật ThoiGian từ SoNgay/SoDem cũ (nếu có) hoặc default
        await pool.request().query(`
            UPDATE Tour 
            SET ThoiGian = CAST(SoNgay AS NVARCHAR) + N' Ngày ' + CAST(SoDem AS NVARCHAR) + N' Đêm'
            WHERE ThoiGian IS NULL AND SoNgay IS NOT NULL
        `);

        console.log("✅ Đã cập nhật xong dữ liệu!");

        process.exit(0);
    } catch (err) {
        console.error("❌ Lỗi KẾT NỐI hoặc SỬA Database:", err.message);
        console.error("👉 Vui lòng kiểm tra lại file .env: Tên Server, User, Pass.");
        process.exit(1);
    }
}

fixDatabase();
