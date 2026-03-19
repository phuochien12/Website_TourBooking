const { connectDB, sql } = require('./db');

// --- HÀM TẠO NỘI DUNG LỊCH TRÌNH HTML ĐẸP MẮT ---
function getRichItinerary(tourName, dayIndex, totalDays) {
    const isMienTay = /miền tây|cần thơ|châu đốc|cà mau|sóc trăng|sóc trăng|bạc liêu|mỹ tho/i.test(tourName);
    const isPhuQuoc = /phú quốc/i.test(tourName);
    const isSapa = /sapa|fansipan/i.test(tourName);
    const isDaNang = /đà nẵng|hội an|bà nà/i.test(tourName);
    const isHaLong = /hạ long|lan hạ/i.test(tourName);
    const isVungTau = /vũng tàu/i.test(tourName);
    const isCuChi = /củ chi|hồ chí minh/i.test(tourName);

    // Default style text:
    let html = `<ul style="list-style-type: disc; padding-left: 20px; space-y-2">`;
    let title = "";

    // 1. TOUR MIỀN TÂY (Dựa chính xác theo hình ảnh rference)
    if (isMienTay) {
        if (dayIndex === 1) {
            title = "SÀI GÒN - MỸ THO - VƯỜN TRÁI CÂY - BẾN TRE - CHÂU ĐỐC/CẦN THƠ (Ăn sáng, trưa, tối)";
            html += `
                <li style="margin-bottom: 8px;"><b>06h30</b>: Quý khách tập trung tại điểm hẹn, khởi hành chuyến du lịch về vùng đất trù phú của Đồng bằng sông Cửu Long. Đoàn đi theo tuyến cao tốc TP.HCM – Trung Lương.</li>
                <li style="margin-bottom: 8px;">Đến Mỹ Tho, đoàn dừng chân tại <b>trạm Mekong Restop</b>, nghỉ ngơi, chụp hình và ăn sáng với đặc sản <b>Hủ tiếu Mỹ Tho</b>. Sau đó, chụp hình tập thể lưu niệm.</li>
                <li style="margin-bottom: 8px;">Tiếp tục tham quan <b>chùa Vĩnh Tràng</b> - ngôi chùa được xây dựng vào thế kỷ XIX bởi ông bà Bùi Công Đạt.</li>
                <li style="margin-bottom: 8px;">Đoàn đến <b>Cảng du thuyền Mỹ Tho</b>, lên tàu tham quan <b>sông Tiền</b>, ngắm nhìn 4 cù lao Long, Lân, Quy, Phụng. Thuyền đi dọc theo bè cá nổi, chiêm ngưỡng <b>cầu Rạch Miễu</b>.</li>
                <li style="margin-bottom: 8px;">Đến <b>cù lao Thới Sơn (cồn Lân)</b>, du khách tản bộ trên đường làng, tham quan nhà dân và <b>vườn trái cây hơn 5.000m2</b>. Tham quan trại nuôi ong mật, thưởng thức trà mật ong chanh.</li>
                <li style="margin-bottom: 8px;">Thưởng thức <b>đờn ca tài tử Xứ Dừa</b> và ăn trái cây miễn phí.</li>
                <li style="margin-bottom: 8px;">Đi xuồng chèo vào rạch nhỏ, ngắm <b>hàng dừa nước</b> và phong cảnh miệt vườn.</li>
                <li style="margin-bottom: 8px;">Quay lại thuyền lớn, tiếp tục đến tỉnh <b>Bến Tre</b>. Tham quan <b>lò kẹo dừa, lò bánh tráng Tân Thạch</b> và trải nghiệm đi <b>xe ngựa</b> ngắm làng quê.</li>
                <li style="margin-bottom: 8px;">Đoàn dùng cơm trưa tại <b>KDL Sinh Thái Việt Nhật</b>, nơi có các mô hình nuôi <b>cá sấu, nhím, ếch, ba ba</b>... Du khách có thể thư giãn với <b>võng nghỉ</b> hoặc tham gia các trò chơi miễn phí như <b>đạp xe qua cầu, chèo thuyền, đu dây, đi cầu khỉ,...</b></li>
                <li style="margin-bottom: 8px;"><b>13h30</b>: Quay về Mỹ Tho, tiếp tục hành trình đến điểm nhận phòng tiếp theo.</li>
                <li style="margin-bottom: 8px;"><b>Chiều</b>: Đến nơi, nhận phòng khách sạn, nghỉ ngơi sau hành trình dài.</li>
                <li style="margin-bottom: 8px;"><b>18h30</b>: Xe và HDV đưa đoàn đi <b>ăn tối tại nhà hàng</b>. Tối, quý khách tự do khám phá đường phố miền Tây về đêm.</li>
            `;
        } else if (dayIndex === 2) {
            title = "KHÁM PHÁ MIỀN TÂY: NÚI SAM - MIẾU BÀ - RỪNG TRÀM TRÀ SƯ / CHỢ NỔI (Ăn sáng, trưa, tối)";
            html += `
                <li style="margin-bottom: 8px;"><b>Sáng</b>: Ăn sáng tại khách sạn. Sau đó đoàn sẽ tham quan <b>núi Sam</b>, viếng thăm <b>Miếu Bà Chúa Xứ</b>, lăng <b>Thoại Ngọc Hầu</b> và <b>Tây An Cổ Tự</b> (áp dụng cho Châu Đốc).</li>
                <li style="margin-bottom: 8px;">Trường hợp ở Cần Thơ: <b>05h30 sáng</b>: Khởi hành tham quan <b>Chợ nổi Cái Răng</b> – nét văn hóa giao thương đặc sắc trên sông nước miền Tây.</li>
                <li style="margin-bottom: 8px;">Sau đó tiếp tục di chuyển tham quan <b>Rừng Tràm Trà Sư</b> - hệ sinh thái ngập nước tuyệt đẹp với chiếc cầu tre vạn dặm xuyên rừng.</li>
                <li style="margin-bottom: 8px;"><b>Trưa</b>: Đoàn dùng bữa trưa tại nhà hàng với các món ăn mang đậm hương vị địa phương như cá lóc nướng trui, lẩu mắm, cá rô kho tộ...</li>
                <li style="margin-bottom: 8px;"><b>Chiều</b>: Khám phá các địa danh văn hóa, mua sắm đặc sản mắm Châu Đốc, tham quan lò hủ tiếu truyền thống...</li>
                <li style="margin-bottom: 8px;"><b>18h00</b>: Dùng bữa tối tại nhà hàng. Tự do tham quan và nghỉ đêm tại khách sạn.</li>
            `;
        } else if (dayIndex === totalDays) {
            title = "KẾT THÚC HÀNH TRÌNH - TRỞ VỀ ĐIỂM XUẤT PHÁT (Ăn sáng, trưa)";
            html += `
                <li style="margin-bottom: 8px;"><b>07h00</b>: Dùng điểm tâm sáng, làm thủ tục trả phòng khách sạn.</li>
                <li style="margin-bottom: 8px;"><b>Sáng</b>: Tham quan cơ sở chế biến đặc sản địa phương (bánh pía Sóc Trăng, mức dừa, mật ong...).</li>
                <li style="margin-bottom: 8px;"><b>Trưa</b>: Đoàn dùng cơm trưa, nghỉ ngơi nạp lại năng lượng chuẩn bị lộ trình về lại Sài Gòn.</li>
                <li style="margin-bottom: 8px;"><b>Chiều</b>: Lên xe cao tốc khởi hành về lại điểm xuất phát ban đầu.</li>
                <li style="margin-bottom: 8px;"><b>Dự kiến 18h00</b>: Về đến điểm hẹn, HDV chia tay quý khách, kết thúc chuyến du lịch và hẹn gặp lại.</li>
            `;
        } else {
            // Day 3 of a 4-day tour (for example Cà Mau)
            title = "CHINH PHỤC CỰC NAM TỔ QUỐC - ĐẤT MŨI CÀ MAU (Ăn sáng, trưa, tối)";
            html += `
                <li style="margin-bottom: 8px;"><b>Sáng</b>: Dùng buffet sáng tại khách sạn. Xe đưa đoàn đi tham quan tận nơi tại <b>Đất Mũi Cà Mau</b> - Cực Nam của Tổ quốc.</li>
                <li style="margin-bottom: 8px;">Chụp ảnh lưu niệm tại mốc tọa độ Quốc Gia GPS 0001 và biểu tượng Mũi Cà Mau.</li>
                <li style="margin-bottom: 8px;"><b>Trưa</b>: Dùng bữa trưa tại nhà hàng Đất Mũi, thưởng thức đặc sản cua Cà Mau chính hiệu.</li>
                <li style="margin-bottom: 8px;"><b>Chiều</b>: Di chuyển viếng thăm <b>Nhà thờ Tắc Sậy (Cha Diệp)</b>, chiêm ngưỡng kiến trúc độc đáo. Tiếp tục về lại Bạc Liêu tham quan <b>Nhà Công Tử Bạc Liêu</b> và chiêm ngưỡng <b>Cánh đồng điện gió</b>.</li>
                <li style="margin-bottom: 8px;"><b>Tối</b>: Nhận phòng khách sạn, dùng bữa tối và tự do dạo phố, khám phá miền đất võ Bạc Liêu.</li>
            `;
        }
    }
    else if (isPhuQuoc) {
        if (dayIndex === 1) {
            title = "ĐÓN KHÁCH - KHÁM PHÁ ĐÔNG ĐẢO (Ăn trưa, tối)";
            html += `
                <li style="margin-bottom: 8px;"><b>Sáng</b>: Xe và HDV đón quý khách tại sân bay / bến tàu Phú Quốc. Đưa đoàn về trung tâm Dương Đông.</li>
                <li style="margin-bottom: 8px;"><b>Trưa</b>: Dùng bữa trưa tại nhà hàng, sau đó về khách sạn nhận phòng nghỉ ngơi.</li>
                <li style="margin-bottom: 8px;"><b>Chiều</b>: Bắt đầu hành trình khám phá Đông Đảo: Tham quan <b>Vườn Tiêu Suối Đá</b>, <b>Nhà thùng nước mắm truyền thống</b>, <b>Cơ sở ủ rượu vang Sim</b>.</li>
                <li style="margin-bottom: 8px;">Thăm quan <b>Chùa Sư Muôn</b> và <b>Dinh Cậu</b> - Biểu tượng tín ngưỡng của người dân đảo Ngọc.</li>
                <li style="margin-bottom: 8px;"><b>18h30</b>: Dùng cơm tối. Xe đưa đoàn đi chợ đêm Phú Quốc, tự do thưởng thức hải sản tươi sống.</li>
            `;
        } else if (dayIndex === totalDays) {
            title = "TỰ DO MUA SẮM ĐẶC SẢN - TIỄN SÂN BAY (Ăn sáng)";
            html += `
                <li style="margin-bottom: 8px;"><b>07h00</b>: Dùng điểm tâm sáng buffet tại khách sạn. Quý khách có thể tự do tắm biển buổi sáng.</li>
                <li style="margin-bottom: 8px;"><b>Sáng</b>: Tự do tham quan và mua sắm đặc sản tại <b>Chợ Dương Đông</b> (Hải sản khô, ngọc trai...).</li>
                <li style="margin-bottom: 8px;"><b>11h30</b>: Làm thủ tục trả phòng khách sạn.</li>
                <li style="margin-bottom: 8px;"><b>Đến giờ hẹn</b>: Xe đưa đoàn ra sân bay / bến tàu, HDV hỗ trợ làm thủ tục check-in. Tạm biệt và hẹn gặp lại Đảo Ngọc!</li>
            `;
        } else {
            title = "HÀNH TRÌNH NAM ĐẢO - LÊN CÁP TREO HÒN THƠM (Ăn sáng, trưa, tối)";
            html += `
                <li style="margin-bottom: 8px;"><b>Sáng</b>: Dùng điểm tâm sáng. Xe đưa đoàn tiến về Nam Đảo.</li>
                <li style="margin-bottom: 8px;">Tham quan <b>Cơ sở cấy ghép ngọc trai</b> cao cấp, Viếng thăm <b>Di tích lịch sử Nhà tù Phú Quốc</b>.</li>
                <li style="margin-bottom: 8px;">Trải nghiệm đi tàu câu cá, lặn ngắm san hô tại <b>Quần đảo An Thới</b> hoặc trải nghiệm tuyến <b>cáp treo Hòn Thơm</b> vượt biển dài nhất thế giới.</li>
                <li style="margin-bottom: 8px;"><b>Trưa</b>: Dùng bữa trưa trên tàu hoặc trên đảo. Tự do tắm biển tại <b>Bãi Sao</b> - một trong những bãi biển đẹp nhất Phú Quốc.</li>
                <li style="margin-bottom: 8px;"><b>Tối</b>: Ăn tối tại nhà hàng bãi biển, tham gia câu mực đêm (chi phí tự túc).</li>
            `;
        }
    }
    // MẶC ĐỊNH CHUNG
    else {
        if (dayIndex === 1) {
            title = "ĐÓN KHÁCH - KHỞI HÀNH THAM QUAN ĐIỂM ĐẾN (Ăn trưa, tối)";
            html += `
                <li style="margin-bottom: 8px;"><b>Sáng</b>: Xe và HDV đón đoàn tại điểm hẹn, khởi hành chương trình tham quan khám phá vùng đất mới.</li>
                <li style="margin-bottom: 8px;">Trên đường đi, HDV sẽ thuyết minh về các danh lam thắng cảnh và tổ chức các trò chơi hoạt náo vui nhộn trên xe.</li>
                <li style="margin-bottom: 8px;"><b>Trưa</b>: Đến nơi, đoàn dùng bữa trưa tại nhà hàng địa phương, thưởng thức các món ăn đặc sản vùng miền.</li>
                <li style="margin-bottom: 8px;"><b>Chiều</b>: Đoàn thăm quan các danh thắng tiêu biểu nổi bật nhất tại địa điểm. Chụp hình check-in tạo dáng sống ảo.</li>
                <li style="margin-bottom: 8px;">Sau đó di chuyển về khách sạn nhận phòng, nghỉ ngơi.</li>
                <li style="margin-bottom: 8px;"><b>18h30</b>: Xe đưa đoàn đi dùng bữa tối. Quý khách tự do ngắm nhìn khung cảnh thành phố về đêm long lanh, dạo phố bộ.</li>
            `;
        } else if (dayIndex === totalDays) {
            title = "MUA SẮM QUÀ LƯU NIỆM - KHỞI HÀNH VỀ (Ăn sáng, trưa)";
            html += `
                <li style="margin-bottom: 8px;"><b>Sáng</b>: Dùng điểm tâm sáng tại nhà hàng. Tự do tham quan và tản bộ hưởng không khí trong lành buổi sáng.</li>
                <li style="margin-bottom: 8px;">Đoàn di chuyển đến khu vực chợ hoặc các trung tâm mua sắm để tự do tham quan và mua quà tặng đặc sản lưu niệm cho người thân.</li>
                <li style="margin-bottom: 8px;"><b>11h00</b>: Quay lại khách sạn làm thủ tục trả phòng. Tiến đến dùng bữa trưa.</li>
                <li style="margin-bottom: 8px;"><b>Chiều</b>: Lên xe cao tốc khởi hành về lại điểm xuất phát ban đầu.</li>
                <li style="margin-bottom: 8px;"><b>Dự kiến chiều tối</b>: Về đến điểm hẹn, HDV chia tay đoàn và chúc quý khách nhiều sức khỏe.</li>
            `;
        } else {
            title = "TRẢI NGHIỆM VĂN HÓA - KHÁM PHÁ THIÊN NHIÊN (Ăn sáng, trưa, tối)";
            html += `
                <li style="margin-bottom: 8px;"><b>Sáng</b>: Dùng buffet sáng tại khách sạn. Khởi hành đi tham quan chuỗi các di tích lịch sử và văn hóa địa phương.</li>
                <li style="margin-bottom: 8px;">Trải nghiệm nét sinh hoạt thường ngày của người dân bản xứ. Khám phá các khu du lịch sinh thái nổi tiếng.</li>
                <li style="margin-bottom: 8px;"><b>Trưa</b>: Dùng bữa trưa tại chuỗi nhà hàng nổi hoặc KDL sinh thái.</li>
                <li style="margin-bottom: 8px;"><b>Chiều</b>: Hòa mình vào các hoạt động đội nhóm, đi thuyền, leo núi hoặc tắm biển (tùy vào tính chất địa hình).</li>
                <li style="margin-bottom: 8px;"><b>Tối</b>: Dùng bữa tối thân mật. Tự do trải nghiệm thưởng thức ẩm thực đường phố, ngồi cafe.</li>
            `;
        }
    }

    html += `</ul>`;
    return { title, content: html };
}

