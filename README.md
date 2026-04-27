# 🤖 Automation Tool - Google Sheets

**Công cụ tự động hóa công việc với Google Sheets** - Giúp bạn tiết kiệm thời gian xử lý dữ liệu, kiểm tra chất lượng và quản lý tài nguyên một cách thông minh.

---

## 📋 Mục Lục
- [Tính Năng](#-tính-năng-chính)
- [Yêu Cầu](#-yêu-cầu)
- [Cài Đặt](#-cài-đặt)
- [Hướng Dẫn Sử Dụng](#-hướng-dẫn-sử-dụng)
- [Các Công Cụ](#-các-công-cụ)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Hỗ Trợ & Tương Tác](#-hỗ-trợ--tương-tác)

---

## ✨ Tính Năng Chính

### 🔍 **Kiểm Tra Trùng Lặp Theo Cột**
Phát hiện và quản lý các giá trị trùng lặp trong dữ liệu của bạn:
- ✅ Quét toàn bộ dữ liệu trong cột được chọn
- ✅ Hiển thị danh sách giá trị trùng + số lần xuất hiện
- ✅ **Click để lọc dữ liệu**: Nhấp vào giá trị trùng → tự động áp dụng filter
- ✅ Giao diện sidebar trực quan, dễ sử dụng

**Ứng dụng**: Kiểm tra trùng lặp Email, Mã sản phẩm, Số điện thoại, v.v.

---

### 📥 **Tải Catalog Thông Minh**
Tải hàng loạt file từ các đường link trong Google Sheets một cách tự động:
- ✅ **Hỗ trợ nhiều nguồn**: Dropbox, Google Drive, HTTP links
- ✅ **Xử lý thông minh**:
  - Tự động chuyển đổi link Dropbox (dl=0 → dl=1)
  - Nhận dạng file ID từ Google Drive
  - Lọc bỏ link HTML (file riêng tư/lỗi)
  - Xác định tự động định dạng file (.pdf, .jpg, .png, .gif)
- ✅ **Tải hàng loạt**: Xử lý 5 file đồng thời để tối ưu
- ✅ **Tracking tiến trình**: Thanh tiến trình + log chi tiết
- ✅ **Tạo folder tự động**: Lưu toàn bộ file vào folder Google Drive
- ✅ **Tùy chỉnh tên file**: Thêm Row index hoặc dùng SKU

**Ứng dụng**: Tải ảnh sản phẩm, tài liệu, hóa đơn, v.v.

---

## 📌 Yêu Cầu

- 📊 **Google Account** với quyền tạo Google Sheets
- 🔗 **Google Drive** để lưu file tải về
- 💾 **Dữ liệu trong Google Sheets** có format:
  - **Dòng 1**: Tiêu đề cột (Header)
  - **Dòng 2+**: Dữ liệu (Data)

---

## 🚀 Cài Đặt

### **Bước 1: Tạo Google Sheets mới**
1. Truy cập [Google Sheets](https://sheets.google.com)
2. Tạo spreadsheet mới hoặc mở spreadsheet hiện có

### **Bước 2: Mở Apps Script Editor**
1. Vào menu **Mở rộng** (Extensions) → **Apps Script**
2. Hoặc truy cập trực tiếp: [script.google.com](https://script.google.com)

### **Bước 3: Copy Code**
1. **Xóa** nội dung mặc định trong editor
2. **Copy toàn bộ code** từ file `Code.gs` trong repository này
3. **Paste** vào Apps Script Editor
4. **Lưu** (Ctrl+S hoặc Cmd+S)

### **Bước 4: Thêm HTML Files**
1. Click **+** (tạo file mới) → **HTML**
2. Tạo file `HtmlCheckDuplicateColumn.html`
   - Copy nội dung từ `HtmlCheckDuplicateColumn.html`
3. Tạo file `HtmlDownloadCatalog.html`
   - Copy nội dung từ `HtmlDownloadCatalog.html`
4. **Lưu** cả hai file

### **Bước 5: Cấp Quyền**
1. Chạy hàm `onOpen()` lần đầu (Click **Run** → chọn hàm `onOpen`)
2. Google sẽ yêu cầu cấp quyền → Nhấp **Cho phép**
3. **F5** để reload Google Sheets

### **Bước 6: Xác Nhận Menu**
Quay lại Google Sheets, bạn sẽ thấy menu mới **"Automation"** ✨

---

## 📖 Hướng Dẫn Sử Dụng

### **📋 Kiểm Tra Trùng Lặp Theo Cột**

#### **Cách sử dụng:**
1. Chuẩn bị dữ liệu trong Google Sheets (dòng 1 = header, dòng 2+ = data)
2. Vào menu **Automation** → **Kiểm tra trùng lặp theo cột**
3. Chọn cột cần quét từ dropdown
4. Nhấp **TÌM TRÙNG LẶP**
5. Kết quả hiển thị dưới dạng danh sách:
   - Giá trị trùng
   - Số lần xuất hiện
6. **Nhấp vào một giá trị** → Tự động lọc dữ liệu

#### **Ví dụ:**
| Email | Tên | Status |
|-------|-----|--------|
| user@gmail.com | An | Active |
| user@gmail.com | Bình | Active |
| test@gmail.com | Cường | Active |

**Kết quả**: `user@gmail.com (Xuất hiện 2 lần)` ← Click để lọc

---

### **📥 Tải Catalog Thông Minh**

#### **Chuẩn bị dữ liệu:**
Google Sheets của bạn cần có cấu trúc tương tự:

| SKU | Tên Sản Phẩm | Link Ảnh | Mô Tả |
|-----|--------------|----------|-------|
| SP001 | Áo thun | https://dropbox.com/s/xxx/aothun.jpg?dl=0 | Áo thun nam |
| SP002 | Quần jean | https://drive.google.com/file/d/xxx/view | Quần jean |
| SP003 | Mũ | https://example.com/mu.png | Mũ lưỡi trai |

#### **Cách sử dụng:**
1. Vào menu **Automation** → **Tải Catalog thông minh**
2. Chọn các cấu hình:
   - **Sheet**: Chọn trang tính (nếu có nhiều sheet)
   - **Cột SKU**: Chọn cột chứa mã sản phẩm
   - **Cột Link**: Chọn cột chứa đường link
   - ☑️ **Thêm Row index**: Bật nếu muốn tên file có số thứ tự hàng
3. Nhấp **BẮT ĐẦU TẢI**
4. Theo dõi tiến trình:
   - Thanh tiến trình
   - Log chi tiết từng file
5. Sau khi hoàn tất:
   - Nhấp **📂 MỞ THƯ MỤC DRIVE** để xem file đã tải

#### **Hỗ trợ các nguồn:**
- 📦 **Dropbox**: `https://dropbox.com/s/xxx?dl=0` → Tự động chuyển `dl=1`
- 📊 **Google Drive**: `https://drive.google.com/file/d/FILE_ID/view` → Tự động nhận dạng
- 🌐 **HTTP/HTTPS**: Hỗ trợ đầy đủ

#### **Ví dụ kết quả:**
```
Dòng 2: Thành công (tải được SP001.jpg)
Dòng 3: Thành công (tải được SP002.jpg)
Dòng 4: Lỗi: File riêng tư/HTML
```

---

## 🛠️ Các Công Cụ

### **Backend - Google Apps Script (Code.gs)**
```javascript
// Menu System
onOpen()                        // Tạo menu Automation

// Duplicate Checker
getColumnHeaders()              // Lấy danh sách cột
getActiveSheetName()            // Lấy tên sheet hiện tại
findDuplicateValues(columnName) // Tìm giá trị trùng
applyFilter(columnName, value)  // Áp dụng filter

// Smart Catalog Downloader
getSheetAndColumns()            // Lấy sheets và columns
prepareDownload(config)         // Chuẩn bị task tải
downloadSingleFile(task, folderId) // Tải 1 file
downloadBatch(tasks, folderId)  // Tải batch 5 file
```

### **Frontend - HTML + JavaScript**

#### `HtmlCheckDuplicateColumn.html`
- Giao diện sidebar kiểm tra trùng lặp
- Dropdown chọn cột
- Danh sách kết quả có tính tương tác
- Link hướng dẫn sử dụng

#### `HtmlDownloadCatalog.html`
- Giao diện sidebar tải catalog
- Dropdown chọn sheet, SKU column, Link column
- Checkbox tùy chỉnh
- Thanh tiến trình & log chi tiết
- Button mở folder Google Drive

---

## 📁 Cấu Trúc Dự Án

```
Automation-Tool---Google-Sheets/
├── README.md                          # Tài liệu này
├── Code.gs                            # Backend - Google Apps Script
├── HtmlCheckDuplicateColumn.html       # Frontend - Duplicate Checker
└── HtmlDownloadCatalog.html            # Frontend - Catalog Downloader
```

---

## ⚙️ Cấu Hình & Tùy Chỉnh

### **Thay đổi batch size (số file tải cùng lúc)**
Mở `HtmlDownloadCatalog.html`, tìm:
```javascript
const BATCH_SIZE = 5;  // Thay số 5 thành giá trị khác
```

### **Thêm định dạng file mới**
Mở `Code.gs`, tìm hàm `downloadSingleFile()`, thêm:
```javascript
else if (contentType.includes("webp")) ext = ".webp";
```

### **Thay đổi màu sắc UI**
Mở file HTML, tìm section `<style>`, sửa màu CSS.

---

## 🐛 Khắc Phục Sự Cố

### **❌ Menu "Automation" không hiển thị**
- ✅ Quay lại Apps Script Editor
- ✅ Chạy hàm `onOpen()` một lần
- ✅ Cấp quyền cho Google Apps Script
- ✅ F5 để reload Google Sheets

### **❌ Lỗi "Cột không tồn tại"**
- ✅ Kiểm tra tên cột (phải khớp 100% với header)
- ✅ Kiểm tra header ở dòng 1
- ✅ Không được để header trống

### **❌ Tải file thất bại**
- ✅ Kiểm tra đường link có hợp lệ không
- ✅ Dropbox: Thêm `?dl=1` vào cuối URL
- ✅ Google Drive: Dùng link `drive.google.com` không phải `docs.google.com`
- ✅ Kiểm tra quyền truy cập (file có private không)

### **❌ Lỗi quyền "Access Denied"**
- ✅ Kiểm tra tài khoản Google của bạn có quyền Edit Google Sheets không
- ✅ Kiểm tra có quyền tạo folder trong Google Drive không
- ✅ Thử logout → login lại

---

## 📚 Tài Liệu Tham Khảo

- 📖 [Hướng dẫn chi tiết - Kiểm Tra Trùng Lặp](https://endurable-apricot-881-tnn.notion.site/T-nh-n-ng-Ki-m-tra-tr-ng-l-p-_Duplicate-checker-3436e569d7d180ac871bc527cbadc394?source=copy_link)
- 📖 [Hướng dẫn chi tiết - Tải Catalog Thông Minh](https://endurable-apricot-881-tnn.notion.site/C-ng-c-t-i-Catalog-th-ng-minh-3436e569d7d1800993c9f3debc7de684?source=copy_link)
- 🔗 [Google Apps Script Documentation](https://developers.google.com/apps-script)
- 🔗 [Google Sheets API](https://developers.google.com/sheets/api)

---

## 🎯 Trường Hợp Sử Dụng

| Ngành | Ứng Dụng |
|------|---------|
| 📦 **E-commerce** | Tải ảnh sản phẩm, kiểm tra trùng SKU |
| 📋 **Quản lý hóa đơn** | Tải tài liệu, kiểm tra trùng mã hóa đơn |
| 👥 **Quản lý nhân sự** | Kiểm tra trùng email/phone, tải tài liệu |
| 📸 **Quản lý media** | Tải hàng loạt ảnh, video từ link |
| 📊 **Data entry** | Kiểm tra chất lượng dữ liệu, phát hiện lỗi |

---

## 💡 Gợi Ý & Đóng Góp

Bạn có ý tưởng cải thiện? Hãy:
1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/your-feature`)
3. Commit thay đổi (`git commit -m 'Add new feature'`)
4. Push lên GitHub (`git push origin feature/your-feature`)
5. Mở Pull Request

---

## 📄 Giấy Phép

Dự án này được phát hành dưới giấy phép **MIT**.

---

## 📞 Hỗ Trợ & Tương Tác

- 💬 Có câu hỏi? Mở [GitHub Issues](https://github.com/anhtn1980/Automation-Tool---Google-Sheets/issues)
- ⭐ Thích dự án? Hãy star ⭐ repository này
- 🐦 Chia sẻ trên mạng xã hội

---

**Tạo bởi**: [anhtn1980](https://github.com/anhtn1980)  
**Cập nhật lần cuối**: 2026-04-27  
**Phiên bản**: 1.0.0

---

## 🚀 Bắt Đầu Ngay

```
1. ✅ Copy Code.gs + 2 file HTML
2. ✅ Paste vào Google Apps Script
3. ✅ Cấp quyền & reload
4. ✅ Sử dụng menu "Automation"
5. ✅ Tiết kiệm thời gian! 🎉
```

**Happy Automation!** 🤖✨
