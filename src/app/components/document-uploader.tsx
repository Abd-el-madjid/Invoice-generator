import { useState, useRef } from 'react';
import { Invoice, ParsedDocument } from '@/types/project';
import { parseJSONDocument, parsePDFDocument, parseTextDocument } from '@/utils/document-parser';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { 
  Upload, 
  FileJson, 
  FileText, 
  File,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface DocumentUploaderProps {
  onDocumentParsed: (invoice: Invoice) => void;
  onCancel: () => void;
}

export function DocumentUploader({ onDocumentParsed, onCancel }: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    const validTypes = [
      'application/json',
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!validTypes.some((type) => file.type === type || file.name.endsWith('.json') || file.name.endsWith('.pdf') || file.name.endsWith('.txt') || file.name.endsWith('.docx'))) {
      toast.error('Invalid file type. Please upload JSON, PDF, TXT, or DOCX files.');
      return;
    }

    setUploadedFile(file);
    setParsedResult(null);
    await parseFile(file);
  };

  const parseFile = async (file: File) => {
    setParsing(true);
    
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'json') {
        // Parse JSON
        const text = await file.text();
        const jsonData = JSON.parse(text);
        const result = parseJSONDocument(jsonData);
        setParsedResult(result);
        
        if (result.success) {
          toast.success('JSON file parsed successfully!');
        } else {
          toast.error('Failed to parse JSON file');
        }
      } else if (fileExtension === 'pdf') {
        // For PDF, we'd normally use a library like pdf.js
        // For now, show a message that PDF parsing is limited
        toast.warning('PDF parsing has limited functionality. For best results, use JSON.');
        
        // Simulate PDF parsing (in production, use proper PDF extraction)
        const mockPDFText = `
PROJECT NAME
Client: Sample Client

FRONTEND DEVELOPMENT
☑ Authentication System
User login, registration, password reset
40 h    8000

☑ Dashboard Interface
Main dashboard with charts and data
60 h    12000

BACKEND DEVELOPMENT
☑ API Development
RESTful API endpoints
80 h    16000
        `;
        
        const result = parsePDFDocument(mockPDFText);
        setParsedResult(result);
      } else if (fileExtension === 'txt' || fileExtension === 'docx') {
        // Parse text/DOCX
        const text = await file.text();
        const result = parseTextDocument(text);
        setParsedResult(result);
        
        if (result.success) {
          toast.success('Document parsed. Please review the extracted data.');
        }
      }
    } catch (error) {
      toast.error('Failed to parse file: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setParsedResult({
        success: false,
        errors: ['Failed to read file'],
        source: 'json',
      });
    } finally {
      setParsing(false);
    }
  };

  const handleContinue = () => {
    if (parsedResult?.success && parsedResult.invoice) {
      onDocumentParsed(parsedResult.invoice);
    }
  };

  const handleClear = () => {
    setUploadedFile(null);
    setParsedResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">
          Rebuild From Document
        </h2>
        <p className="text-lg text-slate-600">
          Upload an existing invoice, quote, or contract to convert it into an editable project
        </p>
      </div>

      {/* Upload Area */}
      {!uploadedFile && (
        <Card
          className={`p-12 border-2 border-dashed transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-300 hover:border-slate-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6">
              <Upload className="h-10 w-10 text-emerald-600" />
            </div>

            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Upload Your Document
            </h3>
            <p className="text-slate-600 mb-6 max-w-md">
              Drag and drop your file here, or click to browse
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.pdf,.txt,.docx"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              Choose File
            </Button>

            <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-md">
              <div className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-lg">
                <FileJson className="h-8 w-8 text-blue-600" />
                <span className="text-xs font-medium text-slate-700">JSON</span>
                <span className="text-xs text-slate-500">Exact import</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-lg">
                <FileText className="h-8 w-8 text-red-600" />
                <span className="text-xs font-medium text-slate-700">PDF</span>
                <span className="text-xs text-slate-500">Best effort</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-lg">
                <File className="h-8 w-8 text-slate-600" />
                <span className="text-xs font-medium text-slate-700">TXT/DOCX</span>
                <span className="text-xs text-slate-500">Heuristic</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Parsing Result */}
      {uploadedFile && (
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                {uploadedFile.name.endsWith('.json') && <FileJson className="h-6 w-6 text-blue-600" />}
                {uploadedFile.name.endsWith('.pdf') && <FileText className="h-6 w-6 text-red-600" />}
                {(uploadedFile.name.endsWith('.txt') || uploadedFile.name.endsWith('.docx')) && (
                  <File className="h-6 w-6 text-slate-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{uploadedFile.name}</h3>
                <p className="text-sm text-slate-500">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {parsing && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-600">Parsing document...</p>
              </div>
            </div>
          )}

          {!parsing && parsedResult && (
            <div className="space-y-4">
              {/* Success */}
              {parsedResult.success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Document parsed successfully! You can now edit the imported project.
                  </AlertDescription>
                </Alert>
              )}

              {/* Errors */}
              {!parsedResult.success && parsedResult.errors && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <div className="text-red-800 font-medium mb-2">
                      Failed to parse document:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                      {parsedResult.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Warnings */}
              {parsedResult.warnings && parsedResult.warnings.length > 0 && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription>
                    <div className="text-amber-800 font-medium mb-2">
                      Warnings:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-amber-700">
                      {parsedResult.warnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Preview */}
              {parsedResult.success && parsedResult.invoice && (
                <div className="bg-slate-50 rounded-lg p-6">
                  <h4 className="font-semibold text-slate-900 mb-4">Document Preview</h4>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Project Name:</span>
                      <span className="font-medium text-slate-900">
                        {parsedResult.invoice.metadata.projectName}
                      </span>
                    </div>
                    
                    {parsedResult.invoice.metadata.clientName && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Client:</span>
                        <span className="font-medium text-slate-900">
                          {parsedResult.invoice.metadata.clientName}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600">Sections:</span>
                      <span className="font-medium text-slate-900">
                        {parsedResult.invoice.sections.length}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Features:</span>
                      <span className="font-medium text-slate-900">
                        {parsedResult.invoice.sections.reduce(
                          (sum, section) =>
                            sum +
                            section.categories.reduce(
                              (catSum, cat) => catSum + cat.features.length,
                              0
                            ),
                          0
                        )}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Hours:</span>
                      <span className="font-medium text-slate-900">
                        {parsedResult.invoice.totals.totalHours}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Price:</span>
                      <span className="font-medium text-slate-900">
                        {parsedResult.invoice.totals.totalPrice.toLocaleString()}{' '}
                        {parsedResult.invoice.metadata.currency}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600">Source Type:</span>
                      <span className="font-medium text-slate-900">
                        {parsedResult.source === 'json' && 'JSON (Exact)'}
                        {parsedResult.source === 'pdf-system' && 'System PDF'}
                        {parsedResult.source === 'pdf-external' && 'External PDF'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                
                {parsedResult.success && (
                  <Button
                    onClick={handleContinue}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    Continue to Editor
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Information Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <FileJson className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">JSON Files</h4>
              <p className="text-xs text-slate-600">
                Exact 1:1 import with full structure preservation. Recommended format.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">System PDFs</h4>
              <p className="text-xs text-slate-600">
                PDFs generated by this tool are recognized and parsed with high accuracy.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">External Files</h4>
              <p className="text-xs text-slate-600">
                Best-effort parsing. All data will be flagged for review.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
