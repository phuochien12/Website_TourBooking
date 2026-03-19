const { connectDB, sql } = require('./db');

async function addItineraries() {
    let pool;
    try {
        pool = await connectDB();
        const request = pool.request();

        // Fetch all tours
        const result = await request.query(`SELECT MaTour, TenTour, ThoiGian FROM Tour`);
        const tours = result.recordset;

        console.log(`Found ${tours.length} tours. Checking itineraries...`);

        for (const tour of tours) {
            const currentItineraryResult = await pool.request()
                .input('MaTour', sql.Int, tour.MaTour)
                .query(`SELECT COUNT(*) as count FROM LichTrinhTour WHERE MaTour = @MaTour`);

            const hasItinerary = currentItineraryResult.recordset[0].count > 0;

            if (hasItinerary) {
                console.log(`Tour ID ${tour.MaTour}: clearing old itinerary...`);
                await pool.request()
                    .input('MaTour', sql.Int, tour.MaTour)
                    .query(`DELETE FROM LichTrinhTour WHERE MaTour = @MaTour`);
            }

            // Generate it based on ThoiGian
            let days = 3; // default
            if (tour.ThoiGian && typeof tour.ThoiGian === 'string') {
                const match = tour.ThoiGian.match(/(\d+)\s*ngày/i);
                if (match) {
                    days = parseInt(match[1]);
                }
            } else if (tour.SoNgay) {
                days = tour.SoNgay;
            }

            console.log(`Adding ${days} days for Tour ID ${tour.MaTour}: ${tour.TenTour}`);
            for (let i = 1; i <= days; i++) {
                let tieuDe = i === 1 ? 'Khởi hành - Đón khách và tham quan' :
                    i === days ? 'Mua sắm đặc sản và kết thúc hành trình' :
                        `Tham quan, khám phá các địa danh nổi tiếng`;
                let noiDung = i === 1 ? 'Sáng: Xe và HDV đón khách tại điểm hẹn. Khởi hành đi tour, trên đường nghe HDV giới thiệu về lịch sử, văn hóa vùng miền. Trưa: Dùng bữa trưa tại nhà hàng địa phương thưởng thức đặc sản. Chiều: Tham quan các điểm du lịch nổi bật của địa phương, tản bộ ngắm cảnh, chụp hình lưu niệm. Tối: Dùng bữa tối, tự do khám phá và vui chơi phố đêm.' :
                    i === days ? 'Sáng: Dùng điểm tâm tại khách sạn, làm thủ tục trả phòng. Trưa: Tham quan các cơ sở sản xuất thủ công mỹ nghệ, nghề truyền thống hoặc mua sắm đặc sản địa phương về làm quà. Chiều: Lên xe về lại điểm khởi hành ban đầu. Chia tay và hẹn gặp lại quý khách ở những hành trình tiếp theo.' :
                        'Sáng: Dùng điểm tâm sáng, khởi hành sớm đến khu du lịch sinh thái nổi tiếng. Trưa: Dùng bữa trưa tại nhà hàng, nghỉ ngơi. Chiều: Trải nghiệm các hoạt động ngoài trời, đi thuyền, tham quan di sản hoặc vui chơi giải trí. Tối: Về lại khách sạn, dùng bữa tối và tự do dạo phố, trải nghiệm ẩm thực đường phố.';

                await pool.request()
                    .input('MaTour', sql.Int, tour.MaTour)
                    .input('NgayThu', sql.Int, i)
                    .input('TieuDe', sql.NVarChar, `Ngày ${i}: ${tieuDe}`)
                    .input('ThoiGian', sql.NVarChar, 'Cả ngày')
                    .input('NoiDung', sql.NVarChar, noiDung)
                    .query(`
                        INSERT INTO LichTrinhTour (MaTour, NgayThu, TieuDe, ThoiGian, NoiDung)
                        VALUES (@MaTour, @NgayThu, @TieuDe, @ThoiGian, @NoiDung)
                    `);
            }
        }
        console.log("Xong! Đã thêm lịch trình chi tiết cho tất cả các tour.");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (pool) pool.close();
    }
}

addItineraries();
