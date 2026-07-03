export function UserRoundedSvg({ color }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-6 h-6 shrink-0">
            <circle cx="12" cy="6" r="4" fill={color} />
            <ellipse cx="12" cy="17" rx="7" ry="4" fill={color} />
        </svg>
    );
}

export function ExcludeSvg({ color }) {
    return (
        <svg width="15" height="17" viewBox="0 0 15 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-5 h-5 shrink-0">
            <path d="M7.07031 0C9.62759 0 11.6855 2.01272 11.6855 4.49707V5.77441C13.1207 6.22238 14.1668 7.52154 14.167 9.07324V13.1875C14.167 15.1087 12.574 16.6669 10.6104 16.667H3.55762C1.59308 16.667 0 15.1087 0 13.1875V9.07324C0.000191835 7.52154 1.04713 6.22238 2.48145 5.77441V4.49707C2.48991 2.01283 4.54705 0.00017002 7.07031 0ZM7.0791 9.4873C6.67276 9.4873 6.34296 9.80969 6.34277 10.207V12.0459C6.34284 12.4516 6.67269 12.7744 7.0791 12.7744C7.49398 12.7744 7.82415 12.4516 7.82422 12.0459V10.207C7.82404 9.80969 7.49391 9.48731 7.0791 9.4873ZM7.08789 1.44922C5.36892 1.44922 3.97136 2.80767 3.96289 4.48047V5.59473H10.2041V4.49707C10.2041 2.8161 8.80671 1.44939 7.08789 1.44922Z" fill={color} />
        </svg>
    );
}

export function HideSvg({ color }) {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-5 h-5 shrink-0">
            <path d="M3 10s2.8-4.5 7-4.5S17 10 17 10s-2.8 4.5-7 4.5S3 10 3 10Z" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 4l12 12" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}

export function EyeSvg({ color }) {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-5 h-5 shrink-0">
            <path d="M3 10s2.8-4.5 7-4.5S17 10 17 10s-2.8 4.5-7 4.5S3 10 3 10Z" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="10" cy="10" r="2" stroke={color} strokeWidth="1.6" />
        </svg>
    );
}

export function EmailSvg({ color }) {
    return (
        <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-5 w-5 shrink-0">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.4492 0C13.5667 0 14.6417 0.441667 15.4325 1.23417C16.2242 2.025 16.6667 3.09167 16.6667 4.20833V10.7917C16.6667 13.1167 14.775 15 12.4492 15H4.21667C1.89083 15 0 13.1167 0 10.7917V4.20833C0 1.88333 1.8825 0 4.21667 0H12.4492ZM13.775 5.45L13.8417 5.38333C14.0408 5.14167 14.0408 4.79167 13.8325 4.55C13.7167 4.42583 13.5575 4.35 13.3917 4.33333C13.2167 4.32417 13.05 4.38333 12.9242 4.5L9.16667 7.5C8.68333 7.90083 7.99083 7.90083 7.5 7.5L3.75 4.5C3.49083 4.30833 3.1325 4.33333 2.91667 4.55833C2.69167 4.78333 2.66667 5.14167 2.8575 5.39167L2.96667 5.5L6.75833 8.45833C7.225 8.825 7.79083 9.025 8.38333 9.025C8.97417 9.025 9.55 8.825 10.0158 8.45833L13.775 5.45Z"
                fill={color}
            />
        </svg>
    );
}

export function VietnamFlagSvg() {
    return (
        <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-[18px] w-6 shrink-0">
            <rect width="24" height="18" rx="2" fill="#DA251D" />
            <path
                d="M12 3.4L13.2 7H16.9L13.95 9.1L15.1 12.7L12 10.55L8.9 12.7L10.05 9.1L7.1 7H10.8L12 3.4Z"
                fill="#FFDA44"
            />
        </svg>
    );
}

export function ChevronDownSvg({ color }) {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-4 w-4 shrink-0">
            <path d="M4 6.5L8 10.5L12 6.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
