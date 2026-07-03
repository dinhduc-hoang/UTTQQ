import React, { useEffect, useRef, useState } from 'react';
import UploadShapeIcon from '../../assets/icons/Combo shape.svg';
import PdfIcon from '../../assets/icons/fas1.svg';
import DeleteIcon from '../../assets/icons/trash01.svg';
import { getStoredAuth } from '../../services/authService';
import { uploadDocument } from '../../services/documentsService';

function formatFileSize(bytes) {
    if (!bytes || bytes <= 0) return '0 KB';
    const kilobytes = bytes / 1024;
    if (kilobytes < 1) return '1 KB';
    return `${Math.round(kilobytes)} KB`;
}

function buildAttachment(file) {
    return {
        id: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        sizeLabel: formatFileSize(file.size),
        rawFile: file,
    };
}

function stripPdfExtension(filename) {
    return filename?.replace(/\.pdf$/i, '') || '';
}

function buildExerciseTitle(baseTitle, filename, isMultiple) {
    const normalizedBase = baseTitle.trim();
    if (!isMultiple) return normalizedBase;

    const fallbackName = stripPdfExtension(filename);
    if (!normalizedBase) return fallbackName;
    if (!fallbackName) return normalizedBase;
    return `${normalizedBase} - ${fallbackName}`;
}

function getUploadedDocumentId(payload) {
    const source = payload?.document ?? payload?.item ?? payload?.data ?? payload;
    return source?.id ?? source?._id ?? source?.documentId;
}

function isUploadedDocumentFailed(payload) {
    const source = payload?.document ?? payload?.item ?? payload?.data ?? payload;
    return String(source?.status || '').toLowerCase() === 'failed';
}

