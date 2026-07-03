import React, { useEffect, useState } from 'react';

const DEFAULT_FORM = {
    subjectCode: '',
    subjectName: '',
    description: '',
};

function toFormData(values = DEFAULT_FORM) {
    return {
        subjectCode: values?.subjectCode ?? '',
        subjectName: values?.title ?? '',
        description: values?.description ?? '',
    };
}

export default function EditSubject({
    open,
    onClose,
    onSubmit,
    initialValues = DEFAULT_FORM,
}) {
    const [formData, setFormData] = useState(() => toFormData(initialValues));

    useEffect(() => {
        if (open) {
            setFormData(toFormData(initialValues));
        }
    }, [initialValues, open]);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose?.();
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    const handleBackdropClick = () => {
        onClose?.();
    };

    const handleSubmit = () => {
        onSubmit?.(formData);
        onClose?.();
    };

    return (
        <div
            className="fixed inset-0 z-80 flex items-center justify-center bg-[rgba(255,255,255,0.72)] px-4 py-6 backdrop-blur-sm"
            onMouseDown={handleBackdropClick}
            role="presentation"
        >
            <div
                className="w-full max-w-[456px] overflow-hidden rounded-[20px] bg-white px-5 pb-5 pt-5 shadow-[0_24px_80px_rgba(17,24,39,0.12)]"
                onMouseDown={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-subject-title"
            >
                <h2
                    id="edit-subject-title"
                    className="text-[20px] font-semibold leading-[30px] text-[#16151c]"
                >
                    Sửa môn học
                </h2>

                <div className="mt-5 h-px w-full bg-[#F3F4F6]" />

                <div className="mx-auto mt-14 flex w-[380px] flex-col gap-2.5">
                    <input
                        type="text"
                        aria-label="Mã môn học"
                        placeholder="Mã môn học"
                        value={formData.subjectCode}
                        onChange={(event) => setFormData((currentForm) => ({ ...currentForm, subjectCode: event.target.value }))}
                        className="h-14 w-full rounded-xl bg-[#fafafa] px-5 text-[14px] leading-[1.4] tracking-[0.2px] text-[#16151c] outline-none placeholder:text-[#9e9e9e] focus:ring-1 focus:ring-[#6a5ae0]/15 font-light"
                    />

                    <input
                        type="text"
                        aria-label="Tên môn học"
                        placeholder="Tên môn học"
                        value={formData.subjectName}
                        onChange={(event) => setFormData((currentForm) => ({ ...currentForm, subjectName: event.target.value }))}
                        className="h-14 w-full rounded-xl bg-[#fafafa] px-5 text-[14px] leading-[1.4] tracking-[0.2px] text-[#16151c] outline-none placeholder:text-[#9e9e9e] focus:ring-1 focus:ring-[#6a5ae0]/15 font-light"
                    />

                    <textarea
                        aria-label="Nhập tên mô tả (tùy chọn)"
                        placeholder="Nhập tên mô tả (tùy chọn)"
                        value={formData.description}
                        onChange={(event) => setFormData((currentForm) => ({ ...currentForm, description: event.target.value }))}
                        className="h-[150px] w-full resize-none rounded-xl bg-[#fafafa] px-5 py-4 text-[14px] leading-[1.4] tracking-[0.2px] text-[#16151c] outline-none placeholder:text-[#9e9e9e] focus:ring-1 focus:ring-[#6a5ae0]/15 font-light"
                    />
                </div>

                <div className="mx-auto mt-8 flex w-[342px] items-center justify-between gap-2.5">
                    <button
                        type="button"
                        onClick={() => onClose?.()}
                        className="flex h-[50px] w-[166px] items-center justify-center rounded-full border border-[rgba(162,161,168,0.2)] bg-white text-[16px] leading-none text-[#16151c] transition-colors hover:bg-[#fafafa] cursor-pointer"
                    >
                        Hủy
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="flex h-[50px] w-[166px] items-center justify-center rounded-full bg-[#6a5ae0] text-[16px] leading-none text-white transition-colors hover:bg-[#5b4ed0] cursor-pointer shadow-[4px_8px_24px_0_rgba(77,93,250,0.25)]"
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
}
