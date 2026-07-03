import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../../../components/pagination';
import AddSubject from '../../../../components/popup/addSubject';
import EditSubject from '../../../../components/popup/editSubject';
import { useSubjects } from '../../../../contexts/SubjectsContext';
import {
    SwitchSvg as SortIcon,
    EditSvg as EditIcon,
    RemoveSvg as RemoveIcon,
} from '../../../../constants/dashboardIcon';

function ActionButton({ icon, label, onClick }) {
    const IconComponent = icon;

    return (
        <button
            type="button"
            aria-label={label}
            onClick={(event) => {
                event.stopPropagation();
                onClick?.(event);
            }}
            className="flex h-7 w-7 cursor-pointer items-center justify-center text-[#16151c] transition-colors duration-200 hover:text-[#7152f3]"
        >
            <IconComponent color="currentColor" />
        </button>
    );
}

function RowItem({ subjectCode, title, fileCount, onClick, onDelete, onEdit }) {
    return (
        <div
            className="grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 rounded-[14px] border border-[#F3F4F6] bg-white p-4 transition-colors hover:bg-[#EDEFFF] sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)_80px] sm:items-center sm:rounded-[10px] sm:border-x-0 sm:border-t-0 sm:bg-transparent sm:px-0 sm:py-5 sm:last:border-b-0"
            onClick={onClick}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onClick?.();
                }
            }}
            role="button"
            tabIndex={0}
        >
            <div className="min-w-0">
                <p className="truncate text-[14px] font-light leading-6 text-[#16151c]">
                    {subjectCode || '-'}
                </p>
            </div>

            <div className="min-w-0 sm:col-auto">
                <p className="truncate text-[14px] font-semibold leading-6 text-[#16151c] sm:font-light">
                    {title || '-'}
                </p>
            </div>

            <div className="min-w-0">
                <p className="truncate text-[13px] font-light leading-6 text-[#858494] sm:text-[14px] sm:text-[#16151c]">
                    {fileCount} file
                </p>
            </div>

            <div className="row-span-3 flex items-center justify-end gap-3 sm:row-span-1 sm:gap-4">
                <ActionButton icon={EditIcon} label="Chỉnh sửa" onClick={onEdit} />
                <ActionButton icon={RemoveIcon} label="Xóa" onClick={onDelete} />
            </div>
        </div>
    );
}

export default function ListSubjects() {
    const { subjects: contextSubjects, updateSubject, deleteSubject } = useSubjects();
    const [sortOrder, setSortOrder] = useState('newest');
    const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
    const [subjectBeingEdited, setSubjectBeingEdited] = useState(null);
    const [toast, setToast] = useState(null);
    const toastTimerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        return () => {
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        };
    }, []);

    const normalizedSubjects = contextSubjects.map((subject) => ({
        ...subject,
        source: subject.source ?? 'local',
        fileCount: Array.isArray(subject.exercises)
            ? subject.exercises.length
            : subject.fileCount ?? 0,
    }));

    const visibleRows = sortOrder === 'newest'
        ? [...normalizedSubjects].reverse()
        : normalizedSubjects;

    const showToast = (message, type = 'error') => {
        setToast({ message, type });
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToast(null), 3000);
    };

    const openEditSubjectModal = (subject) => {
        setSubjectBeingEdited(subject);
        setIsEditSubjectOpen(true);
    };

    const closeEditSubjectModal = () => {
        setIsEditSubjectOpen(false);
        setSubjectBeingEdited(null);
    };

    const handleDeleteRow = (rowId) => {
        const row = normalizedSubjects.find((r) => r.id === rowId);
        const shouldDelete = window.confirm(`Bạn có chắc muốn xóa "${row?.title || ''}" không?`);

        if (!shouldDelete) return;

        deleteSubject(rowId);
        showToast('Xóa thành công!', 'success');
    };

    const handleUpdateSubject = ({ subjectCode, subjectName, description }) => {
        if (!subjectBeingEdited) {
            return;
        }

        updateSubject(subjectBeingEdited.id, {
            title: subjectName || subjectBeingEdited.title,
            subjectCode: subjectCode || subjectBeingEdited.subjectCode,
            description,
        });
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <h2 className="text-[18px] font-semibold leading-6 text-[#16151c]">
                    {`${normalizedSubjects.length} môn học`}
                </h2>

                <div className="flex flex-wrap items-center gap-4 pt-2 sm:gap-6">
                    <button
                        type="button"
                        onClick={() => setSortOrder((currentOrder) => (currentOrder === 'newest' ? 'oldest' : 'newest'))}
                        aria-pressed={sortOrder === 'newest'}
                        className="flex cursor-pointer items-center gap-2 text-[16px] font-medium leading-6 text-[#7152f3] transition-colors duration-200 hover:text-[#5a44d0]"
                    >
                        <span>{sortOrder === 'newest' ? 'Mới nhất' : 'Cũ nhất'}</span>
                        <span className={`inline-flex transition-transform duration-200 ${sortOrder === 'newest' ? 'rotate-0' : 'rotate-180'}`}>
                            <SortIcon />
                        </span>
                    </button>

                    <AddSubject />
                </div>
            </div>

            <div className="mt-5 hidden grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)_80px] items-center border-b border-[#F3F4F6] pb-4 text-[14px] font-light leading-[22px] text-[#a2a1a8] sm:grid">
                <p>Mã môn học</p>
                <p>Tên môn học</p>
                <p>Số lượng file</p>
                <p className="text-right">Action</p>
            </div>

            <div className="thin-scrollbar -mr-2 mt-4 min-h-0 flex-1 overflow-y-auto pr-2 sm:mt-0 sm:pr-3">
                <div className="grid gap-3 sm:block sm:divide-y sm:divide-[#F3F4F6]">
                    {visibleRows.length === 0 ? (
                        <div className="py-8 text-center text-[14px] text-[#858494]">
                            Chưa có môn học nào.
                        </div>
                    ) : null}

                    {visibleRows.map((row) => (
                        <RowItem
                            key={row.id}
                            subjectCode={row.subjectCode}
                            title={row.title}
                            fileCount={row.fileCount}
                            onClick={() => navigate(String(row.id), { state: row })}
                            onDelete={() => handleDeleteRow(row.id)}
                            onEdit={() => openEditSubjectModal(row)}
                        />
                    ))}
                </div>
            </div>

            <div className="mt-8 border-t border-[#F3F4F6] pt-6">
                <Pagination
                    pageSize={10}
                    totalItems={normalizedSubjects.length}
                    currentPage={1}
                    totalPages={Math.max(1, Math.ceil(normalizedSubjects.length / 10))}
                    itemLabel="môn học"
                />
            </div>

            <EditSubject
                open={isEditSubjectOpen}
                onClose={closeEditSubjectModal}
                onSubmit={handleUpdateSubject}
                initialValues={subjectBeingEdited ?? undefined}
            />

            {toast ? (
                <div
                    className={`fixed left-4 right-4 top-4 z-[90] rounded-xl px-4 py-3 text-[13px] font-medium shadow-[0_12px_30px_rgba(15,18,32,0.18)] sm:left-auto sm:right-6 sm:top-6 ${toast.type === 'success' ? 'bg-[#ecfdf5] text-[#067647]' : 'bg-[#fef2f2] text-[#b42318]'}`}
                    role="status"
                >
                    {toast.message}
                </div>
            ) : null}
        </div>
    );
}
