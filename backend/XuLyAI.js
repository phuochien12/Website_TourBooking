/**
 * FILE: d:\QL_DO_AN_CS2\Website_TourBooking\backend\XuLyAI.js
 * PHIÊN BẢN: Smart reasoning - Sử dụng Llama 3.3 Siêu thông minh
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
require('dotenv').config();

// Khởi tạo Gemini (Dự phòng cuối cùng)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function layCauTraLoiGroq(prompt) {
    // Model Llama 3.3 cực mạnh và thông minh
    const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
    
    for (const modelName of models) {
        try {
            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: modelName,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 800
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );
            return response.data.choices[0].message.content;
        } catch (error) {
            console.error(`⚠️ Lỗi model ${modelName}:`, error.response?.data?.error?.message || error.message);
            continue;
        }
    }
    return null;
}

async function layCauTraLoiAI(cauHoi, thongTinTour = []) {
    const cauHoiLow = cauHoi.toLowerCase().trim();

    // =========================================================
    // TẦNG 1: THÔNG TIN CỐ ĐỊNH (TRẢ LỜI NGAY LẬP TỨC)
    // =========================================================
    if (cauHoiLow === "hi" || cauHoiLow === "hello" || cauHoiLow === "chào" || cauHoiLow === "xin chào") {
        return "Chào bạn! Mình là S-Tourist, trợ lý du lịch của bạn. Bạn cần mình tư vấn tour nào hôm nay? 😊";
    }
    if (cauHoiLow.includes("địa chỉ") || cauHoiLow.includes("ở đâu")) {
        return "📍 Văn phòng chúng mình tại: 273 Nguyễn Văn Linh, Q. Ninh Kiều, TP. Cần Thơ. Luôn sẵn sàng đón tiếp bạn!";
    }
    if (cauHoiLow.includes("liên hệ") || cauHoiLow.includes("số điện thoại") || cauHoiLow.includes("hotline")) {
        return "📞 Hotline 24/7 của Du Lịch Việt: 0354 858 892. Gọi ngay để có giá tốt nhất nhé!";
    }

    // =========================================================
    // TẦNG 2: SUY LUẬN AI (DÙNG DỮ LIỆU TOUR THẬT TỪ DATABASE)
    // =========================================================
    
    // Chuẩn bị dữ liệu tour cho AI suy luận
    const dataVanBan = thongTinTour.length > 0 
        ? thongTinTour.map(t => `- Tour: ${t.TenTour}\n  Giá: ${t.GiaGoc.toLocaleString('vi-VN')} VNĐ\n  Thời gian: ${t.ThoiGian}`).join('\n\n')
        : "Hiện tại hệ thống tour đang cập nhật.";

    const prompt = `Bạn là S-Tourist, một chuyên gia tư vấn tour du lịch nhiệt tình và thông minh của công ty Du Lịch Việt.
    Dưới đây là danh sách các tour du lịch hiện có trong hệ thống của chúng tôi:
    
    ${dataVanBan}
    
    YÊU CẦU:
    - Trả lời khách hàng dựa trên dữ liệu tour ở trên một cách thông minh.
    - Nếu khách hỏi về tour cụ thể, hãy tư vấn và báo giá chuẩn từ dữ liệu.
    - Nếu khách hỏi chung chung (ví dụ: "đi đâu chơi vui"), hãy tự suy luận và gợi ý tour phù hợp nhất.
    - Luôn trả lời bằng TIẾNG VIỆT, tự nhiên, thân thiện và có sử dụng emoji.
    - Ngắn gọn nhưng đầy đủ thông tin (khoảng 3-4 câu).
    
    Câu hỏi của khách: "${cauHoi}"`;

    // 1. Thử Groq (Ưu tiên vì thông minh và nhanh)
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith("gsk_")) {
        const groqAnswer = await layCauTraLoiGroq(prompt);
        if (groqAnswer) return groqAnswer;
    }

    // 2. Dự phòng Gemini (Nếu Groq lỗi)
    try {
        const models = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-pro"];
        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent(prompt);
                return result.response.text();
            } catch (e) { continue; }
        }
    } catch (err) {}

    // 3. Fallback cuối cùng
    return "Dạ, mình rất muốn tư vấn cho bạn nhưng hiện tại dữ liệu tour đang được cập nhật thêm. Bạn vui lòng nhắn Zalo hoặc gọi Hotline 0354 858 892 để mình hỗ trợ siêu tốc nhé! ❤️";
}

module.exports = { layCauTraLoiAI };
