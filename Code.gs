// --- MENU HỆ THỐNG ---
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Automation')
    .addItem('Tải Catalog thông minh', 'openDownloadCatalogSidebar')
    .addItem('Kiểm tra trùng lặp theo cột', 'openCheckDuplicateColumn')
    .addItem('Vlookup dữ liệu theo SKU', 'openAutoLookupSidebar')
    .addItem('Chuẩn hóa - xóa bản ghi nhóm', 'openNormalizeGroupSidebar')
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

function openAutoLookupSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('HtmlAutoLookup')
    .setTitle('Copy dữ liệu theo SKU')
    .setWidth(320);
  SpreadsheetApp.getUi().showSidebar(html);
}

function openNormalizeGroupSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('HtmlNormalizeGroup')
    .setTitle('Chuẩn hóa nhóm sản phẩm')
    .setWidth(340);
  SpreadsheetApp.getUi().showSidebar(html);
}

// --- CHỨC NĂNG 1: KIỂM TRA TRÙNG LẶP ---
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

  const folder = DriveApp.createFolder('Catalog_' + config.sheetName + '_' + new Date().toLocaleString());
  let tasks = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][colLinkIndex]) {
      tasks.push({
        rowIndex: i + 1,
        sku: data[i][colSKUIndex] || 'NoSKU',
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
    if (!url.startsWith('http')) return { status: 'Lỗi: Không phải Link' };
    if (url.includes('dropbox.com')) {
      url = url.includes('dl=0') ? url.replace('dl=0', 'dl=1') : url + (url.includes('?') ? '&' : '?') + 'dl=1';
    } else if (url.includes('drive.google.com')) {
      const fileId = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
      if (fileId) url = 'https://drive.google.com/uc?export=download&id=' + fileId[1];
    }
    const response = UrlFetchApp.fetch(url, { followRedirects: true, muteHttpExceptions: true });
    if (response.getResponseCode() == 200) {
      const blob = response.getBlob();
      const contentType = blob.getContentType();

      if (contentType.includes('html')) {
        return { status: 'Lỗi: File riêu tư/HTML' };
      }

      let ext = '';
      if (contentType.includes('pdf')) ext = '.pdf';
      else if (contentType.includes('jpeg')) ext = '.jpg';
      else if (contentType.includes('jpg')) ext = '.jpg';
      else if (contentType.includes('png')) ext = '.png';
      else if (contentType.includes('gif')) ext = '.gif';

      const safeSKU = (task.sku || 'NoSKU').toString().replace(/[\\/:*?"<>|]/g, '_');

      let prefix = '';
      if (task.useRowPrefix) prefix += 'Row' + task.rowIndex + '_';
      if (task.useDatasheetPrefix) prefix += 'Datasheet_';

      blob.setName(prefix + safeSKU + ext);

      DriveApp.getFolderById(folderId).createFile(blob);

      return { status: 'Thành công' };
    }
    return { status: 'Lỗi HTTP ' + response.getResponseCode() };
  } catch (e) { return { status: 'Lỗi: ' + e.message }; }
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
        status: 'Lỗi: ' + e.message
      });
    }
  }

  return results;
}

