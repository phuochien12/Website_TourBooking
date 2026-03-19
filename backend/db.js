const sql = require('mssql');
require('dotenv').config();

// Cấu hình linh hoạt: Phù hợp nhất cho Somee/Azure SQL
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, 
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: true, // PHẢI để true khi kết nối ra Cloud (Somee/Azure)
        trustServerCertificate: true, // Cho phép chứng chỉ tự ký
        enableArithAbort: true
    },
    // Tăng thời gian chờ (Timeout) đề phòng Somee chạy chậm
    connectionTimeout: 30000,
    requestTimeout: 30000
};

async function connectDB() {
    try {
        // Tạo và trả về connection pool
        let pool = await sql.connect(config);
        console.log("✅ Kết nối đến SQL Server (Somee/Cloud) thành công!");
        return pool;
    } catch (err) {
        console.error("❌ Lỗi kết nối SQL Server:", err.message);
        throw err;
    }
}

module.exports = { sql, connectDB };
