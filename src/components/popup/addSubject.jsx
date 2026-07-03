import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubjects } from '../../contexts/SubjectsContext';

const DEFAULT_FORM = {
    subjectCode: '',
    title: '',
    description: '',
};

export default function AddSubjectModal({ onSuccess } = {}) {
    const navigate = useNavigate();
    const { addSubject } = useSubjects();

    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const toastTimerRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closeModal();
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    useEffect(() => () => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    }, []);

    const showToast = (message, type = 'error') => {
        setToast({ message, type });
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToast(null), 3000);
    };

    const closeModal = () => {
        setIsOpen(false);
        setFormData(DEFAULT_FORM);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((c) => ({ ...c, [name]: value }));
    };

    const handleSubmit = () => {
        if (isSubmitting) return;

        if (!formData.subjectCode.trim()) {
            showToast('Vui lòng nhập mã môn học.');
            return;
        }
        if (!formData.title.trim()) {
            showToast('Vui lòng nhập tên môn học.');
            return;
        }

        setIsSubmitting(true);

        const newSubject = addSubject({
            id: crypto.randomUUID(),
            subjectCode: formData.subjectCode.trim(),
            title: formData.title.trim(),
            description: formData.description.trim(),
            fileCount: 0,
            isNewSubject: true,
            source: 'local',
        });

        setIsSubmitting(false);
        closeModal();
        onSuccess?.();

        navigate(`/review/${newSubject.id}`, { state: { ...newSubject, isNewSubject: true } });
    };

    return (
        <div className="font-sans">
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex h-10 items-center gap-2 rounded-full bg-[#7152f3] px-4 text-[16px] font-medium leading-6 text-white shadow-[4px_8px_24px_0_rgba(77,93,250,0.25)] transition-colors hover:bg-[#5a44d0]"
            >
                <span>Thêm +</span>
            </button>

            {isOpen ? (
                <div
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(15,18,32,0.35)] px-4 py-6 backdrop-blur-sm"
                    onMouseDown={closeModal}
                    role="presentation"
                >
                    <div
                        className="w-full max-w-[460px] overflow-hidden rounded-[20px] bg-white px-6 pb-6 pt-5 shadow-[0_24px_80px_rgba(17,24,39,0.16)]"
                        onMouseDown={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="add-subject-title"
                    >
                        <div className="flex items-center justify-between">
                            <h2
                                id="add-subject-title"
                                className="text-[20px] font-semibold leading-[30px] text-[#16151c]"
                            >
                                Thêm môn học
                            </h2>
                            <button
                                type="button"
                                onClick={closeModal}
                                aria-label="Đóng"
                                className="flex h-8 w-8 items-center justify-center rounded-full text-[#8b8b99] transition-colors hover:bg-[#f4f1ff] hover:text-[#6A5AE0]"
                            >
                            </button>
                        </div>

                        <div className="mt-5 h-px w-full bg-[#F3F4F6]" />

                        <div className="mt-6 flex flex-col gap-4">
                            <div>
                                <label className="mb-2 block text-[13px] font-medium text-[#6c6c7b]">
                                    Mã môn học
                                </label>
                                <input
                                    type="text"
                                    name="subjectCode"
                                    value={formData.subjectCode}
                                    onChange={handleChange}
                                    placeholder="Nhập mã môn học"
                                    className="h-12 w-full rounded-xl border border-[#edeaf6] bg-[#fafafa] px-4 text-[14px] text-[#16151c] outline-none transition focus:border-[#6A5AE0] focus:ring-2 focus:ring-[#6A5AE0]/15"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-[13px] font-medium text-[#6c6c7b]">
                                    Tên môn học
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Nhập tên môn học"
                                    className="h-12 w-full rounded-xl border border-[#edeaf6] bg-[#fafafa] px-4 text-[14px] text-[#16151c] outline-none transition focus:border-[#6A5AE0] focus:ring-2 focus:ring-[#6A5AE0]/15"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-[13px] font-medium text-[#6c6c7b]">
                                    Mô tả
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Nhập mô tả (tùy chọn)"
                                    rows={3}
                                    className="h-[100px] w-full resize-none rounded-xl border border-[#edeaf6] bg-[#fafafa] px-4 py-3 text-[14px] text-[#16151c] outline-none transition focus:border-[#6A5AE0] focus:ring-2 focus:ring-[#6A5AE0]/15"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="h-11 rounded-full border border-[#e4e0f2] px-5 text-[14px] font-medium text-[#5c5c6b] transition hover:bg-[#f6f5fb]"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#6A5AE0] px-6 text-[14px] font-semibold text-white shadow-[0_12px_30px_rgba(106,90,224,0.25)] transition hover:bg-[#5b4ed0] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Đang thêm...
                                    </span>
                                ) : (
                                    'Thêm mới'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {toast ? (
                <div
                    className={`fixed right-6 top-6 z-[90] rounded-xl px-4 py-3 text-[13px] font-medium shadow-[0_12px_30px_rgba(15,18,32,0.18)] ${toast.type === 'success' ? 'bg-[#ecfdf5] text-[#067647]' : 'bg-[#fef2f2] text-[#b42318]'}`}
                    role="status"
                >
                    {toast.message}
                </div>
            ) : null}
        </div>
    );
}
