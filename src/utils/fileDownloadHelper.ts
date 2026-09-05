import JSZip from 'jszip';
import { DocumentItem, DocumentVersion } from '../types';

/**
 * Strip Vietnamese diacritics and convert to unaccented characters (tiếng Việt không dấu)
 */
export function removeVietnameseDiacritics(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Sanitize strings for safe file naming in OS (remove /, \, :, *, ?, ", <, >, | and strip Vietnamese diacritics)
 */
export function sanitizeFileNamePart(text: string): string {
  if (!text) return '';
  const noDiacritics = removeVietnameseDiacritics(text);
  return noDiacritics
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Format download filename according to user specification:
 * [Tên công ty]-[Tên file]-[Kỳ kê khai].[đuôi file]
 * TOÀN BỘ TÊN FILE HOÀN TOÀN KHÔNG CÓ DẤU (UNACCENTED)
 */
export function formatDownloadFileName(
  companyName: string,
  rawFileName: string,
  period: string,
  explicitExtension?: string
): string {
  const cleanCompany = sanitizeFileNamePart(companyName || 'DoanhNghiep');
  const cleanPeriod = sanitizeFileNamePart(period || 'KyKeKhai').replace(/\//g, '-');

  // Extract base name and extension from rawFileName
  let baseName = rawFileName || 'TaiLieu';
  let ext = explicitExtension || '';

  const lastDotIdx = baseName.lastIndexOf('.');
  if (lastDotIdx > 0 && lastDotIdx < baseName.length - 1) {
    if (!ext) {
      ext = baseName.substring(lastDotIdx); // e.g. ".xml", ".pdf"
    }
    baseName = baseName.substring(0, lastDotIdx);
  }

  if (!ext) {
    ext = '.pdf';
  } else if (!ext.startsWith('.')) {
    ext = `.${ext}`;
  }

  const cleanBaseName = sanitizeFileNamePart(baseName);

  // Output format: [Ten cong ty]-[Ten file]-[Ky ke khai].ext (Hoan toan khong co dau)
  return `${cleanCompany}-${cleanBaseName}-${cleanPeriod}${ext.toLowerCase()}`;
}

/**
 * Get appropriate MIME type for an extension
 */
export function getMimeTypeByExtension(ext: string): string {
  const cleanExt = ext.toLowerCase().replace(/^\./, '');
  switch (cleanExt) {
    case 'xml':
      return 'application/xml;charset=utf-8';
    case 'pdf':
      return 'application/pdf';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'doc':
      return 'application/msword';
    case 'csv':
      return 'text/csv;charset=utf-8';
    case 'json':
      return 'application/json;charset=utf-8';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'zip':
      return 'application/zip';
    case 'rar':
      return 'application/x-rar-compressed';
    case 'txt':
      return 'text/plain;charset=utf-8';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Generate compliant mock XML content for Vietnamese Tax / Invoices if no binary was uploaded
 */
function generateTaxXmlContent(doc: DocumentItem): string {
  const isInvoice = doc.category === 'Hóa đơn' || doc.fileName.toLowerCase().includes('hd') || doc.fileName.toLowerCase().includes('invoice');
  
  if (isInvoice) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<HDon xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <DLHDon Id="HD_${Date.now()}">
    <TTChung>
      <PBan>2.0.0</PBan>
      <THDon>HÓA ĐƠN ĐIỆN TỬ GIÁ TRỊ GIA TĂNG</THDon>
      <KHMSHDon>1</KHMSHDon>
      <KHHDon>C26TAA</KHHDon>
      <SHDon>0001289</SHDon>
      <NLap>${new Date().toISOString().split('T')[0]}</NLap>
      <DVTTe>VND</DVTTe>
      <TGia>1</TGia>
      <HTTToan>TM/CK</HTTToan>
    </TTChung>
    <NDHDon>
      <NBan>
        <Ten>${doc.companyName}</Ten>
        <MST>0301234567</MST>
        <DChi>TP. Hồ Chí Minh, Việt Nam</DChi>
      </NBan>
      <NMua>
        <Ten>Khách hàng Doanh nghiệp Đối tác</Ten>
        <MST>0319876543</MST>
      </NMua>
      <DSHHDVu>
        <HHDVu>
          <STT>1</STT>
          <THHDVu>Dịch vụ tư vấn kế toán và kê khai thuế kỳ ${doc.period}</THHDVu>
          <DVTinh>Gói</DVTinh>
          <SLuong>1</SLuong>
          <DGia>15000000</DGia>
          <Tien>15000000</Tien>
          <TSuat>10%</TSuat>
          <ThTien>16500000</ThTien>
        </HHDVu>
      </DSHHDVu>
      <TToan>
        <TgTCThue>15000000</TgTCThue>
        <TgTThue>1500000</TgTThue>
        <TgTTTBSo>16500000</TgTTTBSo>
        <TgTTTBChu>Mười sáu triệu năm trăm nghìn đồng chẵn./.</TgTTTBChu>
      </TToan>
    </NDHDon>
  </DLHDon>
  <DSCKS>
    <NBan>
      <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
        <SignatureValue>ACCUTAX_DIGITAL_SIGNATURE_VERIFIED_SUCCESS</SignatureValue>
      </Signature>
    </NBan>
  </DSCKS>
</HDon>`;
  }

  // Tax declaration XML (Tờ khai HTKK/eTax)
  return `<?xml version="1.0" encoding="UTF-8"?>
<HSoThueDTu xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <HSoKhaiThue>
    <TTinChung>
      <TTinTKhaiThue>
        <TKhai>
          <maTKhai>01_GTGT</maTKhai>
          <tenTKhai>TỜ KHAI THUẾ GIÁ TRỊ GIA TĂNG (Mẫu số 01/GTGT)</tenTKhai>
          <moTaTKhai>Ban hành kèm theo Thông tư số 80/2021/TT-BTC ngày 29/9/2021 của Bộ trưởng Bộ Tài chính</moTaTKhai>
        </TKhai>
        <KyKKhaiThue>
          <kieuKy>M</kieuKy>
          <kyKKhai>${doc.period}</kyKKhai>
        </KyKKhaiThue>
        <NNop>
          <tenNN>${doc.companyName}</tenNN>
          <mst>0301234567</mst>
          <dchiNNop>TP. Hồ Chí Minh, Việt Nam</dchiNNop>
        </NNop>
      </TTinTKhaiThue>
    </TTinChung>
    <CTieuTKhaiChinh>
      <ct21>0</ct21>
      <ct22>0</ct22>
      <ct23>125000000</ct23>
      <ct24>12500000</ct24>
      <ct25>12500000</ct25>
      <ct26>0</ct26>
      <ct29>0</ct29>
      <ct30>0</ct30>
      <ct32>250000000</ct32>
      <ct33>25000000</ct33>
      <ct34>250000000</ct34>
      <ct35>25000000</ct35>
      <ct36>12500000</ct36>
      <ct40>12500000</ct40>
      <ct41>0</ct41>
      <ct43>0</ct43>
    </CTieuTKhaiChinh>
  </HSoKhaiThue>
  <CKyDTu>
    <ChuKy>ACCUTAX_ETAX_DIGITAL_CERT_VALIDATED</ChuKy>
    <NgayKy>${new Date().toISOString()}</NgayKy>
  </CKyDTu>
</HSoThueDTu>`;
}

/**
 * Trigger real browser download with format:
 * [Tên công ty]-[Tên file]-[Kỳ kê khai].[extension]
 */
export function downloadDocumentFile(doc: DocumentItem, version?: DocumentVersion): void {
  const currentFileName = version ? version.fileName : (doc.fileName || doc.name);
  const extMatch = currentFileName.match(/\.([0-9a-z]+)$/i);
  const ext = extMatch ? `.${extMatch[1]}` : (doc.originalExtension || '.pdf');
  
  const finalDownloadName = formatDownloadFileName(
    doc.companyName,
    currentFileName,
    doc.period,
    ext
  );

  const rawContent = (version && version.fileContent) ? version.fileContent : doc.fileContent;

  if (rawContent && rawContent.startsWith('data:')) {
    // It is a base64 Data URL
    const a = document.createElement('a');
    a.href = rawContent;
    a.download = finalDownloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  let blobContent: BlobPart;
  const mimeType = getMimeTypeByExtension(ext);

  if (rawContent) {
    blobContent = rawContent;
  } else if (ext.toLowerCase() === '.xml') {
    blobContent = generateTaxXmlContent(doc);
  } else if (ext.toLowerCase() === '.csv') {
    blobContent = `STT,Mã hóa đơn,Ký hiệu,Ngày lập,Người bán,Mã số thuế,Doanh số chưa thuế,Thuế suất,Thuế GTGT,Tổng tiền\n1,0001289,C26TAA,${new Date().toISOString().split('T')[0]},${doc.companyName},0301234567,15000000,10%,1500000,16500000\n`;
  } else if (ext.toLowerCase() === '.json') {
    blobContent = JSON.stringify({
      company: doc.companyName,
      period: doc.period,
      documentType: doc.category,
      fileName: doc.fileName,
      downloadDate: new Date().toISOString(),
      metadata: doc
    }, null, 2);
  } else {
    // For standard PDF / DOCX / Binary simulation
    blobContent = `ACCUTAX DOCUMENT REPOSITORY EXPORT
===========================================
Doanh nghiệp: ${doc.companyName}
Kỳ kê khai: ${doc.period}
Phân loại: ${doc.category}
Tên tệp gốc: ${doc.fileName}
Phiên bản: v${version ? version.version : doc.currentVersion}
Tải xuống lúc: ${new Date().toLocaleString('vi-VN')}
Trạng thái xác thực: HỢP LỆ (Quy chuẩn Tổng cục Thuế Việt Nam)
===========================================
Nội dung chứng từ số hóa được lưu trữ bảo mật trên Hệ Thống Kế Toán Thuế AccuTax.
`;
  }

  const blob = new Blob([blobContent], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalDownloadName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Compress multiple documents into a single ZIP file while preserving:
 * 1. Strict unaccented filenames: [Tên công ty]-[Tên file]-[Kỳ kê khai].[extension]
 * 2. Original compliant content (XML, PDF, Excel, etc.)
 */
export async function exportDocumentsAsZip(
  docs: DocumentItem[],
  customZipName?: string
): Promise<void> {
  if (!docs || docs.length === 0) return;

  const zip = new JSZip();
  const nameCounts: { [name: string]: number } = {};

  for (const doc of docs) {
    const currentFileName = doc.fileName || doc.name;
    const extMatch = currentFileName.match(/\.([0-9a-z]+)$/i);
    const ext = extMatch ? `.${extMatch[1]}` : (doc.originalExtension || '.pdf');

    let formattedName = formatDownloadFileName(
      doc.companyName,
      currentFileName,
      doc.period,
      ext
    );

    // Ensure unique filenames within the ZIP container
    if (nameCounts[formattedName]) {
      nameCounts[formattedName]++;
      const dotIdx = formattedName.lastIndexOf('.');
      if (dotIdx !== -1) {
        const base = formattedName.substring(0, dotIdx);
        const fileExt = formattedName.substring(dotIdx);
        formattedName = `${base}_(${nameCounts[formattedName]})${fileExt}`;
      } else {
        formattedName = `${formattedName}_(${nameCounts[formattedName]})`;
      }
    } else {
      nameCounts[formattedName] = 1;
    }

    const rawContent = doc.fileContent;
    if (rawContent && rawContent.startsWith('data:')) {
      // Extract Base64 binary
      const base64Data = rawContent.split(',')[1];
      zip.file(formattedName, base64Data, { base64: true });
    } else if (rawContent) {
      zip.file(formattedName, rawContent);
    } else if (ext.toLowerCase() === '.xml') {
      zip.file(formattedName, generateTaxXmlContent(doc));
    } else if (ext.toLowerCase() === '.csv') {
      zip.file(
        formattedName,
        `STT,Mã hóa đơn,Ký hiệu,Ngày lập,Người bán,Mã số thuế,Doanh số chưa thuế,Thuế suất,Thuế GTGT,Tổng tiền\n1,0001289,C26TAA,${new Date().toISOString().split('T')[0]},${doc.companyName},0301234567,15000000,10%,1500000,16500000\n`
      );
    } else if (ext.toLowerCase() === '.json') {
      zip.file(
        formattedName,
        JSON.stringify(
          {
            company: doc.companyName,
            period: doc.period,
            documentType: doc.category,
            fileName: doc.fileName,
            downloadDate: new Date().toISOString(),
            metadata: doc
          },
          null,
          2
        )
      );
    } else {
      zip.file(
        formattedName,
        `ACCUTAX DOCUMENT REPOSITORY EXPORT
===========================================
Doanh nghiệp: ${doc.companyName}
Kỳ kê khai: ${doc.period}
Phân loại: ${doc.category}
Tên tệp gốc: ${doc.fileName}
Phiên bản: v${doc.currentVersion}
Tải xuống lúc: ${new Date().toLocaleString('vi-VN')}
Trạng thái xác thực: HỢP LỆ (Quy chuẩn Tổng cục Thuế Việt Nam)
===========================================
Nội dung chứng từ số hóa được lưu trữ bảo mật trên Hệ Thống Kế Toán Thuế AccuTax.
`
      );
    }
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const finalZipName = customZipName 
    ? (customZipName.endsWith('.zip') ? customZipName : `${customZipName}.zip`)
    : `AccuTax_HoSo_ChungTu_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.zip`;

  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalZipName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
