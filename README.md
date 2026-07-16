# Orvix

"Zanjir" tamoyili asosidagi ijtimoiy tarmoq — feed emas, qo'ldan-qo'lga o'tadigan, energiyasi so'nib turadigan postlar.

## Ishga tushirish

```bash
npm install
npm run dev
```

Brauzerda `http://localhost:5173` ochiladi.

## Qanday ishlaydi

- **Ro'yxatdan o'tish/Kirish** — demo uchun localStorage'da saqlanadi (real backend emas, parollar oddiy matn holida — productionga chiqarishdan oldin haqiqiy backend + hash kerak).
- **Post yaratish** — 100% energiya bilan boshlanadi.
- **Uzatish (Pass)** — post energiyasini +22% oshiradi va zanjirga sening ismingni qo'shadi.
- **So'nish** — hech kim uzatmasa, 48 soat ichida energiya 0% ga tushib, post butunlay o'chib ketadi (localStorage'dan ham).
- **Aura** — profilingdagi rang so'nggi 24 soatdagi faolligingga qarab (kul rangdan olovga) o'zgarib turadi.
- **Rasm/video** — post yozishda oddiy matndan tashqari rasm yoki video ham biriktirish mumkin (fayl hajmi 5MB dan oshmasligi kerak — localStorage joyi cheklangan).
- **Profil rasmi** — o'z profilingda kamera belgisi orqali o'zingga tegishli rasmni yuklab, standart harf-avatar o'rniga qo'yish mumkin.
- **Profil foni** — profil yuqorisidagi rangli fonni bir nechta tayyor gradientlar orasidan tanlab o'zgartirish mumkin ("Fonni o'zgartirish" tugmasi).

## Keyingi qadamlar (agar davom ettirmoqchi bo'lsang)

- Haqiqiy backend (masalan Supabase/Firebase yoki Node+Express+Postgres) — hozir hammasi brauzer localStorage'da, faqat shu qurilmada ishlaydi. Rasm/video ham data-URL sifatida shu yerda saqlanadi, shuning uchun umumiy hajm brauzer limitiga (odatda ~5-10MB) tegishi mumkin.
- Push-bildirishnomalar ("postingni birov uzatdi").
- Play Market/App Store'ga chiqarish uchun buni Capacitor yoki React Native bilan mobil ilovaga o'rash kerak bo'ladi — veb-sayt SEO uchun alohida, ilova alohida masala.
