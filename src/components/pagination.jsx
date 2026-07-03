import React from 'react';

function ChevronDownIcon({ className = '' }) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className={className}
        >
            <path
                d="M5.5 7.75L10 12.25L14.5 7.75"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function ChevronRightIcon({ className = '' }) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className={className}
        >
            <path
                d="M10 7L15 12L10 17"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function PaginationNumberButton({ page, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-current={active ? 'page' : undefined}
            className={`flex h-[35px] min-w-[35px] items-center justify-center px-3 py-[7px] text-[14px] leading-[22px] transition-colors duration-200 ${active ? 'rounded-lg border border-[#7152f3] bg-white font-semibold text-[#7152f3]' : 'rounded-lg bg-white font-light text-[#16151c] hover:text-[#7152f3]'}`}
        >
            {page}
        </button>
    );
}

function PaginationArrowButton({ direction, onClick }) {
    const isLeft = direction === 'left';

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={isLeft ? 'Trang trước' : 'Trang sau'}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-[#16151c] transition-colors duration-200 hover:text-[#7152f3]"
        >
            <ChevronRightIcon className={isLeft ? '-rotate-180' : ''} />
        </button>
    );
}

export default function Pagination({
    pageSize = 10,
    totalItems = 60,
    currentPage = 1,
    totalPages = 4,
    pageNumbers,
    itemLabel = 'môn học',
    onPageChange,
    onPageSizeChange,
    className = '',
}) {
    const safeTotalPages = Math.max(totalPages, 1);
    const resolvedPageNumbers = Array.isArray(pageNumbers) && pageNumbers.length > 0
        ? pageNumbers
        : Array.from({ length: safeTotalPages }, (_, index) => index + 1);

    const startItem = totalItems > 0 ? ((currentPage - 1) * pageSize) + 1 : 0;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div
            className={`flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between ${className}`}
        >
            <div className="flex items-center gap-5">
                <p className="text-[14px] font-light leading-[22px] text-[#a2a1a8]">
                    Hiển thị
                </p>

                <button
                    type="button"
                    onClick={() => onPageSizeChange?.(pageSize)}
                    aria-label="Số bản ghi trên trang"
                    className="flex h-[46px] w-[76px] items-center justify-between rounded-[10px] border border-[rgba(162,161,168,0.2)] bg-white px-[13px] text-[#16151c] transition-colors duration-200 hover:border-[#7152f3]"
                >
                    <span className="text-[14px] font-light leading-[22px]">{pageSize}</span>
                    <ChevronDownIcon className="h-5 w-5 text-[#16151c]" />
                </button>
            </div>

            <p className="flex-1 text-center text-[14px] font-light leading-[22px] text-[#a2a1a8]">
                Hiển thị {startItem} to {endItem} trong tổng số {totalItems} {itemLabel}
            </p>

            <div className="flex items-center gap-2.5">
                <PaginationArrowButton
                    direction="left"
                    onClick={() => onPageChange?.(Math.max(currentPage - 1, 1))}
                />

                <div className="flex items-start gap-[5px]">
                    {resolvedPageNumbers.map((page) => (
                        <PaginationNumberButton
                            key={page}
                            page={page}
                            active={page === currentPage}
                            onClick={() => onPageChange?.(page)}
                        />
                    ))}
                </div>

                <PaginationArrowButton
                    direction="right"
                    onClick={() => onPageChange?.(Math.min(currentPage + 1, safeTotalPages))}
                />
            </div>
        </div>
    );
}
