import UserRoundedIcon from '../assets/icons/User-Rounded-Onboard.svg';
import UsersTwoIcon from '../assets/icons/Users-Two.svg';
import UsersThreeIcon from '../assets/icons/Users-Three.svg';
import UserIdIcon from '../assets/icons/User-Id.svg';



export const ACCOUNT_OPTIONS = [
    { id: 'free', label: 'Tự do', icon: UserRoundedIcon },
    { id: 'teacher', label: 'Giáo viên', icon: UsersTwoIcon },
    { id: 'student', label: 'Học sinh', icon: UsersThreeIcon },
    { id: 'expert', label: 'Chuyên gia', icon: UserIdIcon },
];

export const WORKSPACE_OPTIONS = [
    { id: 'school', label: 'Trường học', icon: UserRoundedIcon },
    { id: 'university', label: 'Đại học', icon: UsersTwoIcon },
    { id: 'group', label: 'Nhóm', icon: UsersThreeIcon },
    { id: 'company', label: 'Doanh nghiệp', icon: UserIdIcon },
];

export const ONBOARD_STEPS = {
    account: {
        title: 'Chọn loại tài khoản phù hợp với bạn?',
        subtitle: 'Bạn có thể bỏ qua, nếu muốn.',
        options: ACCOUNT_OPTIONS,
        progressWidth: 'w-[28%]',
    },
    workspace: {
        title: 'Chọn không gian làm việc phù hợp với bạn?',
        subtitle: 'Bạn có thể bỏ qua, nếu muốn.',
        options: WORKSPACE_OPTIONS,
        progressWidth: 'w-[54%]',
    },
};
