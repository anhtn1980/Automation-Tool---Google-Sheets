// --- MENU HỆ THỐNG ---
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Automation')
    .addItem('Tải Catalog thông minh', 'openDownloadCatalogSidebar')
    .addItem('Kiểm tra trùng lặp theo cột', 'openCheckDuplicateColumn')
    .addToUi();
}

// --- HÀM MỞ SIDEBAR ---
function openDownloadCatalogSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('HtmlDownloadCatalog')
    .setTitle('Cấu hình tải Catalog')
    .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}

function openCheckDuplicateColumn() {
  const html = HtmlService.createHtmlOutputFromFile('HtmlCheckDuplicateColumn')
    .setTitle('Kiểm tra trùng lặp')
    .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}

// --- CHỨC NĂNG 1: KIỂM TRA TRÙNG LẶP (Dựa trên code cũ của bạn) ---
function getColumnHeaders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

function getActiveSheetName() {
  return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
}

function findDuplicateValues(columnName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const headerRow = getColumnHeaders();
  const columnIndex = headerRow.indexOf(columnName) + 1;
  if (columnIndex === 0) throw new Error('Cột không tồn tại.');

  const values = sheet.getRange(2, columnIndex, sheet.getLastRow() - 1).getValues();
  const countMap = {};
  values.forEach(row => {
    const val = row[0];
    if (val) countMap[val] = (countMap[val] || 0) + 1;
  });

  const duplicates = [];
  for (const val in countMap) {
    if (countMap[val] > 1) {
      duplicates.push({ value: val, count: countMap[val] });
    }
  }
  return duplicates;
}

function applyFilter(columnName, value) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const headerRow = getColumnHeaders();
  const columnIndex = headerRow.indexOf(columnName) + 1;
  const range = sheet.getDataRange();
  if (sheet.getFilter()) sheet.getFilter().remove();
  range.createFilter().setColumnFilterCriteria(columnIndex, SpreadsheetApp.newFilterCriteria().whenTextEqualTo(value).build());
}

// --- CHỨC NĂNG 2: TẢI CATALOG THÔNG MINH ---
function getSheetAndColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return { 
    sheets: ss.getSheets().map(s => s.getName()), 
    headers: getColumnHeaders(), 
    activeSheetName: getActiveSheetName() 
  };
}

// Hàm mới: Lấy headers của một sheet cụ thể
function getHeadersBySheetName(sheetName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  } catch (e) {
    return [];
  }
}

function prepareDownload(config) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(config.sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const colSKUIndex = headers.indexOf(config.colSKU);
  const colLinkIndex = headers.indexOf(config.colLink);
  
  const folder = DriveApp.createFolder("Catalog_" + config.sheetName + "_" + new Date().toLocaleString());
  let tasks = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][colLinkIndex]) {
      tasks.push({ 
        rowIndex: i + 1, 
        sku: data[i][colSKUIndex] || "NoSKU", 
        url: data[i][colLinkIndex],
        useRowPrefix: config.useRowPrefix,
        useDatasheetPrefix: config.useDatasheetPrefix
      });
    }
  }
  return { tasks: tasks, folderId: folder.getId(), folderUrl: folder.getUrl() };
}

function downloadSingleFile(task, folderId) {
  try {
    let url = task.url.toString().trim();
    if (!url.startsWith("http")) return { status: "Lỗi: Không phải Link" };
    if (url.includes("dropbox.com")) {
      url = url.includes("dl=0") ? url.replace("dl=0", "dl=1") : url + (url.includes("?") ? "&" : "?") + "dl=1";
    } else if (url.includes("drive.google.com")) {
      const fileId = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
      if (fileId) url = "https://drive.google.com/uc?export=download&id=" + fileId[1];
    }
    const response = UrlFetchApp.fetch(url, {followRedirects: true, muteHttpExceptions: true});
    if (response.getResponseCode() == 200) {
      const blob = response.getBlob();
      const contentType = blob.getContentType();

      // chặn HTML (link lỗi / private)
      if (contentType.includes("html")) {
        return { status: "Lỗi: File riêu tư/HTML" };
      }

      // xác định extension
      let ext = "";
      if (contentType.includes("pdf")) ext = ".pdf";
      else if (contentType.includes("jpeg")) ext = ".jpg";
      else if (contentType.includes("jpg")) ext = ".jpg";
      else if (contentType.includes("png")) ext = ".png";
      else if (contentType.includes("gif")) ext = ".gif";

      // làm sạch tên SKU
      const safeSKU = (task.sku || "NoSKU").toString().replace(/[\\/:*?"<>|]/g, "_");

      // xây dựng prefix
      let prefix = "";
      if (task.useRowPrefix) prefix += "Row" + task.rowIndex + "_";
      if (task.useDatasheetPrefix) prefix += "Datasheet_";

      // đặt tên file
      blob.setName(prefix + safeSKU + ext);

      DriveApp.getFolderById(folderId).createFile(blob);

      return { status: "Thành công" };
    }
    return { status: "Lỗi HTTP " + response.getResponseCode() };
  } catch (e) { return { status: "Lỗi: " + e.message }; }
}

function downloadBatch(tasks, folderId) {
  let results = [];

  for (let i = 0; i < tasks.length; i++) {
    try {
      const r = downloadSingleFile(tasks[i], folderId);
      results.push({
        rowIndex: tasks[i].rowIndex,
        status: r.status
      });
    } catch (e) {
      results.push({
        rowIndex: tasks[i].rowIndex,
        status: "Lỗi: " + e.message
      });
    }
  }

  return results;
}
