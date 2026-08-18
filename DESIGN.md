# NEXUS — Master Design System Specification (`DESIGN.md`)

Dokumen ini merupakan panduan patokan (*single source of truth*) untuk perombakan antarmuka, tata letak, palet warna, tipografi, dan komponen interaktif pada aplikasi **Nexus Task Management PWA**.

---

## 1. Filosofi & Arah Desain (*Design Vision*)

- **Arketipe Visual**: *Outcrowd-style Bento Widget Dashboard* — kombinasi tata letak bento grid asimetris, kartu taktil dengan sudut membulat lebar (*chunky rounded cards*), kontras kartu tinggi (putih bersih, obsidian gelap, dan *sunshine yellow*), serta visualisasi data yang hidup.
- **Kesan Pengguna**: Bersih, modern, menenangkan (*low cognitive load*), taktil (*delightful micro-interactions*), dan sangat terstruktur.
- **Prinsip Utama**:
  1. **Anti-AI Slop**: Menghindari tampilan datar abu-abu monoton atau kartu seragam tanpa variasi ritme.
  2. **High-Contrast Focal Points**: Memadukan kartu putih minimalis dengan kartu aksen berdaya tarik tinggi (kartu hitam obsidian dengan neon equalizer, dan kartu kuning cerah untuk catatan cepat).
  3. **Data Visualization as Art**: Menggunakan progress bar bermotif garis diagonal (*candy-stripe*), grafik gelombang ganda (*dual-wave chart*), dan bar equalizer bertingkat.

---

## 2. Palet Warna & Semantic Tokens

### 2.1 Kanvas & Background
| Token | Nilai Hex / CSS | Penggunaan |
| :--- | :--- | :--- |
| `canvas-bg` | `#f4f5f8` / `#eceff3` | Warna dasar kanvas dashboard |
| `canvas-pattern` | `radial-gradient(#d1d5db 1px, transparent 1px)` | Pola micro-dot grid (ukuran 16px × 16px) |
| `canvas-bg-dark` | `#0b0f19` | Kanvas saat dark mode diaktifkan |

### 2.2 Tema Kartu (*Card Archetypes*)
| Tipe Kartu | Background | Border / Shadow | Elemen Khas |
| :--- | :--- | :--- | :--- |
| **White Card (Standard)** | `#ffffff` | Shadow `0 8px 30px rgba(0,0,0,0.04)`, border transparan tipis | Digunakan untuk jadwal, analisis waktu, dan daftar tugas |
| **Obsidian Dark Card** | `#090a0f` / `#12141a` | Shadow `0 12px 36px rgba(0,0,0,0.18)` | Metrik tugas harian + neon cyan equalizer chart + avatar stack |
| **Sunshine Yellow Card** | `#fde047` / `#fef08a` | Shadow `0 8px 28px rgba(234,179,8,0.15)` | Catatan taktil (Brandbook/Notes) + Audio waveform player + checklist |

### 2.3 Visualisasi & Aksen Data
| Aksen / Indikator | Nilai Warna | Pola Tampilan |
| :--- | :--- | :--- |
| **Active Time (Work)** | `#10b981` (Emerald) | *Striped diagonal hatching* (garis miring berulang) |
| **Pause Time (Break)** | `#f97316` (Vibrant Orange) | Solid block bar dengan sudut halus |
| **Equalizer Neon Cyan** | `#00f2fe` / `#06b6d4` | Bar horizontal/vertikal bertumpuk (*segmented blocks*) |
| **Active Wave Line** | `#8b5cf6` (Purple/Indigo) | Garis kurva kurva Bezier halus dengan titik node interaktif |
| **Pause Wave Line** | `#f59e0b` (Amber Orange) | Garis kurva sekunder sejajar di grafik mingguan |
| **Goal Progress** | `#00d4ff` (Neon Sky Blue) | Bar lebar horizontal dengan pola garis diagonal (*candy-stripe*) |

---

## 3. Tipografi & Skala Teks

