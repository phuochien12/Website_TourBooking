require('dotenv').config();
const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function seed() {
    try {
        console.log("Connecting to Somee for seeding...");
        let pool = await sql.connect(config);
        
        await pool.request().query("IF NOT EXISTS (SELECT * FROM NguoiDung WHERE Email = 'admin@gmail.com') " +
            "INSERT INTO NguoiDung (TenNguoiDung, Email, MatKhau, SoDienThoai, Quyen) " +
            "VALUES (N'Quản trị viên', 'admin@gmail.com', 'admin123', '0123456789', 1)");
            
        console.log("Admin account seeded successfully! (admin@gmail.com / admin123)");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seed();
