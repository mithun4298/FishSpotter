import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudUpload, FileImage, X, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileUpload?: (file: File) => void;
  onBatchUpload?: (files: File[]) => void;
  isLoading?: boolean;
  accept?: string;
  maxSize?: number;
  className?: string;
  multiple?: boolean;
  mode?: 'single' | 'batch';
}

export function FileUpload({ 
  onFileUpload, 
  onBatchUpload,
  isLoading = false, 
  accept = "image/*",
  maxSize = 10 * 1024 * 1024, // 10MB default
  className,
  multiple = false,
  mode = 'single'
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (mode === 'single' && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFiles([file]);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews([reader.result as string]);
      };
      reader.readAsDataURL(file);
      
      // Auto-upload for single mode
      if (onFileUpload) {
        onFileUpload(file);
      }
    } else if (mode === 'batch') {
      setSelectedFiles(acceptedFiles);
      
      // Create previews for all files
      const readers = acceptedFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(readers).then(setPreviews);
    }
  }, [mode, onFileUpload]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize,
    multiple: mode === 'batch',
    disabled: isLoading
  });

  const handleUpload = () => {
    if (mode === 'single' && selectedFiles.length > 0 && onFileUpload) {
      onFileUpload(selectedFiles[0]);
    } else if (mode === 'batch' && selectedFiles.length > 0 && onBatchUpload) {
      onBatchUpload(selectedFiles);
    }
  };

  const handleClear = () => {
    setSelectedFiles([]);
    setPreviews([]);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("w-full", className)}>
      {selectedFiles.length === 0 ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed border-cyan-400 rounded-2xl p-12 text-center cursor-pointer transition-all duration-200",
            "hover:border-cyan-300 hover:bg-white/5",
            isDragActive && "border-cyan-300 bg-white/10 scale-105",
            isLoading && "pointer-events-none opacity-50"
          )}
        >
          <input {...getInputProps()} />
          <div className="group">
            <CloudUpload className="w-12 h-12 text-cyan-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {mode === 'batch' ? 'Upload Fish Images' : 'Upload Fish Image'}
            </h3>
            <p className="text-blue-200 mb-4">
              {isDragActive 
                ? "Drop the images here..." 
                : mode === 'batch' 
                ? "Drag and drop or click to select multiple images"
                : "Drag and drop or click to select image"
              }
            </p>
            <p className="text-blue-300 text-sm">
              Supports JPEG, PNG, WebP (Max {formatFileSize(maxSize)} each)
              {mode === 'batch' && <><br />Up to 10 images at once</>}
            </p>
          </div>
        </div>
      ) : (
        <Card className="glass-morphism border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {mode === 'batch' ? `Selected ${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''}` : 'Selected Image'}
              </h3>
              <div className="flex space-x-2">
                {mode === 'batch' && selectedFiles.length > 0 && !isLoading && (
                  <Button
                    onClick={handleUpload}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Process All
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {mode === 'single' ? (
              <div className="flex items-start space-x-4">
                {previews[0] && (
                  <img 
                    src={previews[0]} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-lg border border-white/20"
                  />
                )}
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileImage className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-medium truncate">{selectedFiles[0].name}</span>
                  </div>
                  <p className="text-blue-200 text-sm">
                    Size: {formatFileSize(selectedFiles[0].size)}
                  </p>
                  <p className="text-blue-300 text-xs mt-1">
                    {isLoading ? "Identifying fish..." : "Processing automatically..."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={preview} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-white/20"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 w-6 h-6 p-0 bg-red-500/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <div className="absolute bottom-1 left-1 right-1 bg-black/60 rounded px-2 py-1">
                        <p className="text-white text-xs truncate">{selectedFiles[index].name}</p>
                        <p className="text-gray-300 text-xs">{formatFileSize(selectedFiles[index].size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-blue-200 text-sm">
                    {selectedFiles.length} image{selectedFiles.length > 1 ? 's' : ''} ready for batch processing
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {fileRejections.length > 0 && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <h4 className="text-red-400 font-medium mb-2">Upload Errors:</h4>
          {fileRejections.map(({ file, errors }, index) => (
            <div key={index} className="text-red-300 text-sm">
              <span className="font-medium">{file.name}:</span>
              {errors.map((error, errorIndex) => (
                <div key={errorIndex} className="ml-2">
                  - {error.message}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
