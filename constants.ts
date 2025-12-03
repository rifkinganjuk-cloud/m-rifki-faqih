export const RATIO_OPTIONS = ["9:16", "16:9", "1:1"];

export const VISUAL_STYLE_OPTIONS = [
  "Realistic",
  "Hyper-Realistic",
  "Cinematic",
  "Aesthetic",
  "Warm Indonesia Rural",
  "Urban Clean"
];

export const TONE_OPTIONS = [
  "Soft Sell",
  "Hard Sell",
  "Storytelling",
  "Edukasi",
  "Luxury",
  "Friendly"
];

export const GENERATOR_SYSTEM_PROMPT = 
  "Kamu adalah AI profesional untuk TikTok Affiliate. Tugasmu: menganalisis produk dari link, membuat 10 konsep video (angle), membuat prompt Veo 3, hook, script, caption, dan hashtag. Gunakan bahasa yang natural, menarik, dan cocok untuk FYP.";

export const USER_PROMPT_TEMPLATE = `
Analisa link produk ini: {{product_link}}.

📌 Langkah kerja AI:
1. Deteksi nama produk
2. Deteksi kategori
3. Deteksi fitur utama
4. Deteksi masalah yang bisa diselesaikan
5. Tentukan target buyer
6. Deteksi selling point paling kuat

Setelah analisa → Buat **10 angle video** berikut:
1. Shock Value
2. Masalah – Solusi
3. Storytelling
4. Review Jujur
5. Before – After
6. POV
7. Lifestyle Aesthetic
8. Edukasi
9. Testimoni
10. Hard Sell Promo

Setiap angle WAJIB menghasilkan:
- Prompt Veo 3 lengkap, detail, dan sesuai gaya {{visual_style}}, rasio {{ratio}}.
- Hook 3–5 detik sangat menarik.
- Script video 6–12 detik.
- Caption jualan sesuai tone {{tone}}.
- Hashtag relevan + hashtag kategori.

===============================
FORMAT OUTPUT (WAJIB IKUTI)
===============================

NAMA PRODUK:
[hasil analisa nama produk]

KATEGORI:
[hasil analisa kategori]

FITUR UTAMA:
[list fitur]

MASALAH YANG DISELESAIKAN:
[list problem buyer]

TARGET BUYER:
[analisa target buyer]

SELLING POINT PALING KUAT:
[hasil analisa]

===============================
=== 10 ANGLE OUTPUT ===
===============================

Untuk setiap ANGLE 1-10 gunakan format ini:

--- ANGLE {{index}} ---
🎭 Tipe Angle: [Shock Value / Problem–Solusi / dll]

🎥 Prompt Veo 3:
[prompt sangat detail, sesuai gaya dan rasio]

⚡ Hook 3–5 detik:
[hook kuat, memancing penasaran]

🎬 Script Video 6–12 detik:
[alur video yang natural dan kuat]

✏️ Caption:
[caption sesuai tone]

🏷️ Hashtag:
#affiliate #tiktokshop #[kategori] #fyp #viraltiktok
`;