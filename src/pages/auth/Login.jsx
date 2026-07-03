import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import FacebookIcon from '../../assets/icons/Facebook.svg';
import GoogleIcon from '../../assets/icons/Google.svg';
import AppleIcon from '../../assets/icons/Apple.svg';
import { UserRoundedSvg, ExcludeSvg, HideSvg, EyeSvg } from '../../constants/loginIcons';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Login() {
    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const navigate = useNavigate();
    const { login, loading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState('');
    const [isCompletingLogin, setIsCompletingLogin] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const auth = await login({ email, password }, { rememberMe });
            setIsCompletingLogin(true);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            navigate('/', {
                replace: true,
                state: {
                    loginSuccess: true,
                    displayName: auth.user?.fullName,
                },
            });
        } catch {
            setIsCompletingLogin(false);
            // Error is exposed by the auth hook.
        }
    };

    const isEmailFocused = focusedField === 'email';
    const isPasswordFocused = focusedField === 'password';
    const hasEmailText = email.trim() !== '';
    const hasPasswordText = password.trim() !== '';
    const emailActive = isEmailFocused ? 'border-[#6A5AE0] bg-[rgba(106,90,224,0.08)]' : 'border-transparent bg-gray-50';
    const passwordActive = isPasswordFocused ? 'border-[#6A5AE0] bg-[rgba(106,90,224,0.08)]' : 'border-transparent bg-gray-50';
    const emailText = hasEmailText ? 'text-[#212121] font-normal' : 'text-gray-400 font-light';
    const passwordText = hasPasswordText ? 'text-[#212121] font-normal' : 'text-gray-400 font-light';
    const emailIconColor = hasEmailText ? '#212121' : isEmailFocused ? '#6A5AE0' : '#9E9E9E';
    const passwordIconColor = hasPasswordText ? '#212121' : isPasswordFocused ? '#6A5AE0' : '#9E9E9E';

    return (
        <div className="relative w-full max-w-[435px] flex flex-col gap-10">
            {isCompletingLogin ? (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#151225]/45 px-5 backdrop-blur-sm">
                    <div
                        role="status"
                        aria-live="polite"
                        className="w-full max-w-[360px] rounded-[24px] bg-white px-7 py-8 text-center shadow-[0_24px_80px_rgba(17,12,46,0.26)]"
                    >
                        <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-4 border-[#edeafe] border-t-[#6A5AE0]" />
                        <p className="mt-5 text-[18px] font-semibold text-[#212121]">Đang đăng nhập</p>
                        <p className="mt-2 text-[14px] leading-6 text-[#858494]">
                            Đang đưa bạn vào trang chủ...
                        </p>
                    </div>
                </div>
            ) : null}

            <div className="flex justify-center">
                <h1 className="text-4xl lg:text-5xl font-medium text-gray-900 text-center">Đăng nhập</h1>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-6 mt-7">
                <div
                    onClick={() => emailInputRef.current?.focus()}
                    className={`flex gap-3 h-15 items-center px-5 rounded-xl border-[1.5px] transition-colors cursor-text ${emailActive}`}
                >
                    <UserRoundedSvg color={emailIconColor} />
                    <input
                        ref={emailInputRef}
                        type="email"
                        placeholder="Tên đăng nhập"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField('')}
                        className={`flex-1 bg-transparent outline-none text-sm tracking-wider placeholder:text-gray-400 ${emailText}`}
                        required
                    />
                </div>

                <div
                    onClick={(e) => {
                        if (e.target.closest('button')) return;
                        passwordInputRef.current?.focus();
                    }}
                    className={`flex gap-3 h-15 items-center px-5 rounded-xl border-[1.5px] transition-colors cursor-text ${passwordActive}`}
                >
                    <ExcludeSvg color={passwordIconColor} />
                    <input
                        ref={passwordInputRef}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField('')}
                        className={`flex-1 bg-transparent outline-none text-sm tracking-wider placeholder:text-gray-400 ${passwordText}`}
                        required
                    />
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowPassword(!showPassword)}
                        className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        {showPassword ? <EyeSvg color={passwordIconColor} /> : <HideSvg color={passwordIconColor} />}
                    </button>
                </div>

                <div className="flex items-center justify-center">
                    <label htmlFor="remember" className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            id="remember"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="peer sr-only"
                        />
                        <span className="relative grid h-6 w-6 place-items-center rounded-lg border-3 border-[#6A5AE0] bg-white transition-all duration-200 peer-checked:bg-[#6A5AE0] peer-checked:border-[#6A5AE0] peer-focus-visible:ring-2 peer-focus-visible:ring-[#6A5AE0]/30">
                            <svg
                                viewBox="0 0 16 16"
                                aria-hidden="true"
                                className={`h-[18px] w-[18px] text-white transition-opacity duration-200 ${rememberMe ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <path d="M3.5 8.3L6.9 11.7L12.8 5.8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <span className="text-sm font-normal text-gray-900">Ghi nhớ mật khẩu</span>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading || isCompletingLogin}
                    aria-busy={loading || isCompletingLogin}
                    className="w-full bg-[#6A5AE0] text-white font-normal py-4 px-4 rounded-full hover:bg-[#5a4ad0] transition-colors shadow-[4px_8px_24px_0_rgba(77,93,250,0.25)] cursor-pointer"
                >
                    {loading || isCompletingLogin ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>

                {error ? (
                    <p className="text-center text-sm text-red-500" aria-live="polite">
                        {error}
                    </p>
                ) : null}

                <div className="text-center">
                    <a href="#" className="text-[#6A5AE0] font-normal text-base hover:underline">
                        Quên mật khẩu?
                    </a>
                </div>
            </form>

            <div className="flex items-center gap-4 mt-7">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="text-[#616161] font-normal text-lg px-2">Hoặc đăng nhập với</span>
                <div className="flex-1 h-px bg-gray-300" />
            </div>

            <div className="flex gap-5 justify-center">
                <button className="bg-white border border-gray-200 px-8 py-4 rounded-2xl hover:scale-103 transition-transform flex items-center justify-center cursor-pointer">
                    <img src={FacebookIcon} alt="Facebook" className="w-6 h-6" />
                </button>

                <button className="bg-white border border-gray-200 px-8 py-4 rounded-2xl hover:scale-103 transition-transform flex items-center justify-center cursor-pointer">
                    <img src={GoogleIcon} alt="Google" className="w-6 h-6" />
                </button>

                <button className="bg-white border border-gray-200 px-8 py-4 rounded-2xl hover:scale-103 transition-transform flex items-center justify-center cursor-pointer">
                    <img src={AppleIcon} alt="Apple" className="w-6 h-6" />
                </button>
            </div>

            <div className="text-center text-sm">
                <span className="text-[#9E9E9E] font-light">Đăng ký tài khoản mới? </span>
                <Link to="/onboard" className="text-[#6A5AE0] font-normal hover:underline">
                    Đăng ký
                </Link>
            </div>
        </div>
    );
}