// --- CHỨC NĂNG 3: COPY DỮ LIỆU THEO SKU ---
function executeCopyBySkuLookup(config) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sourceSheet = ss.getSheetByName(config.sourceSheet);
    const targetSheet = ss.getSheetByName(config.targetSheet);

    if (!sourceSheet || !targetSheet) {
      return { success: false, error: 'Sheet nguồn hoặc sheet đích không tồn tại' };
    }

    const sourceLastRow = sourceSheet.getLastRow();
    const targetLastRow = targetSheet.getLastRow();
    if (sourceLastRow < 2 || targetLastRow < 2) {
      return { success: true, matchCount: 0, updatedCount: 0, totalRows: 0, targetCol: config.targetDataCol, durationMs: 0 };
    }

    const sourceHeaders = sourceSheet.getRange(1, 1, 1, sourceSheet.getLastColumn()).getValues()[0];
    const targetHeaders = targetSheet.getRange(1, 1, 1, targetSheet.getLastColumn()).getValues()[0];

    const sourceSKUIndex = sourceHeaders.indexOf(config.sourceSKUCol);
    const sourceDataIndex = sourceHeaders.indexOf(config.sourceDataCol);
    const targetSKUIndex = targetHeaders.indexOf(config.targetSKUCol);
    const targetDataIndex = targetHeaders.indexOf(config.targetDataCol);

    if (sourceSKUIndex < 0 || sourceDataIndex < 0) {
      return { success: false, error: 'Cột trong sheet nguồn không tìm thấy' };
    }
    if (targetSKUIndex < 0 || targetDataIndex < 0) {
      return { success: false, error: 'Cột trong sheet đích không tìm thấy' };
    }

    const startTime = Date.now();
    const sourceSKUValues = sourceSheet.getRange(2, sourceSKUIndex + 1, sourceLastRow - 1, 1).getValues();
    const sourceDataValues = sourceSheet.getRange(2, sourceDataIndex + 1, sourceLastRow - 1, 1).getValues();
    const targetSKUValues = targetSheet.getRange(2, targetSKUIndex + 1, targetLastRow - 1, 1).getValues();
    const targetDataValues = targetSheet.getRange(2, targetDataIndex + 1, targetLastRow - 1, 1).getValues();

    const sourceMap = new Map();
    for (let i = 0; i < sourceSKUValues.length; i++) {
      const rawSku = sourceSKUValues[i][0];
      if (rawSku === '' || rawSku === null || rawSku === undefined) continue;
      const sku = rawSku.toString().trim();
      if (!sku) continue;
      sourceMap.set(sku, sourceDataValues[i][0]);
    }

    const dataToUpdate = new Array(targetSKUValues.length);
    let matchCount = 0;
    let updatedCount = 0;

    for (let i = 0; i < targetSKUValues.length; i++) {
      const rawTargetSku = targetSKUValues[i][0];
      const targetSku = (rawTargetSku === null || rawTargetSku === undefined) ? '' : rawTargetSku.toString().trim();
      const currentTargetValue = targetDataValues[i][0];
      const isTargetEmpty = currentTargetValue === '' || currentTargetValue === null || currentTargetValue === undefined;

      if (targetSku && sourceMap.has(targetSku)) {
        matchCount++;
        const sourceValue = sourceMap.get(targetSku);
        const hasSourceValue = !(sourceValue === '' || sourceValue === null || sourceValue === undefined);

        if (isTargetEmpty && hasSourceValue) {
          dataToUpdate[i] = [sourceValue];
          updatedCount++;
        } else {
          dataToUpdate[i] = [currentTargetValue];
        }
      } else {
        dataToUpdate[i] = [currentTargetValue];
      }
    }

    targetSheet.getRange(2, targetDataIndex + 1, dataToUpdate.length, 1).setValues(dataToUpdate);

    return {
      success: true,
      matchCount: matchCount,
      updatedCount: updatedCount,
      totalRows: targetSKUValues.length,
      targetCol: config.targetDataCol,
      durationMs: Date.now() - startTime
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// --- CHỨC NĂNG 4: CHUẨN HÓA - XÓA BẢN GHI NHÓM ---
function normalizeGroupRowsByConfig(config) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(config.sheetName);
    if (!sheet) {
      return { success: false, error: 'Không tìm thấy sheet đã chọn.' };
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return { success: true, updatedCount: 0, deletedGroupRows: 0, message: 'Không có dữ liệu để xử lý.' };
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const groupCol = headers.indexOf(config.groupColName) + 1;
    const fillCol = headers.indexOf(config.fillColName) + 1;
    const skuCol = headers.findIndex(h => (h || '').toString().trim().toLowerCase() === 'sku') + 1;
    const descCol = headers.findIndex(h => (h || '').toString().trim().toLowerCase() === 'description') + 1;

    if (!groupCol || !fillCol) {
      return { success: false, error: 'Không tìm thấy cột Nhóm hoặc cột Fill trong sheet đã chọn.' };
    }
    if (!skuCol || !descCol) {
      return { success: false, error: 'Không tìm thấy cột SKU hoặc Description để nhận diện dòng nhóm.' };
    }

    const rowCount = lastRow - 1;
    const groupValues = sheet.getRange(2, groupCol, rowCount, 1).getValues();
    const fillValues = sheet.getRange(2, fillCol, rowCount, 1).getValues();
    const skuValues = sheet.getRange(2, skuCol, rowCount, 1).getValues();
    const descValues = sheet.getRange(2, descCol, rowCount, 1).getValues();

    let currentGroupName = '';
    let updatedCount = 0;
    const rowsToDelete = [];

    for (let i = 0; i < rowCount; i++) {
      const skuText = (skuValues[i][0] || '').toString().trim();
      const descText = (descValues[i][0] || '').toString().trim();
      const groupText = (groupValues[i][0] || '').toString().trim();

      const isGroupRow = skuText !== '' && descText === '';
      const isNormalRow = skuText !== '' && descText !== '';

      if (isGroupRow) {
        currentGroupName = groupText;
        rowsToDelete.push(i + 2);
        continue;
      }

      if (isNormalRow && currentGroupName && fillValues[i][0] !== currentGroupName) {
        fillValues[i][0] = currentGroupName;
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      sheet.getRange(2, fillCol, rowCount, 1).setValues(fillValues);
    }

    for (let i = rowsToDelete.length - 1; i >= 0; i--) {
      sheet.deleteRow(rowsToDelete[i]);
    }

    return {
      success: true,
      updatedCount: updatedCount,
      deletedGroupRows: rowsToDelete.length,
      message: 'Hoàn tất copy tên nhóm vào bản ghi.'
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function normalizeGroupRows() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const groupDefault = headers.find(h => (h || '').toString().trim().toLowerCase() === 'sku') || headers[2] || '';
  const fillDefault = headers.find(h => (h || '').toString().trim().toLowerCase() === 'class') || headers[1] || '';

  return normalizeGroupRowsByConfig({
    sheetName: sheet.getName(),
    groupColName: groupDefault,
    fillColName: fillDefault
  });
}
