import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  FolderArchive, 
  Search, 
  Upload, 
  FileText, 
  Sparkles, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  FileCheck, 
  Eye, 
  Download,
  Building2,
  Tag,
  Calendar,
  Filter,
  FileCode,
  FileSpreadsheet,
  FileType,
  Layers,
  Check,
  RefreshCw,
  Clock,
  X,
  List,
  Grid,
  FileBadge,
  Archive,
  Trash2,
  Edit3,
  CheckSquare,
  Square,
  ChevronDown,
  Package,
  FileArchive,
  SlidersHorizontal
} from 'lucide-react';
import { DocumentItem, Company, DocumentCategory, DocumentVersion } from '../types';
import { downloadDocumentFile, formatDownloadFileName, exportDocumentsAsZip } from '../utils/fileDownloadHelper';

interface DocumentVaultProps {
  documents: DocumentItem[];
  companies: Company[];
  onUploadDocument: (fileData: Partial<DocumentItem>) => void;
  onDeleteDocument?: (docId: string) => void;
  onBulkDeleteDocuments?: (docIds: string[]) => void;
  onBulkUpdateDocuments?: (docIds: string[], updates: Partial<DocumentItem>) => void;
  onClassifyWithAI: (fileName: string, fileSnippet: string) => Promise<any>;
  globalCompanyId?: string;
  globalPeriod?: string;
  globalFromDate?: string;
  globalToDate?: string;
  globalQuickTag?: string;
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  documents,
  companies,
  onUploadDocument,
  onDeleteDocument,
  onBulkDeleteDocuments,
  onBulkUpdateDocuments,
  onClassifyWithAI,
  globalCompanyId,
  globalPeriod,
  globalFromDate,
  globalToDate,
  globalQuickTag
}) => {
  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Multi-dimensional filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(globalCompanyId || 'ALL');
  const [selectedPeriodType, setSelectedPeriodType] = useState<'ALL' | 'Month' | 'Quarter' | 'Year'>('ALL');
  const [selectedPeriodValue, setSelectedPeriodValue] = useState<string>(globalPeriod && globalPeriod !== 'Tất cả kỳ' ? globalPeriod : 'ALL');
  const [selectedFileFormat, setSelectedFileFormat] = useState<string>(globalQuickTag === 'XML_FILES' ? 'XML' : 'ALL'); // ALL, XML, PDF, XLSX, DOCX, IMG
  const [fromDate, setFromDate] = useState<string>(globalFromDate || '');
  const [toDate, setToDate] = useState<string>(globalToDate || '');

  // Synchronize when global filters change
  React.useEffect(() => {
    if (globalCompanyId !== undefined) setSelectedCompanyId(globalCompanyId);
  }, [globalCompanyId]);

  React.useEffect(() => {
    if (globalPeriod !== undefined) {
      if (globalPeriod === 'Tất cả kỳ') {
        setSelectedPeriodValue('ALL');
      } else {
        setSelectedPeriodValue(globalPeriod);
      }
    }
  }, [globalPeriod]);

  React.useEffect(() => {
    if (globalFromDate !== undefined) setFromDate(globalFromDate);
  }, [globalFromDate]);

  React.useEffect(() => {
    if (globalToDate !== undefined) setToDate(globalToDate);
  }, [globalToDate]);

  React.useEffect(() => {
    if (globalQuickTag === 'XML_FILES') {
      setSelectedFileFormat('XML');
    }
  }, [globalQuickTag]);

  // Selection for bulk actions
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isSelectionDropdownOpen, setIsSelectionDropdownOpen] = useState(false);
  const selectionDropdownRef = useRef<HTMLDivElement>(null);

  // Bulk Edit Modal State
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkEditPeriod, setBulkEditPeriod] = useState<string>('KEEP_ORIGINAL');
  const [bulkEditCategory, setBulkEditCategory] = useState<string>('KEEP_ORIGINAL');
  const [bulkEditCompanyId, setBulkEditCompanyId] = useState<string>('KEEP_ORIGINAL');

  // Bulk Delete Modal State
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // ZIP Generation State
  const [isZipping, setIsZipping] = useState(false);

  // Click outside to close selection dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectionDropdownRef.current && !selectionDropdownRef.current.contains(e.target as Node)) {
        setIsSelectionDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Version modal & preview modal state
  const [selectedDocForVersion, setSelectedDocForVersion] = useState<DocumentItem | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadContent, setUploadContent] = useState<string>('');
  const [uploadFileSize, setUploadFileSize] = useState<string>('1.5 MB');
  const [uploadMimeType, setUploadMimeType] = useState<string>('application/xml');
  const [selectedUploadCompanyId, setSelectedUploadCompanyId] = useState<string>('');
  const [selectedUploadCategory, setSelectedUploadCategory] = useState<DocumentCategory>('Tờ khai thuế');
  const [selectedUploadPeriod, setSelectedUploadPeriod] = useState<string>('Tháng 08/2026');
  const [uploadNotes, setUploadNotes] = useState<string>('');
  const [isClassifying, setIsClassifying] = useState(false);
  const [aiClassification, setAiClassification] = useState<any>(null);

  const categories: DocumentCategory[] = [
    'Tờ khai thuế',
    'Hóa đơn',
    'Bảng kê mua vào',
    'Bảng kê bán ra',
    'Sao kê ngân hàng',
    'Bảng lương',
    'Báo cáo tài chính',
    'Giấy nộp tiền',
    'Hồ sơ quyết toán',
    'Hợp đồng',
    'Hồ sơ pháp lý',
    'Tài liệu khác'
  ];

  // Helper icon for file types
  const getFileIcon = (fileName: string, category: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (ext === 'xml') {
      return <FileCode className="w-5 h-5 text-emerald-600" />;
    } else if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    } else if (ext === 'pdf') {
      return <FileText className="w-5 h-5 text-red-600" />;
    } else if (ext === 'doc' || ext === 'docx') {
      return <FileType className="w-5 h-5 text-blue-600" />;
    }
    return <FileText className="w-5 h-5 text-purple-600" />;
  };

  const getFormatBadge = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE';
    if (ext === 'XML') return <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">XML HTKK/eTax</span>;
    if (ext === 'PDF') return <span className="text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded">PDF</span>;
    if (ext === 'XLSX' || ext === 'XLS') return <span className="text-[10px] font-bold bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded">EXCEL</span>;
    if (ext === 'DOCX' || ext === 'DOC') return <span className="text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">WORD</span>;
    return <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{ext}</span>;
  };

  // Filter logic
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // 1. Search query
      const matchSearch = 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        doc.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.period && doc.period.toLowerCase().includes(searchTerm.toLowerCase()));

      // 2. Category
      const matchCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;

      // 3. Company
      const matchCompany = selectedCompanyId === 'ALL' || doc.companyId === selectedCompanyId;

      // 4. Period Type (Month, Quarter, Year)
      let matchPeriodType = true;
      if (selectedPeriodType === 'Month') {
        matchPeriodType = doc.period.includes('Tháng') || /T[0-9]{1,2}/i.test(doc.period);
      } else if (selectedPeriodType === 'Quarter') {
        matchPeriodType = doc.period.includes('Quý') || /Q[1-4]/i.test(doc.period);
      } else if (selectedPeriodType === 'Year') {
        matchPeriodType = doc.period.includes('Năm') || doc.period === '2026' || doc.period === '2025';
      }

      // 5. Specific Period Value
      let matchPeriodValue = true;
      if (selectedPeriodValue !== 'ALL') {
        matchPeriodValue = doc.period.toLowerCase().includes(selectedPeriodValue.toLowerCase());
      }

      // 6. File format (XML, PDF, XLSX, DOCX)
      let matchFormat = true;
      const ext = doc.fileName.split('.').pop()?.toLowerCase() || '';
      if (selectedFileFormat === 'XML') matchFormat = ext === 'xml';
      else if (selectedFileFormat === 'PDF') matchFormat = ext === 'pdf';
      else if (selectedFileFormat === 'EXCEL') matchFormat = ['xlsx', 'xls', 'csv'].includes(ext);
      else if (selectedFileFormat === 'WORD') matchFormat = ['docx', 'doc'].includes(ext);
      else if (selectedFileFormat === 'IMAGE') matchFormat = ['png', 'jpg', 'jpeg'].includes(ext);

      // 7. Date range (from uploadedAt or date in period)
      let matchDateRange = true;
      if (fromDate || toDate) {
        const uploadDateStr = doc.uploadedAt ? doc.uploadedAt.split('T')[0] : '';
        if (fromDate && uploadDateStr < fromDate) matchDateRange = false;
        if (toDate && uploadDateStr > toDate) matchDateRange = false;
      }

      return matchSearch && matchCategory && matchCompany && matchPeriodType && matchPeriodValue && matchFormat && matchDateRange;
    });
  }, [documents, searchTerm, selectedCategory, selectedCompanyId, selectedPeriodType, selectedPeriodValue, selectedFileFormat, fromDate, toDate]);

  // Handle Real File selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    setUploadFileName(file.name);
    setUploadFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    setUploadMimeType(file.type || 'application/octet-stream');

    // Auto-detect extension
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    // Read file content
    const reader = new FileReader();
    if (ext === 'xml' || ext === 'csv' || ext === 'txt' || ext === 'json') {
      reader.onload = (event) => {
        setUploadContent(event.target?.result as string || '');
      };
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.onload = (event) => {
        setUploadContent(event.target?.result as string || '');
      };
      reader.readAsDataURL(file);
    }

    // Auto classify with AI / Fallback
    setIsClassifying(true);
    try {
      const result = await onClassifyWithAI(file.name, `File: ${file.name}, Kích thước: ${(file.size / 1024).toFixed(1)} KB, MIME: ${file.type}`);
      setAiClassification(result);
      if (result?.category && categories.includes(result.category)) {
        setSelectedUploadCategory(result.category);
      }
      if (result?.companyCode) {
        const matched = companies.find(c => c.code === result.companyCode);
        if (matched) setSelectedUploadCompanyId(matched.id);
      }
      if (result?.period) {
        setSelectedUploadPeriod(result.period);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsClassifying(false);
    }
  };

  // Open upload modal with clean state
  const handleOpenUploadModal = () => {
    setUploadFile(null);
    setUploadFileName('');
    setUploadContent('');
    setUploadNotes('');
    setAiClassification(null);
    setSelectedUploadCompanyId(companies[0]?.id || '');
    setSelectedUploadCategory('Tờ khai thuế');
    setSelectedUploadPeriod('Tháng 08/2026');
    setIsUploadOpen(true);
  };

  // Confirm save uploaded document
  const handleConfirmUpload = () => {
    if (!uploadFileName) {
      alert('Vui lòng chọn tệp tin cần tải lên!');
      return;
    }

    const matchedComp = companies.find(c => c.id === selectedUploadCompanyId) || companies[0];
    const ext = uploadFileName.split('.').pop()?.toLowerCase() || '';

    onUploadDocument({
      companyId: matchedComp.id,
      companyName: matchedComp.name,
      period: selectedUploadPeriod,
      category: selectedUploadCategory,
      name: uploadFileName,
      fileName: uploadFileName,
      fileSize: uploadFileSize,
      fileType: uploadMimeType,
      originalExtension: `.${ext}`,
      fileContent: uploadContent,
      uploadedBy: 'Trần Kế Toán (KTT)',
      confidenceScore: aiClassification?.confidenceScore || 95,
      versions: [
        {
          version: 1,
          fileName: uploadFileName,
          fileSize: uploadFileSize,
          uploadedBy: 'Trần Kế Toán (KTT)',
          uploadedAt: new Date().toISOString(),
          notes: uploadNotes || 'Khởi tạo tài liệu',
          fileContent: uploadContent,
          originalExtension: `.${ext}`
        }
      ]
    });

    setIsUploadOpen(false);
    alert(`✅ Đã tải lên và lưu thành công tệp "${uploadFileName}" cho ${matchedComp.name}!`);
  };

  // Single file download with naming convention: Tên công ty-Tên file-Kỳ kê khai
  const handleDownload = (doc: DocumentItem, version?: DocumentVersion) => {
    downloadDocumentFile(doc, version);
  };

  // Bulk ZIP Download with strict unaccented filenames and original file content
  const handleBulkDownloadZip = async () => {
    if (selectedDocIds.length === 0) return;
    const docsToDownload = documents.filter(d => selectedDocIds.includes(d.id));
    if (docsToDownload.length === 0) return;

    setIsZipping(true);
    try {
      let zipName = 'AccuTax_HoSo_ChungTu_';
      if (selectedCompanyId !== 'ALL') {
        const comp = companies.find(c => c.id === selectedCompanyId);
        if (comp) zipName = `AccuTax_${comp.code || 'DoanhNghiep'}_`;
      }
      if (selectedPeriodValue !== 'ALL') {
        zipName += `${selectedPeriodValue.replace(/[\/\s]/g, '_')}_`;
      }
      zipName += new Date().toISOString().split('T')[0].replace(/-/g, '');

      await exportDocumentsAsZip(docsToDownload, zipName);
    } catch (err) {
      console.error('Error generating ZIP:', err);
      alert('Đã xảy ra lỗi khi tạo tệp ZIP. Vui lòng thử lại!');
    } finally {
      setIsZipping(false);
    }
  };

  const handleDeleteDoc = (doc: DocumentItem) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài liệu "${doc.name}" của doanh nghiệp ${doc.companyName}?`)) return;
    if (onDeleteDocument) {
      onDeleteDocument(doc.id);
    }
  };

  // Selection Manipulation Methods
  const toggleSelectDoc = (id: string) => {
    if (selectedDocIds.includes(id)) setSelectedDocIds(selectedDocIds.filter(i => i !== id));
    else setSelectedDocIds([...selectedDocIds, id]);
  };

  const toggleSelectAll = () => {
    if (selectedDocIds.length === filteredDocuments.length) setSelectedDocIds([]);
    else setSelectedDocIds(filteredDocuments.map(d => d.id));
  };

  const handleSelectAllFiltered = () => {
    setSelectedDocIds(filteredDocuments.map(d => d.id));
    setIsSelectionDropdownOpen(false);
  };

  const handleSelectAllVault = () => {
    setSelectedDocIds(documents.map(d => d.id));
    setIsSelectionDropdownOpen(false);
  };

  const handleDeselectAll = () => {
    setSelectedDocIds([]);
    setIsSelectionDropdownOpen(false);
  };

  const handleInvertSelection = () => {
    const currentSet = new Set(selectedDocIds);
    const inverted = filteredDocuments.filter(d => !currentSet.has(d.id)).map(d => d.id);
    setSelectedDocIds(inverted);
    setIsSelectionDropdownOpen(false);
  };

  const handleSelectByFormat = (format: string) => {
    const matched = filteredDocuments.filter(d => {
      const ext = (d.fileName || d.name).split('.').pop()?.toLowerCase() || '';
      if (format === 'XML') return ext === 'xml';
      if (format === 'PDF') return ext === 'pdf';
      if (format === 'EXCEL') return ['xlsx', 'xls', 'csv'].includes(ext);
      if (format === 'WORD') return ['docx', 'doc'].includes(ext);
      return false;
    }).map(d => d.id);
    setSelectedDocIds(Array.from(new Set([...selectedDocIds, ...matched])));
    setIsSelectionDropdownOpen(false);
  };

  const handleSelectByCategory = (cat: string) => {
    const matched = filteredDocuments.filter(d => d.category === cat).map(d => d.id);
    setSelectedDocIds(Array.from(new Set([...selectedDocIds, ...matched])));
    setIsSelectionDropdownOpen(false);
  };

  const handleSelectWithIssues = () => {
    const matched = filteredDocuments.filter(d => d.status === 'NeedsConfirmation' || (d.confidenceScore && d.confidenceScore < 80)).map(d => d.id);
    setSelectedDocIds(Array.from(new Set([...selectedDocIds, ...matched])));
    setIsSelectionDropdownOpen(false);
  };

  // Bulk Edit Actions
  const handleOpenBulkEdit = () => {
    setBulkEditPeriod('KEEP_ORIGINAL');
    setBulkEditCategory('KEEP_ORIGINAL');
    setBulkEditCompanyId('KEEP_ORIGINAL');
    setIsBulkEditOpen(true);
  };

  const handleExecuteBulkEdit = () => {
    if (selectedDocIds.length === 0) return;
    const updates: Partial<DocumentItem> = {};

    if (bulkEditPeriod !== 'KEEP_ORIGINAL') {
      updates.period = bulkEditPeriod;
    }
    if (bulkEditCategory !== 'KEEP_ORIGINAL') {
      updates.category = bulkEditCategory as DocumentCategory;
    }
    if (bulkEditCompanyId !== 'KEEP_ORIGINAL') {
      const matchedComp = companies.find(c => c.id === bulkEditCompanyId);
      if (matchedComp) {
        updates.companyId = matchedComp.id;
        updates.companyName = matchedComp.name;
        updates.companyCode = matchedComp.code;
      }
    }

    if (Object.keys(updates).length === 0) {
      alert('Vui lòng chọn ít nhất 1 thông tin cần thay đổi!');
      return;
    }

    if (onBulkUpdateDocuments) {
      onBulkUpdateDocuments(selectedDocIds, updates);
    }
    setIsBulkEditOpen(false);
    alert(`✅ Đã cập nhật hàng loạt ${selectedDocIds.length} tệp tài liệu thành công!`);
  };

  // Bulk Delete Actions
  const handleExecuteBulkDelete = () => {
    if (selectedDocIds.length === 0) return;
    if (onBulkDeleteDocuments) {
      onBulkDeleteDocuments(selectedDocIds);
    } else if (onDeleteDocument) {
      selectedDocIds.forEach(id => onDeleteDocument(id));
    }
    const count = selectedDocIds.length;
    setSelectedDocIds([]);
    setIsBulkDeleteOpen(false);
    alert(`✅ Đã xóa ${count} tệp tài liệu khỏi kho lưu trữ!`);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedCompanyId('ALL');
    setSelectedPeriodType('ALL');
    setSelectedPeriodValue('ALL');
    setSelectedFileFormat('ALL');
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FolderArchive className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Kho Hồ Sơ Chứng Từ & Tờ Khai Thuế ({filteredDocuments.length}/{documents.length})
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Lưu trữ bảo mật định dạng XML (Tờ khai HTKK/eTax & Hóa đơn CQT), Excel bảng kê, PDF sao kê, tự động đổi tên tải xuống chuẩn <strong>[Tên công ty]-[Tên file]-[Kỳ kê khai]</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Switch View Mode */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'grid' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Xem dạng thẻ"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'table' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Xem dạng bảng"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleOpenUploadModal}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Tải Lên Chứng Từ / File XML</span>
          </button>
        </div>
      </div>

      {/* Multi-Dimensional Filter Control Center */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Quick Period Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1 mr-1">
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              <span>Kỳ Kê Khai:</span>
            </span>
            <button
              onClick={() => { setSelectedPeriodType('ALL'); setSelectedPeriodValue('ALL'); }}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                selectedPeriodType === 'ALL'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tất Cả Kỳ
            </button>
            <button
              onClick={() => { setSelectedPeriodType('Month'); }}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                selectedPeriodType === 'Month'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📅 Theo Tháng (T1 - T12)
            </button>
            <button
              onClick={() => { setSelectedPeriodType('Quarter'); }}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                selectedPeriodType === 'Quarter'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📊 Theo Quý (Q1 - Q4)
            </button>
            <button
              onClick={() => { setSelectedPeriodType('Year'); }}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                selectedPeriodType === 'Year'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📆 Theo Năm (BCTC/Quyết Toán)
            </button>
          </div>

          {/* Reset Filters button */}
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-purple-600 font-medium px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Xóa bộ lọc</span>
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          {/* 1. Keyword search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tên file, tên công ty, mã số thuế..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* 2. Specific Period Value Dropdown */}
          <div>
            <select
              value={selectedPeriodValue}
              onChange={(e) => setSelectedPeriodValue(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">Mọi Tháng / Quý / Năm</option>
              <optgroup label="Kỳ Kê Khai Theo Tháng">
                <option value="Tháng 01/2026">Tháng 01/2026</option>
                <option value="Tháng 02/2026">Tháng 02/2026</option>
                <option value="Tháng 03/2026">Tháng 03/2026</option>
                <option value="Tháng 04/2026">Tháng 04/2026</option>
                <option value="Tháng 05/2026">Tháng 05/2026</option>
                <option value="Tháng 06/2026">Tháng 06/2026</option>
                <option value="Tháng 07/2026">Tháng 07/2026</option>
                <option value="Tháng 08/2026">Tháng 08/2026</option>
                <option value="Tháng 09/2026">Tháng 09/2026</option>
                <option value="Tháng 10/2026">Tháng 10/2026</option>
                <option value="Tháng 11/2026">Tháng 11/2026</option>
                <option value="Tháng 12/2026">Tháng 12/2026</option>
              </optgroup>
              <optgroup label="Kỳ Kê Khai Theo Quý">
                <option value="Quý I/2026">Quý I/2026</option>
                <option value="Quý II/2026">Quý II/2026</option>
                <option value="Quý III/2026">Quý III/2026</option>
                <option value="Quý IV/2026">Quý IV/2026</option>
              </optgroup>
              <optgroup label="Kỳ Kê Khai Theo Năm">
                <option value="Năm 2026">Năm 2026 (BCTC & Quyết toán)</option>
                <option value="Năm 2025">Năm 2025</option>
              </optgroup>
            </select>
          </div>

          {/* 3. Company Selector */}
          <div>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">🏢 Mọi Doanh Nghiệp ({companies.length})</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name.length > 28 ? c.name.substring(0, 28) + '...' : c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Category Selector */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">📂 Mọi Loại Chứng Từ</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 5. Format Selector */}
          <div>
            <select
              value={selectedFileFormat}
              onChange={(e) => setSelectedFileFormat(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">⚡ Mọi Định Dạng File</option>
              <option value="XML">🟢 File XML (Tờ khai & Hóa đơn)</option>
              <option value="PDF">🔴 File PDF (Sao kê, Văn bản)</option>
              <option value="EXCEL">📗 File Excel (Bảng kê, Báo cáo)</option>
              <option value="WORD">📘 File Word (Hợp đồng, ĐKKD)</option>
              <option value="IMAGE">🖼️ Ảnh Scan</option>
            </select>
          </div>
        </div>

        {/* Date Range Selector: Từ ngày - Đến ngày */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>Khoảng Ngày Tải Lên / Phát Sinh:</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-400">Từ:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-800 outline-none cursor-pointer"
              />
            </div>

            <span className="text-slate-400">→</span>

            <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-400">Đến:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-800 outline-none cursor-pointer"
              />
            </div>

            {(fromDate || toDate) && (
              <button
                onClick={() => { setFromDate(''); setToDate(''); }}
                className="text-[11px] text-red-600 hover:underline font-medium ml-1"
              >
                Xóa ngày
              </button>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2 text-slate-500 text-[11px]">
            <span>Hiển thị: <strong>{filteredDocuments.length}</strong> tệp tin</span>
            <span>•</span>
            <span>Quy chuẩn tên tải xuống: <code className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-mono">[Tên Công Ty]-[Tên File]-[Kỳ Kê Khai].[đuôi]</code></span>
          </div>
        </div>
      </div>

      {/* Selection Control Bar & Multi-Select Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2">
          {/* Main Dropdown Button for Multi-Selection */}
          <div className="relative" ref={selectionDropdownRef}>
            <button
              onClick={() => setIsSelectionDropdownOpen(!isSelectionDropdownOpen)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
            >
              <CheckSquare className="w-4 h-4 text-purple-600" />
              <span>Phương án chọn nhiều ({selectedDocIds.length}/{filteredDocuments.length})</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Dropdown Options */}
            {isSelectionDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in text-xs">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Lựa chọn theo phạm vi
                </div>
                <button
                  onClick={handleSelectAllFiltered}
                  className="w-full text-left px-3 py-2 hover:bg-purple-50 hover:text-purple-700 flex items-center justify-between transition-colors"
                >
                  <span className="font-semibold">🎯 Chọn tất cả theo bộ lọc</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold">{filteredDocuments.length}</span>
                </button>
                <button
                  onClick={handleSelectAllVault}
                  className="w-full text-left px-3 py-2 hover:bg-purple-50 hover:text-purple-700 flex items-center justify-between transition-colors"
                >
                  <span className="font-semibold">🌐 Chọn toàn bộ kho hồ sơ</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold">{documents.length}</span>
                </button>
                <button
                  onClick={handleInvertSelection}
                  className="w-full text-left px-3 py-2 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>🔄 Đảo ngược lựa chọn</span>
                </button>

                <div className="px-3 py-1.5 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-y border-slate-100">
                  Chọn nhanh theo định dạng
                </div>
                <button
                  onClick={() => handleSelectByFormat('XML')}
                  className="w-full text-left px-3 py-2 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 transition-colors"
                >
                  <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                  <span>🟢 Tất cả tệp XML (Tờ khai / Hóa đơn)</span>
                </button>
                <button
                  onClick={() => handleSelectByFormat('PDF')}
                  className="w-full text-left px-3 py-2 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-red-600" />
                  <span>🔴 Tất cả tệp PDF (Sao kê / Báo cáo)</span>
                </button>
                <button
                  onClick={() => handleSelectByFormat('EXCEL')}
                  className="w-full text-left px-3 py-2 hover:bg-green-50 hover:text-green-700 flex items-center gap-2 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
                  <span>📗 Tất cả tệp Excel / CSV (Bảng kê)</span>
                </button>

                <div className="px-3 py-1.5 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-y border-slate-100">
                  Chọn nhanh theo phân loại
                </div>
                <button
                  onClick={() => handleSelectByCategory('Tờ khai thuế')}
                  className="w-full text-left px-3 py-2 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 transition-colors"
                >
                  <span>🏛️ Tất cả Tờ khai thuế</span>
                </button>
                <button
                  onClick={() => handleSelectByCategory('Hóa đơn')}
                  className="w-full text-left px-3 py-2 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 transition-colors"
                >
                  <span>🧾 Tất cả Hóa đơn điện tử</span>
                </button>
                <button
                  onClick={() => handleSelectByCategory('Báo cáo tài chính')}
                  className="w-full text-left px-3 py-2 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 transition-colors"
                >
                  <span>📊 Tất cả Báo cáo tài chính</span>
                </button>
                <button
                  onClick={handleSelectWithIssues}
                  className="w-full text-left px-3 py-2 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>⚠️ Tệp có cảnh báo rủi ro / Cần xác nhận</span>
                </button>

                {selectedDocIds.length > 0 && (
                  <div className="pt-1 mt-1 border-t border-slate-100">
                    <button
                      onClick={handleDeselectAll}
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>❌ Bỏ chọn tất cả</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick select buttons */}
          <button
            onClick={toggleSelectAll}
            className={`text-xs px-2.5 py-1.5 rounded-xl font-semibold border transition-colors ${
              selectedDocIds.length === filteredDocuments.length && filteredDocuments.length > 0
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {selectedDocIds.length === filteredDocuments.length && filteredDocuments.length > 0
              ? '✓ Bỏ chọn lọc'
              : 'Chọn tất cả lọc'}
          </button>

          <button
            onClick={() => handleSelectByFormat('XML')}
            className="text-xs px-2.5 py-1.5 rounded-xl font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
          >
            🟢 Chọn XML
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {selectedDocIds.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200">
                Đang chọn: {selectedDocIds.length} tệp
              </span>
              <button
                onClick={handleDeselectAll}
                className="text-slate-500 hover:text-red-600 underline font-medium"
              >
                Bỏ chọn
              </button>
            </div>
          ) : (
            <span className="text-slate-400 italic">Chưa chọn tệp tin nào</span>
          )}
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedDocIds.length > 0 && (
        <div className="sticky top-4 z-40 bg-slate-900 text-white p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 px-6 shadow-2xl border border-slate-800 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-yellow-400 font-extrabold text-sm">
              {selectedDocIds.length}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Đã chọn {selectedDocIds.length} tệp tin</span>
                <span className="text-slate-400 font-normal">({((selectedDocIds.length / documents.length) * 100).toFixed(0)}% kho)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Sẵn sàng nén ZIP chuẩn tên không dấu hoặc chỉnh sửa/xóa hàng loạt
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Download as ZIP */}
            <button
              onClick={handleBulkDownloadZip}
              disabled={isZipping}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
              title="Tạo file ZIP nén toàn bộ tài liệu đã chọn với chuẩn tên [DoanhNghiep]-[TenFile]-[KyKeKhai].[ext]"
            >
              {isZipping ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang Nén File ZIP ({selectedDocIds.length} tệp)...</span>
                </>
              ) : (
                <>
                  <FileArchive className="w-4 h-4" />
                  <span>Tải Xuống File ZIP (.zip)</span>
                </>
              )}
            </button>

            {/* Bulk Edit Button */}
            <button
              onClick={handleOpenBulkEdit}
              className="bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="Sửa kỳ kê khai, phân loại hoặc chuyển doanh nghiệp cho các file đã chọn"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-400" />
              <span>Sửa Hàng Loạt</span>
            </button>

            {/* Bulk Delete Button */}
            <button
              onClick={() => setIsBulkDeleteOpen(true)}
              className="bg-red-950/60 hover:bg-red-800 text-red-200 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-red-800/60 transition-colors"
              title="Xóa các tệp đã chọn khỏi kho lưu trữ"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Xóa ({selectedDocIds.length})</span>
            </button>

            <button
              onClick={handleDeselectAll}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              title="Bỏ chọn tất cả"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* View Mode 1: Grid Cards */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(doc => {
            const isSelected = selectedDocIds.includes(doc.id);
            const downloadPreviewName = formatDownloadFileName(doc.companyName, doc.fileName || doc.name, doc.period);

            return (
              <div 
                key={doc.id} 
                className={`bg-white border rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all space-y-3 relative ${
                  isSelected ? 'border-purple-500 ring-2 ring-purple-100' : 'border-slate-200/80 hover:border-purple-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectDoc(doc.id)}
                      className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer w-4 h-4 mt-0.5"
                    />
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      {getFileIcon(doc.fileName || doc.name, doc.category)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {getFormatBadge(doc.fileName || doc.name)}
                    <span className="text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded">
                      v{doc.currentVersion}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2" title={doc.name}>
                    {doc.name}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-600 mt-1 flex items-center gap-1 truncate">
                    <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{doc.companyName}</span>
                  </p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-600 space-y-1 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phân loại:</span>
                    <strong className="text-purple-700">{doc.category}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kỳ kê khai:</span>
                    <strong className="text-slate-800">{doc.period}</strong>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>{doc.uploadedBy}</span>
                    <span>{new Date(doc.uploadedAt).toLocaleDateString('vi-VN')} • {doc.fileSize}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => setSelectedDocForVersion(doc)}
                    className="text-purple-600 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>{doc.versions.length} phiên bản</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {onDeleteDocument && (
                      <button
                        onClick={() => handleDeleteDoc(doc)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Xóa tài liệu"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDownload(doc)}
                      className="flex items-center gap-1 bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 border border-purple-200 text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
                      title={`Tải xuống: ${downloadPreviewName}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải xuống</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Mode 2: Detailed Table */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedDocIds.length === filteredDocuments.length && filteredDocuments.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-3">Tên Tệp Tin / Chứng Từ</th>
                  <th className="p-3">Doanh Nghiệp</th>
                  <th className="p-3">Kỳ Kê Khai</th>
                  <th className="p-3">Phân Loại</th>
                  <th className="p-3">Định Dạng</th>
                  <th className="p-3">Phiên Bản</th>
                  <th className="p-3">Người Tải Lên</th>
                  <th className="p-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocuments.map(doc => {
                  const isSelected = selectedDocIds.includes(doc.id);
                  return (
                    <tr key={doc.id} className={`hover:bg-purple-50/30 transition-colors ${isSelected ? 'bg-purple-50/50' : ''}`}>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectDoc(doc.id)}
                          className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          {getFileIcon(doc.fileName || doc.name, doc.category)}
                          <span title={doc.name}>{doc.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-700 font-medium">{doc.companyName}</td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {doc.period}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-purple-700">{doc.category}</td>
                      <td className="p-3">{getFormatBadge(doc.fileName || doc.name)}</td>
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedDocForVersion(doc)}
                          className="text-[11px] font-bold text-purple-600 hover:underline"
                        >
                          v{doc.currentVersion} ({doc.versions.length})
                        </button>
                      </td>
                      <td className="p-3 text-slate-500 text-[11px]">
                        {doc.uploadedBy}
                        <span className="block text-[10px] text-slate-400">{new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}</span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onDeleteDocument && (
                            <button
                              onClick={() => handleDeleteDoc(doc)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa tài liệu"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDownload(doc)}
                            className="inline-flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            <span>Tải về</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <FolderArchive className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-sm text-slate-800">Không tìm thấy tài liệu phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Vui lòng thay đổi tiêu chí lọc theo Kỳ kê khai (Tháng/Quý/Năm), Khoảng ngày hoặc bấm nút Đặt lại bộ lọc.
          </p>
          <button
            onClick={handleResetFilters}
            className="bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold px-4 py-2 rounded-xl"
          >
            Xóa Toàn Bộ Bộ Lọc
          </button>
        </div>
      )}

      {/* Version History Drawer / Modal */}
      {selectedDocForVersion && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedDocForVersion(null); }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl p-6 space-y-4 max-h-[85vh] overflow-y-auto cursor-default"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-600" />
                  <span>Lịch Sử Phiên Bản: {selectedDocForVersion.name}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{selectedDocForVersion.companyName} • {selectedDocForVersion.period}</p>
              </div>
              <button 
                onClick={() => setSelectedDocForVersion(null)} 
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {selectedDocForVersion.versions.map(v => (
                <div key={v.version} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[11px]">
                        Phiên bản v{v.version}
                      </span>
                      <strong className="text-slate-800">{v.fileName}</strong>
                    </div>
                    <span className="text-purple-600 font-semibold">{v.fileSize}</span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Tải lên bởi <strong>{v.uploadedBy}</strong> vào {new Date(v.uploadedAt).toLocaleString('vi-VN')}
                  </p>

                  {v.notes && (
                    <p className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-100 italic">
                      Ghi chú: {v.notes}
                    </p>
                  )}

                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => handleDownload(selectedDocForVersion, v)}
                      className="flex items-center gap-1 text-purple-600 hover:text-purple-800 font-semibold text-[11px]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải phiên bản này (Định dạng chuẩn)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Upload & Classification Modal */}
      {isUploadOpen && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setIsUploadOpen(false); }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto cursor-default"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-purple-600" />
                  <span>Tải Lên Chứng Từ / Hồ Sơ & Định Danh Thuế</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hỗ trợ file XML (HTKK/eTax & Hóa đơn CQT), Excel, PDF, Word. Cho phép chọn trực tiếp loại chứng từ.
                </p>
              </div>
              <button 
                onClick={() => setIsUploadOpen(false)} 
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            {/* Dropzone with Real File Input */}
            <div className="border-2 border-dashed border-purple-300 bg-purple-50/40 hover:bg-purple-50/70 rounded-2xl p-6 text-center space-y-2 cursor-pointer relative transition-colors">
              <Upload className="w-9 h-9 text-purple-600 mx-auto" />
              <p className="text-xs font-bold text-slate-800">
                {uploadFileName ? `Đã chọn: ${uploadFileName} (${uploadFileSize})` : 'Nhấp để chọn tệp tin hoặc Kéo thả vào đây'}
              </p>
              <p className="text-[11px] text-slate-500">
                Chấp nhận: <strong>.xml</strong> (Tờ khai HTKK/eTax, Hóa đơn điện tử), <strong>.pdf</strong>, <strong>.xlsx</strong>, <strong>.docx</strong>, <strong>.csv</strong>, <strong>.png</strong>, <strong>.jpg</strong>
              </p>
              <input 
                type="file" 
                accept=".xml,.pdf,.xlsx,.xls,.docx,.doc,.csv,.png,.jpg,.jpeg,.zip"
                onChange={handleFileChange} 
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
            </div>

            {/* AI Classification Notification */}
            {isClassifying && (
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-center text-xs text-purple-700 font-medium flex items-center justify-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
                <span>AI đang phân tích tiêu đề, quy chuẩn XML và gợi ý Doanh nghiệp / Kỳ thuế...</span>
              </div>
            )}

            {aiClassification && (
              <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>AI Gợi Ý Tự Động (Độ tin cậy: {aiClassification.confidenceScore}%)</span>
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                    Tự động nhận diện
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  {aiClassification.reason}
                </p>
              </div>
            )}

            {/* Manual Selection Form */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                1. Thông Tin Định Danh & Phân Loại File:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Select Company */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Doanh nghiệp sở hữu <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedUploadCompanyId}
                    onChange={(e) => setSelectedUploadCompanyId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name} (MST: {c.taxCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Category */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Loại Chứng Từ / Hồ Sơ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedUploadCategory}
                    onChange={(e) => setSelectedUploadCategory(e.target.value as DocumentCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-purple-800 outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Select Tax Period */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Kỳ Kê Khai Thuế <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedUploadPeriod}
                    onChange={(e) => setSelectedUploadPeriod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <optgroup label="Kỳ Kê Khai Theo Tháng">
                      <option value="Tháng 01/2026">Tháng 01/2026</option>
                      <option value="Tháng 02/2026">Tháng 02/2026</option>
                      <option value="Tháng 03/2026">Tháng 03/2026</option>
                      <option value="Tháng 04/2026">Tháng 04/2026</option>
                      <option value="Tháng 05/2026">Tháng 05/2026</option>
                      <option value="Tháng 06/2026">Tháng 06/2026</option>
                      <option value="Tháng 07/2026">Tháng 07/2026</option>
                      <option value="Tháng 08/2026">Tháng 08/2026</option>
                      <option value="Tháng 09/2026">Tháng 09/2026</option>
                      <option value="Tháng 10/2026">Tháng 10/2026</option>
                      <option value="Tháng 11/2026">Tháng 11/2026</option>
                      <option value="Tháng 12/2026">Tháng 12/2026</option>
                    </optgroup>
                    <optgroup label="Kỳ Kê Khai Theo Quý">
                      <option value="Quý I/2026">Quý I/2026</option>
                      <option value="Quý II/2026">Quý II/2026</option>
                      <option value="Quý III/2026">Quý III/2026</option>
                      <option value="Quý IV/2026">Quý IV/2026</option>
                    </optgroup>
                    <optgroup label="Kỳ Kê Khai Theo Năm">
                      <option value="Năm 2026">Năm 2026 (BCTC & Quyết toán)</option>
                      <option value="Năm 2025">Năm 2025</option>
                    </optgroup>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Ghi chú tệp tin
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Bản chính thức nộp qua cổng Thuế điện tử"
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Download Naming Preview */}
              {uploadFileName && (
                <div className="bg-slate-100 p-3 rounded-xl text-xs space-y-1 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-semibold uppercase">
                    Tên file khi tải xuống hệ thống sẽ tự động xuất:
                  </span>
                  <div className="font-mono text-purple-700 font-bold text-[11px] truncate">
                    {formatDownloadFileName(
                      companies.find(c => c.id === selectedUploadCompanyId)?.name || 'DoanhNghiep',
                      uploadFileName,
                      selectedUploadPeriod
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button 
                onClick={() => setIsUploadOpen(false)} 
                className="px-4 py-2.5 rounded-xl bg-slate-100 font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmUpload}
                disabled={!uploadFileName}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50 transition-colors shadow-xs"
              >
                Xác Nhận & Lưu Vào Kho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {isBulkEditOpen && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setIsBulkEditOpen(false); }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 cursor-pointer animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                  <span>Chỉnh Sửa Hàng Loạt ({selectedDocIds.length} tệp)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cập nhật đồng thời Kỳ kê khai, Phân loại hoặc Doanh nghiệp cho các tệp đã chọn.
                </p>
              </div>
              <button 
                onClick={() => setIsBulkEditOpen(false)} 
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Selected items summary */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-28 overflow-y-auto space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Danh sách tệp tin áp dụng ({selectedDocIds.length}):
                </span>
                {documents.filter(d => selectedDocIds.includes(d.id)).map(d => (
                  <div key={d.id} className="text-[11px] text-slate-700 flex items-center justify-between truncate">
                    <span className="truncate font-medium">{d.fileName || d.name}</span>
                    <span className="text-slate-400 text-[10px] ml-2 shrink-0">{d.companyCode} • {d.period}</span>
                  </div>
                ))}
              </div>

              {/* 1. Change Tax Period */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Đổi Kỳ Kê Khai Thuế:
                </label>
                <select
                  value={bulkEditPeriod}
                  onChange={(e) => setBulkEditPeriod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="KEEP_ORIGINAL">-- Giữ nguyên kỳ kê khai của từng file --</option>
                  <optgroup label="Kỳ Kê Khai Theo Tháng">
                    <option value="Tháng 01/2026">Tháng 01/2026</option>
                    <option value="Tháng 02/2026">Tháng 02/2026</option>
                    <option value="Tháng 03/2026">Tháng 03/2026</option>
                    <option value="Tháng 04/2026">Tháng 04/2026</option>
                    <option value="Tháng 05/2026">Tháng 05/2026</option>
                    <option value="Tháng 06/2026">Tháng 06/2026</option>
                    <option value="Tháng 07/2026">Tháng 07/2026</option>
                    <option value="Tháng 08/2026">Tháng 08/2026</option>
                    <option value="Tháng 09/2026">Tháng 09/2026</option>
                    <option value="Tháng 10/2026">Tháng 10/2026</option>
                    <option value="Tháng 11/2026">Tháng 11/2026</option>
                    <option value="Tháng 12/2026">Tháng 12/2026</option>
                  </optgroup>
                  <optgroup label="Kỳ Kê Khai Theo Quý">
                    <option value="Quý I/2026">Quý I/2026</option>
                    <option value="Quý II/2026">Quý II/2026</option>
                    <option value="Quý III/2026">Quý III/2026</option>
                    <option value="Quý IV/2026">Quý IV/2026</option>
                  </optgroup>
                  <optgroup label="Kỳ Kê Khai Theo Năm">
                    <option value="Năm 2026">Năm 2026 (BCTC & Quyết toán)</option>
                    <option value="Năm 2025">Năm 2025</option>
                  </optgroup>
                </select>
              </div>

              {/* 2. Change Category */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Đổi Phân Loại Chứng Từ:
                </label>
                <select
                  value={bulkEditCategory}
                  onChange={(e) => setBulkEditCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="KEEP_ORIGINAL">-- Giữ nguyên phân loại của từng file --</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* 3. Reassign Company */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Chuyển Sang Doanh Nghiệp Khác:
                </label>
                <select
                  value={bulkEditCompanyId}
                  onChange={(e) => setBulkEditCompanyId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="KEEP_ORIGINAL">-- Giữ nguyên doanh nghiệp sở hữu --</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name} (MST: {c.taxCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button 
                onClick={() => setIsBulkEditOpen(false)} 
                className="px-4 py-2.5 rounded-xl bg-slate-100 font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleExecuteBulkEdit}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-xs"
              >
                Áp Dụng Thay Đổi ({selectedDocIds.length} tệp)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {isBulkDeleteOpen && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setIsBulkDeleteOpen(false); }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 cursor-pointer animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-red-200 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 cursor-default"
          >
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Xác Nhận Xóa Hàng Loạt
                </h3>
                <p className="text-xs text-slate-500">
                  Thao tác này không thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="bg-red-50/70 border border-red-200 rounded-xl p-3.5 text-xs text-red-900 space-y-2">
              <p className="font-semibold">
                Bạn đang chuẩn bị xóa vĩnh viễn <strong className="text-red-700 underline">{selectedDocIds.length}</strong> tệp tài liệu khỏi kho lưu trữ chứng từ.
              </p>
              <div className="max-h-36 overflow-y-auto space-y-1 bg-white p-2.5 rounded-lg border border-red-100 text-[11px] text-slate-700">
                {documents.filter(d => selectedDocIds.includes(d.id)).map(d => (
                  <div key={d.id} className="truncate flex items-center gap-1.5">
                    <span className="text-red-500">•</span>
                    <span className="truncate">{d.fileName || d.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 text-xs pt-2 border-t border-slate-100">
              <button 
                onClick={() => setIsBulkDeleteOpen(false)} 
                className="px-4 py-2.5 rounded-xl bg-slate-100 font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleExecuteBulkDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác Nhận Xóa ({selectedDocIds.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
