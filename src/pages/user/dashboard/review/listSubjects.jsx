import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../../../components/pagination';
import AddSubject from '../../../../components/popup/addSubject';
import EditSubject from '../../../../components/popup/editSubject';
import { useSubjects } from '../../../../contexts/SubjectsContext';
import { fetchDocuments, normalizeDocument } from '../../../../services/documentsService';
import { getStoredAuth } from '../../../../services/authService';
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
                <ActionButton icon={EditIcon} label="Chinh sua" onClick={onEdit} />
                <ActionButton icon={RemoveIcon} label="Xoa" onClick={onDelete} />
            </div>
        </div>
    );
}

function mergeSubjectLists(localSubjects, backendSubjects) {
    const subjectsById = new Map();

    localSubjects.forEach((subject) => {
        if (subject?.id) {
            subjectsById.set(String(subject.id), subject);
        }
    });

    backendSubjects.forEach((subject) => {
        if (!subject?.id) return;

        const id = String(subject.id);
        const existingSubject = subjectsById.get(id);

        subjectsById.set(id, {
            ...existingSubject,
            ...subject,
            exercises: subject.exercises?.length ? subject.exercises : existingSubject?.exercises ?? [],
            source: subject.source ?? 'backend',
        });
    });

    return Array.from(subjectsById.values());
}

function getDisplayFileCount(subject) {
    const exerciseCount = Array.isArray(subject.exercises) ? subject.exercises.length : 0;
    const backendFileCount = Number(subject.fileCount ?? subject.documentsCount ?? subject.filesCount ?? 0) || 0;

    return Math.max(exerciseCount, backendFileCount);
}

export default function ListSubjects() {
    const {
        subjects: contextSubjects,
        updateSubject,
        deleteSubject,
        ensureSubject,
    } = useSubjects();
    const [apiSubjects, setApiSubjects] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
    const [subjectBeingEdited, setSubjectBeingEdited] = useState(null);
    const [toast, setToast] = useState(null);
    const toastTimerRef = useRef(null);
    const navigate = useNavigate();

    const syncBackendSubjects = useCallback(async () => {
        if (!getStoredAuth()?.accessToken) {
            setApiSubjects([]);
            setSyncError('');
            return;
        }

        setIsSyncing(true);
        setSyncError('');

        try {
            const documents = await fetchDocuments();
            const nextSubjects = documents
                .map((document) => ({
                    ...normalizeDocument(document),
                    source: 'backend',
                }))
                .filter((subject) => subject.id);

            setApiSubjects(nextSubjects);
            nextSubjects.forEach((subject) => ensureSubject(subject));
        } catch (error) {
            setSyncError(error?.message || 'Khong the tai du lieu tu backend.');
        } finally {
            setIsSyncing(false);
        }
    }, [ensureSubject]);

    useEffect(() => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        return () => {
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        syncBackendSubjects();

        const handleRefresh = () => syncBackendSubjects();
        window.addEventListener('focus', handleRefresh);
        window.addEventListener('myweb:auth-updated', handleRefresh);
        window.addEventListener('storage', handleRefresh);

        return () => {
            window.removeEventListener('focus', handleRefresh);
            window.removeEventListener('myweb:auth-updated', handleRefresh);
            window.removeEventListener('storage', handleRefresh);
        };
    }, [syncBackendSubjects]);

    const normalizedSubjects = mergeSubjectLists(contextSubjects, apiSubjects).map((subject) => ({
        ...subject,
        source: subject.source ?? 'local',
        fileCount: getDisplayFileCount(subject),
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
        const shouldDelete = window.confirm(`Ban co chac muon xoa "${row?.title || ''}" khong?`);

        if (!shouldDelete) return;

        deleteSubject(rowId);
        setApiSubjects((current) => current.filter((subject) => subject.id !== rowId));
        showToast('Xoa thanh cong!', 'success');
    };

    const handleUpdateSubject = ({ subjectCode, subjectName, description }) => {
        if (!subjectBeingEdited) {
            return;
        }

        const updates = {
            title: subjectName || subjectBeingEdited.title,
            subjectCode: subjectCode || subjectBeingEdited.subjectCode,
            description,
        };

        updateSubject(subjectBeingEdited.id, updates);
        setApiSubjects((current) => current.map((subject) => (
            subject.id === subjectBeingEdited.id ? { ...subject, ...updates } : subject
        )));
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div>
                    <h2 className="text-[18px] font-semibold leading-6 text-[#16151c]">
                        {`${normalizedSubjects.length} mon hoc`}
                    </h2>
                    {isSyncing ? (
                        <p className="mt-1 text-[12px] text-[#858494]">Dang dong bo du lieu...</p>
                    ) : null}
                    {!isSyncing && syncError ? (
                        <p className="mt-1 text-[12px] text-[#b42318]">{syncError}</p>
                    ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2 sm:gap-6">
                    <button
                        type="button"
                        onClick={syncBackendSubjects}
                        className="text-[14px] font-medium leading-6 text-[#7152f3] transition-colors duration-200 hover:text-[#5a44d0]"
                    >
                        Lam moi
                    </button>

                    <button
                        type="button"
                        onClick={() => setSortOrder((currentOrder) => (currentOrder === 'newest' ? 'oldest' : 'newest'))}
                        aria-pressed={sortOrder === 'newest'}
                        className="flex cursor-pointer items-center gap-2 text-[16px] font-medium leading-6 text-[#7152f3] transition-colors duration-200 hover:text-[#5a44d0]"
                    >
                        <span>{sortOrder === 'newest' ? 'Moi nhat' : 'Cu nhat'}</span>
                        <span className={`inline-flex transition-transform duration-200 ${sortOrder === 'newest' ? 'rotate-0' : 'rotate-180'}`}>
                            <SortIcon />
                        </span>
                    </button>

                    <AddSubject />
                </div>
            </div>

            <div className="mt-5 hidden grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)_80px] items-center border-b border-[#F3F4F6] pb-4 text-[14px] font-light leading-[22px] text-[#a2a1a8] sm:grid">
                <p>Ma mon hoc</p>
                <p>Ten mon hoc</p>
                <p>So luong file</p>
                <p className="text-right">Action</p>
            </div>

            <div className="thin-scrollbar -mr-2 mt-4 min-h-0 flex-1 overflow-y-auto pr-2 sm:mt-0 sm:pr-3">
                <div className="grid gap-3 sm:block sm:divide-y sm:divide-[#F3F4F6]">
                    {visibleRows.length === 0 ? (
                        <div className="py-8 text-center text-[14px] text-[#858494]">
                            {isSyncing ? 'Dang tai du lieu...' : 'Chua co mon hoc nao.'}
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
                    itemLabel="mon hoc"
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