function AttachmentRow({ attachment, onRemove }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-[14px] bg-[#EDEAFE] px-5 py-3.5">
            <div className="flex min-w-0 items-center gap-3.5">
                <img src={PdfIcon} alt="" aria-hidden="true" className="h-10 w-10 shrink-0" />
                <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold leading-5 text-[#6A5AE0]">
                        {attachment.name}
                    </p>
                    <p className="mt-0.5 text-[13px] font-normal leading-5 text-[#858494]">
                        {attachment.sizeLabel}
                    </p>
                </div>
            </div>
            <button
                type="button"
                aria-label={`Xóa ${attachment.name}`}
                onClick={() => onRemove(attachment.id)}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-[#EB3838] transition-transform duration-200 hover:scale-105"
            >
                <img src={DeleteIcon} alt="" aria-hidden="true" className="h-5 w-5 shrink-0" />
            </button>
        </div>
    );
}

export default function AddExercise({ open, onClose, onSuccess }) {
    const fileInputRef = useRef(null);
    const [exerciseName, setExerciseName] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const toastTimerRef = useRef(null);
    const successTimerRef = useRef(null);

    useEffect(() => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        if (successTimerRef.current) clearTimeout(successTimerRef.current);
        return () => {
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            if (successTimerRef.current) clearTimeout(successTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (open) {
            setExerciseName('');
            setAttachments([]);
            setToast(null);
            if (successTimerRef.current) {
                clearTimeout(successTimerRef.current);
                successTimerRef.current = null;
            }
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;

        const previousOverflow = document.body.style.overflow;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onClose]);

    const showToast = (message, type = 'error') => {
        setToast({ message, type });
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToast(null), 3000);
    };

    if (!open) return null;

    const openFilePicker = () => fileInputRef.current?.click();

    const handleFiles = (fileList) => {
        const pdfFiles = Array.from(fileList ?? []).filter(
            (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
        );
        if (pdfFiles.length === 0) return;
        setAttachments((prev) => [...prev, ...pdfFiles.map((f) => buildAttachment(f))]);
    };

    const handleFileChange = (e) => {
        handleFiles(e.target.files);
        e.target.value = '';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    const handleRemoveAttachment = (attachmentId) => {
        setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        const storedAuth = getStoredAuth();
        const token = storedAuth?.accessToken || window.localStorage.getItem('access_token');
        if (!token) {
            showToast('Vui lòng đăng nhập!');
            return;
        }

        if (!exerciseName.trim()) {
            showToast('Vui lòng nhập tên bài tập.');
            return;
        }

        if (attachments.length === 0) {
            showToast('Vui lòng chọn ít nhất một file PDF.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Upload each file separately with title
            const isMultiple = attachments.length > 1;
            const uploadedDocuments = [];
            for (const attachment of attachments) {
                const uploadedDocument = await uploadDocument({
                    file: attachment.rawFile,
                    title: exerciseName.trim(),
                    token,
                });
                uploadedDocuments.push(uploadedDocument);
            }

            if (uploadedDocuments.some(isUploadedDocumentFailed)) {
                throw new Error('Không đọc được nội dung PDF. Vui lòng chọn file PDF có thể trích xuất văn bản.');
            }

            const newExercises = attachments.map((attachment, index) => ({
                id: crypto.randomUUID(),
                documentId: getUploadedDocumentId(uploadedDocuments[index]),
                title: buildExerciseTitle(exerciseName, attachment.name, isMultiple),
                latestAttemptedAt: 'Hôm nay',
                progress: 0,
            }));

            if (newExercises.some((exercise) => !exercise.documentId)) {
                throw new Error('Backend chưa trả mã tài liệu sau khi upload PDF.');
            }

            showToast('Tải lên thành công!', 'success');
            successTimerRef.current = setTimeout(() => {
                onSuccess?.({ exercises: newExercises });
                onClose?.();
            }, 2000);
        } catch (error) {
            const message = error?.message || 'Lỗi hệ thống';
            showToast(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 z-80 flex items-center justify-center bg-[rgba(255,255,255,0.72)] px-4 py-6 backdrop-blur-sm"
                onMouseDown={() => onClose?.()}
                role="presentation"
            >
                <div
                    className="w-full max-w-[456px] overflow-hidden rounded-[20px] bg-white px-5 pb-5 pt-5 shadow-[0_24px_80px_rgba(17,24,39,0.12)]"
                    onMouseDown={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="add-exercise-title"
                >
                    <div className="flex items-center justify-between">
                        <h2
                            id="add-exercise-title"
                            className="text-[20px] font-semibold leading-[30px] text-[#16151c]"
                        >
                            Thêm bài tập
                        </h2>
                        <button
                            type="button"
                            onClick={() => onClose?.()}
                            aria-label="Đóng"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#8b8b99] transition-colors hover:bg-[#f4f1ff] hover:text-[#6A5AE0]"
                        >
                            ×
                        </button>
                    </div>

                    <div className="mt-5 h-px w-full bg-[#F3F4F6]" />

                    <div className="mx-auto mt-8 flex w-full max-w-[392px] flex-col gap-2.5">
                        <input
                            type="text"
                            aria-label="Tên bài tập"
                            placeholder="Tên bài tập"
                            value={exerciseName}
                            onChange={(e) => setExerciseName(e.target.value)}
                            className="h-14 w-full rounded-2xl bg-[#FAFAFA] px-5 text-[14px] font-light leading-[1.4] tracking-[0.2px] text-[#16151c] outline-none placeholder:text-[#9E9E9E] focus:ring-1 focus:ring-[#6A5AE0]/15"
                        />

                        {attachments.length === 0 ? (
                            <button
                                type="button"
                                onClick={openFilePicker}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[rgba(106,90,224,0.42)] bg-white transition-colors hover:bg-[#FBFAFF]"
                            >
                                <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#6A5AE0] shadow-[0_8px_20px_rgba(106,90,224,0.22)]">
                                    <img src={UploadShapeIcon} alt="" aria-hidden="true" className="h-[18px] w-[15px] shrink-0" />
                                </span>
                                <p className="mt-5 text-[14px] leading-5 text-[#212121]">
                                    Kéo thả hoặc <span className="text-[#6A5AE0]">chọn file</span> để tải lên
                                </p>
                                <p className="mt-1 text-[12px] leading-5 text-[#A2A1A8]">
                                    Hỗ trợ formats : pdf
                                </p>
                            </button>
                        ) : (
                            <div className="flex flex-col gap-2.5">
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={openFilePicker}
                                        className="cursor-pointer text-[14px] font-semibold leading-5 text-[#6A5AE0] transition-opacity hover:opacity-80"
                                    >
                                        Thêm pdf
                                    </button>
                                </div>
                                <div className="thin-scrollbar flex max-h-[230px] flex-col gap-2.5 overflow-y-auto">
                                    {attachments.map((attachment) => (
                                        <AttachmentRow
                                            key={attachment.id}
                                            attachment={attachment}
                                            onRemove={handleRemoveAttachment}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,application/pdf"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    <div className="mx-auto mt-8 flex w-full max-w-[342px] items-center justify-between gap-2.5">
                        <button
                            type="button"
                            onClick={() => onClose?.()}
                            className="flex h-[50px] w-[166px] cursor-pointer items-center justify-center rounded-full border border-[rgba(162,161,168,0.2)] bg-white text-[16px] leading-none text-[#16151c] transition-colors hover:bg-[#fafafa]"
                        >
                            Hủy
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex h-[50px] w-[166px] cursor-pointer items-center justify-center gap-2 rounded-full bg-[#6A5AE0] text-[16px] leading-none text-white transition-colors hover:bg-[#5B4ED0] disabled:cursor-not-allowed disabled:opacity-70 shadow-[4px_8px_24px_0_rgba(77,93,250,0.25)]"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Đang tải...
                                </span>
                            ) : (
                                'Tải lên'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {toast ? (
                <div
                    className={`fixed right-6 top-6 z-[90] rounded-xl px-4 py-3 text-[13px] font-medium shadow-[0_12px_30px_rgba(15,18,32,0.18)] ${toast.type === 'success' ? 'bg-[#ecfdf5] text-[#067647]' : 'bg-[#fef2f2] text-[#b42318]'}`}
                    role="status"
                >
                    {toast.message}
                </div>
            ) : null}
        </>
    );
}
