/**
 * Compression Middleware
 * 
 * Mengompres response untuk mengurangi ukuran data yang dikirim
 */

import compression from 'compression';

/**
 * Compression middleware dengan konfigurasi optimal
 */
export const compressionMiddleware = compression({
    filter: (req, res) => {
        // Hanya compress jika client support
        if (req.headers['x-no-compression']) {
            return false;
        }
        // Gunakan compression untuk semua response
        return compression.filter(req, res);
    },
    level: 6, // Level compression (1-9, 6 adalah balance yang baik)
    threshold: 1024, // Hanya compress jika response > 1KB
});

