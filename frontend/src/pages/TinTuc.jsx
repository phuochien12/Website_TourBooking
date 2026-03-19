import { useState, useEffect } from 'react';
import axios from 'axios';

function TinTuc() {
    const [tinTuc, setTinTuc] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/tin-tuc')
            .then(res => {
                setTinTuc(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">Tin Tức Du Lịch</h1>

                {loading ? <p className="text-center">Đang tải...</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {tinTuc.map(tin => (
                            <div key={tin.MaTin} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                                <img src={tin.AnhDaiDien} alt={tin.TieuDe} className="w-full h-48 object-cover" />
                                <div className="p-4">
                                    <p className="text-gray-500 text-sm mb-2">{new Date(tin.NgayDang).toLocaleDateString('vi-VN')}</p>
                                    <h3 className="text-xl font-bold mb-2 line-clamp-2">{tin.TieuDe}</h3>
                                    <p className="text-gray-600 line-clamp-3 mb-4">{tin.TomTat}</p>
                                    <button className="text-blue-600 font-bold hover:underline">Đọc tiếp →</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TinTuc;