- **Primary Font Family**: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif`
- **Monospace / Numeric Font**: `'Space Mono', 'JetBrains Mono', monospace` (untuk timer, durasi waktu, jam digital, dan angka statistik)

### Skala Tipografi:
1. **Big Stats (Hero Numbers)**: `text-3xl` s.d. `text-4xl` (32px - 40px), `font-bold tracking-tight`.
2. **Card Headings**: `text-base` s.d. `text-lg` (16px - 18px), `font-bold text-slate-900 dark:text-white`.
3. **Sub-labels & Meta Text**: `text-xs` s.d. `text-sm` (12px - 14px), `font-medium text-slate-500`.
4. **Micro Tags & Platform Badges**: `text-[10px]` s.d. `text-xs` (10px - 11px), `font-semibold tracking-wide uppercase`.

---

## 4. Sistem Layout & Arsitektur Bento Grid

Layout menggunakan **12-Column Responsive Bento Grid**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TOP BAR / NAVBAR                               │
├───────────────────────────────┬───────────────────────────────┬─────────────┤
│ 1. WEEKLY SCHEDULE            │ 2. DAILY WORKING HOURS        │ 3. TASK     │
│    - Meeting with team        │    - 8h 27m                   │    VELOCITY │
│    - Platform icons (Meet/Zoom│    - Striped Active / Pause   │    - 146 +14│
│      /Teams)                  │    - Nav buttons (< >)        │    - Equaliz│
│    - Date chips (Sep 15)      │                               │      er Cyan│
│    (Col Span: 4)              │ (Col Span: 4)                 │    (Col: 4) │
├───────────────────────────────┼───────────────────────────────┼─────────────┤
│ 5. WORKING TIME ANALYSIS      │ 4. BRANDBOOK / STICKY NOTE    │ 6. TASKS &  │
│    - 36h 15m                  │    - Audio Waveform (6:12)    │    SUBTASKS │
│    - Dual Smooth Wave Curves  │    - Interactive Checklist    │    - Prog   │
│    - Interactive Day Tooltip  │    - Sunshine Yellow Card     │    - Nested │
│    (Col Span: 4)              │    (Col Span: 4)              │    (Col: 4) │
├───────────────────────────────┴───────────────────────────────┴─────────────┤
│ 7. MONTHLY PROGRESS TOWARDS GOALS (Col Span: 12)                            │
│    - Animated Candy-Stripe Cyan Bar (82%) | Carousel Nav (< >)              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Aturan Geometri & Spacing:
- **Card Border Radius**: `rounded-3xl` (`24px` - `28px`).
- **Inner Element Radius**: `rounded-xl` (`12px`) untuk badge/tombol, `rounded-full` untuk avatar dan kontrol sirkular.
- **Grid Gap**: `gap-5` (20px) pada desktop, `gap-4` (16px) pada mobile/tablet.
- **Card Padding**: `p-6` (24px) untuk kartu utama.

---

## 5. Spesifikasi Detail 7 Widget Utama

### 1. Weekly Schedule (Your Meetings)
- **Komponen**: `src/components/widgets/WeeklyScheduleWidget.jsx`
- **Fitur**:
  - Header: Judul "Your meetings" dengan sub-judul "Weekly schedule" dan menu 3-titik.
  - List item rapat dengan **Date Chip** kotak (`Sep 15`, `Sep 16`), judul rapat, pill rentang waktu (`13:00 - 13:45`), dan ikon platform otomatis (Google Meet, Zoom, Microsoft Teams).
  - Terhubung langsung dengan agenda Calendar Nexus.

### 2. Daily Working Hours
- **Komponen**: `src/components/widgets/DailyWorkingHoursWidget.jsx`
- **Fitur**:
  - Header: Judul dengan pagination hari (`<` `>`).
  - Hero Stat: Ikon Jam Pasir ⏳ + angka besar durasi (`8 h 27m`).
  - Bar Waktu Terbagi (*Split Meter*):
    - **Active time**: Bar hijau emerald dengan pola garis miring (*striped diagonal*).
    - **Pause time**: Bar oranye cerah solid.
  - Terhubung dengan `useTimer` (Pomodoro / Focus Tracker).

### 3. Number of Tasks & Equalizer Velocity (Obsidian Card)
- **Komponen**: `src/components/widgets/TaskVelocityWidget.jsx`
- **Fitur**:
  - Tampilan kartu hitam pekat bernuansa futuristik dengan dropdown selector (*Weekly* ▾).
  - Statistik besar: `146` dengan badge tren hijau `+14`.
  - **Segmented Equalizer Bar Chart**: Bar cyan neon dengan segmen-segmen persegi panjang yang merepresentasikan intensitas tugas harian.
  - Tumpukan avatar kontributor/tim di bagian bawah dengan indikator carousel dots.

### 4. Brandbook Note & Voice Note (Sunshine Yellow Card)
- **Komponen**: `src/components/widgets/StickyNoteWidget.jsx`
- **Fitur**:
  - Kartu kuning pastel cerah dengan judul uppercase "BRANDBOOK NOTE", tombol edit pensil dan menu.
  - Paragraf isi catatan ringkas.
  - **Audio Waveform Player**: Tombol play/pause hitam bulat, visualizer gelombang suara, durasi `6:12`, dan selector kecepatan `1x` / `1.5x`.
  - **Interactive Checklist**: Item tugas cepat dengan icon centang / radio bulat.
  - Timestamp footer (contoh: `Today, 2:35 PM`).

### 5. Working Time Analysis (Wave Chart)
- **Komponen**: `src/components/widgets/TimeAnalysisWidget.jsx`
- **Fitur**:
  - Stat total mingguan (`36h 15m`) + filter dropdown (*Weekly* ▾).
  - **Interactive Dual Wave Chart (SVG)**:
    - Kurva ungu untuk *Active Time*.
    - Kurva oranye untuk *Pause Time*.
    - Node interaktif pada hari Rabu (atau hari yang dipilih) yang memunculkan floating tooltip (`26h active time`, `10h 15m pause time`).
  - Label hari (*Mon, Tue, Wed, Thu, Fri*) dan pagination dots.

### 6. Tasks & Subtasks Breakdown
- **Komponen**: `src/components/widgets/TaskBreakdownWidget.jsx`
- **Fitur**:
  - Header dengan pagination (`<` `>`).
  - Item proyek utama dengan ikon dokumen oranye (`New BrandBook`) + progress bar mini + total waktu `9h 40m`.
  - **Nested Subtasks List**: Checklist bertingkat dengan alokasi waktu per subtask (misal: `Research & Preparation - 2h 15m`, `Logo Guidelines - 6h 45m`).
  - Footer metadata: Rentang tanggal, jumlah komentar, dan avatar penanggung jawab.

### 7. Monthly Progress Towards Goals
- **Komponen**: `src/components/widgets/MonthlyGoalProgressWidget.jsx`
- **Fitur**:
  - Kartu horizontal memanjang di bagian bawah grid.
  - Judul "Monthly progress towards your goals" + kontrol panah carousel (`<` `>`).
  - **Candy-Stripe Progress Bar**: Bar progres tebal dengan animasi garis miring cyan dan persentase di ujung kanan (`82%`).

---

## 6. Micro-Interactions & Aturan Animasi

1. **Candy-Stripe Animation**:
   ```css
   @keyframes move-stripes {
     0% { background-position: 0 0; }
     100% { background-position: 30px 0; }
   }
   .striped-bar-emerald {
     background-image: repeating-linear-gradient(
       -45deg,
       #10b981,
       #10b981 8px,
       #059669 8px,
       #059669 16px
     );
   }
   .striped-bar-cyan {
     background-image: repeating-linear-gradient(
       -45deg,
       #00d4ff,
       #00d4ff 10px,
       #0284c7 10px,
       #0284c7 20px
     );
     background-size: 30px 30px;
     animation: move-stripes 2s linear infinite;
   }
   ```
2. **Card Hover Effects**:
   - `transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease`
   - `hover:-translate-y-1 hover:shadow-xl`
3. **Button Press Dynamics**:
   - `active:scale-[0.97]` memberikan efek klik fisik yang memuaskan (*tactile feedback*).

---

## 7. Responsivitas & Standar Mobile

- **Desktop (`>= 1024px`)**: Full 12-column Bento Grid (3 kolom kartu utama + 1 baris lebar di bawah).
- **Tablet (`768px - 1023px`)**: 2 Kolom adaptif.
- **Mobile (`< 768px`)**: Single column stream dengan urutan prioritas:
  1. Daily Working Hours & Focus Widget
  2. Weekly Schedule / Next Meetings
  3. Brandbook / Sticky Note & Voice Memo
  4. Task Velocity Equalizer
  5. Tasks & Subtasks Breakdown
  6. Working Time Analysis Wave Chart
  7. Monthly Goals Progress Bar
- **Touch Target**: Semua tombol aksi memiliki ukuran sentuh minimal `44px × 44px`.

---

## 8. Status Verifikasi & Kompatibilitas

- Kompatibel penuh dengan **Tailwind CSS**, **Framer Motion**, dan **Shadcn UI**.
- Mendukung mode **PWA offline-first** dengan penyimpanan otomatis di LocalStorage dan sinkronisasi cloud Firebase.