async function updateAllItineraries() {
    let pool;
    try {
        pool = await connectDB();
        const request = pool.request();
        // Lấy tất cả tour
        const result = await request.query(`SELECT MaTour, TenTour, ThoiGian FROM Tour`);
        const tours = result.recordset;

        console.log(`✅ Đang tiến hành tạo lịch trình chi tiết bám sát chuẩn HTML cho ${tours.length} tours...`);

        for (const tour of tours) {
            // Xóa lịch cũ
            await pool.request()
                .input('MaTour', sql.Int, tour.MaTour)
                .query(`DELETE FROM LichTrinhTour WHERE MaTour = @MaTour`);

            // Lấy số ngày
            let days = 1;
            if (tour.ThoiGian && typeof tour.ThoiGian === 'string') {
                const dayMatch = tour.ThoiGian.match(/(\d+)\s*ngày/i);
                if (dayMatch) {
                    days = parseInt(dayMatch[1]);
                } else if (tour.ThoiGian.includes('1/2')) {
                    days = 1;
                }
            }
            if (days < 1) days = 1;

            for (let i = 1; i <= days; i++) {
                const { title, content } = getRichItinerary(tour.TenTour, i, days);

                await pool.request()
                    .input('MaTour', sql.Int, tour.MaTour)
                    .input('NgayThu', sql.Int, i)
                    .input('TieuDe', sql.NVarChar, title)
                    .input('ThoiGian', sql.NVarChar, i === 1 ? 'Sáng - Chiều - Tối' : 'Cả ngày')
                    .input('NoiDung', sql.NVarChar, content)
                    .query(`
                        INSERT INTO LichTrinhTour (MaTour, NgayThu, TieuDe, ThoiGian, NoiDung)
                        VALUES (@MaTour, @NgayThu, @TieuDe, @ThoiGian, @NoiDung)
                    `);
            }
        }
        console.log("🎉 XONG! Toàn bộ lịch trình đã được cập nhật thành cấu trúc List <ul><li> siêu đẹp với in đậm <b>.");
    } catch (err) {
        console.error("Lỗi:", err);
    } finally {
        if (pool) pool.close();
    }
}

updateAllItineraries();
