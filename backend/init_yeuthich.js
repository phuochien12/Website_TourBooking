const { connectDB } = require('./db');
const sql = require('mssql');

async function createYeuThichTable() {
    try {
        const pool = await connectDB();
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'YeuThich')
            BEGIN
                CREATE TABLE YeuThich (
                    MaYeuThich INT PRIMARY KEY IDENTITY(1,1),
                    MaNguoiDung INT NOT NULL,
                    MaTour INT NOT NULL,
                    NgayThem DATETIME DEFAULT GETDATE(),
                    CONSTRAINT FK_YeuThich_NguoiDung FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung),
                    CONSTRAINT FK_YeuThich_Tour FOREIGN KEY (MaTour) REFERENCES Tour(MaTour),
                    CONSTRAINT UQ_User_Tour UNIQUE(MaNguoiDung, MaTour)
                );
                PRINT '✅ Đã tạo bảng YeuThich thành công!';
            END
            ELSE
            BEGIN
                PRINT 'ℹ️ Bảng YeuThich đã tồn tại.';
            END
        `);
        process.exit(0);
    } catch (err) {
        console.error("❌ Lỗi khi tạo bảng YeuThich:", err);
        process.exit(1);
    }
}

createYeuThichTable();
