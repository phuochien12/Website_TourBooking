const { connectDB, sql } = require('./db');
const fs = require('fs');

async function fixCategories() {
    try {
        const pool = await connectDB();

        // Cập nhật Tour Miền Tây (MaLoai = 6)
        await pool.request().query("UPDATE Tour SET MaLoai = 6 WHERE MaTour IN (7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18)");

        // Cập nhật Tour Miền Nam (MaLoai = 7)
        await pool.request().query("UPDATE Tour SET MaLoai = 7 WHERE MaTour IN (19, 20, 21, 22, 23, 24, 25)");

        // Cập nhật Tour Trong Nước hoặc chung (MaLoai = 8)
        await pool.request().query("UPDATE Tour SET MaLoai = 8 WHERE MaTour IN (1, 2, 3, 4)");

        // Xuất lại danh sách sau khi update
        let allTours = await pool.request().query("SELECT MaTour, TenTour, MaLoai FROM Tour");
        fs.writeFileSync('output_test.txt', JSON.stringify(allTours.recordset, null, 2), 'utf8');

        console.log("Updated categories successfully.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
fixCategories();
