# DataMatrix Quality Scanner - ISO 15415 Compliance

## Project Overview
- **Name**: DataMatrix Quality Scanner
- **Type**: Industrial quality control system
- **Core Functionality**: Real-time DataMatrix code quality grading with ISO 15415 compliance
- **Target Users**: Manufacturing quality control operators, industrial automation engineers

## Core Features

### 1. Camera Interfaces
- **Industrial Camera**: High-speed USB3/GigE interface for conveyor systems
- **Webcam Mode**: Standard USB webcam fallback for manual inspection
- Auto-detection and hot-switching between camera modes

### 2. ISO 15415 Quality Grading
Grading parameters:
- **Symbol Contrast (SC)**: Overall contrast ratio
- **Cell Decode (C)**: Fundamental decodability
- **Modulation (M)**: Contrast uniformity
- **Reflectance Margin (MR)**: Edge contrast ratio
- **Finder Pattern Damage (FP)**: Corner finder integrity
- **Axial Non-Uniformity (AN)**: Grid distortion
- **Grid Non-Uniformity (GN)**: Module placement errors
- **Unused Error Correction (UEC)**: Remaining ECC capacity

Grades: A (≥3.5), B (≥2.5), C (≥1.5), D (≥0.5), F (<0.5)

### 3. Audio Notifications
- **Zone D**: Warning beep (moderate pitch)
- **Zone F**: Critical alarm (high-pitched alert)
- Configurable volume and enable/disable

### 4. Detection Modes
- Standard DataMatrix reading (ECC 200)
- Non-DataMatrix square detection → Auto-grade F
- Damaged/unreadable codes → Auto-grade F
- Unknown patterns → Auto-grade F

### 5. History & Database
- Local IndexedDB storage
- Timestamp, grade, all parameters, camera type
- Filterable by date range, grade, camera mode
- Export to CSV

### 6. Industrial Features
- Line-speed compensation
- Exposure/gain adjustment
- ROI (Region of Interest) selection
- Trigger input simulation

## UI/UX Design

### Color Palette
- **Background**: #0f1419 (industrial dark)
- **Surface**: #1a2332 (panels)
- **Primary**: #3b82f6 (industrial blue)
- **Success/A**: #22c55e (green)
- **Warning/C**: #f59e0b (amber)
- **Error/D**: #ef4444 (red)
- **Critical/F**: #dc2626 (dark red)
- **Text**: #e2e8f0

### Typography
- Font: JetBrains Mono (monospace for industrial data)
- Headings: Bold, uppercase for status
- Data: Monospace for measurements

### Layout
- Left: Live camera feed with overlay
- Right: Grade display and parameters
- Bottom: History table
- Top: Controls bar

## Acceptance Criteria
1. ✅ Real-time DataMatrix detection and decoding
2. ✅ ISO 15415 grade calculation
3. ✅ Non-DataMatrix squares detected as F
4. ✅ Audio alerts for D and F grades
5. ✅ Persistent history storage
6. ✅ Webcam mode functional
7. ✅ Camera switching without restart
