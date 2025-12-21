import { CSSProperties } from 'react';
import styles from './Icon.module.css';

export type IconName =
    | 'home' | 'compass'
    | 'play' | 'pause' | 'airplay'
    | 'search' | 'star' | 'heart' | 'bookmark' | 'log-out' | 'logout' | 'settings'
    | 'user' | 'users' | 'users-group'
    | 'chevron-down' | 'chevron-right' | 'chevron-up' | 'chevron-left'
    | 'plus' | 'minus' | 'x' | 'crown' | 'check-circle' | 'film';

export interface IconProps {
    name: IconName;
    size?: 'small' | 'medium' | 'large' | number;
    className?: string;
    style?: CSSProperties;
}

export function Icon({ name, size = 'medium', className = '', style }: IconProps) {
    const sizeClass = typeof size === 'string' ? styles[size] : '';
    const customSize = typeof size === 'number' ? { width: size, height: size } : {};

    const combinedClassName = `${styles.icon} ${sizeClass} ${className}`;
    const combinedStyle = { ...customSize, ...style };

    // Render inline SVG for proper color inheritance
    switch (name) {
        case 'home':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 17.0002V11.4522C20 10.9179 19.9995 10.6506 19.9346 10.4019C19.877 10.1816 19.7825 9.97307 19.6546 9.78464C19.5102 9.57201 19.3096 9.39569 18.9074 9.04383L14.1074 4.84383C13.3608 4.19054 12.9875 3.86406 12.5674 3.73982C12.1972 3.63035 11.8026 3.63035 11.4324 3.73982C11.0126 3.86397 10.6398 4.19014 9.89436 4.84244L5.09277 9.04383C4.69064 9.39569 4.49004 9.57201 4.3457 9.78464C4.21779 9.97307 4.12255 10.1816 4.06497 10.4019C4 10.6506 4 10.9179 4 11.4522V17.0002C4 17.932 4 18.3978 4.15224 18.7654C4.35523 19.2554 4.74432 19.6452 5.23438 19.8482C5.60192 20.0005 6.06786 20.0005 6.99974 20.0005C7.93163 20.0005 8.39808 20.0005 8.76562 19.8482C9.25568 19.6452 9.64467 19.2555 9.84766 18.7654C9.9999 18.3979 10 17.932 10 17.0001V16.0001C10 14.8955 10.8954 14.0001 12 14.0001C13.1046 14.0001 14 14.8955 14 16.0001V17.0001C14 17.932 14 18.3979 14.1522 18.7654C14.3552 19.2555 14.7443 19.6452 15.2344 19.8482C15.6019 20.0005 16.0679 20.0005 16.9997 20.0005C17.9316 20.0005 18.3981 20.0005 18.7656 19.8482C19.2557 19.6452 19.6447 19.2554 19.8477 18.7654C19.9999 18.3978 20 17.932 20 17.0002Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'compass':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15.5 8.5L13.5 13.5L8.5 15.5L10.5 10.5L15.5 8.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'airplay':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 17H4C3.46957 17 2.96086 16.7893 2.58579 16.4142C2.21071 16.0391 2 15.5304 2 15V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H20C20.5304 3 21.0391 3.21071 21.4142 3.58579C21.7893 3.96086 22 4.46957 22 5V15C22 15.5304 21.7893 16.0391 21.4142 16.4142C21.0391 16.7893 20.5304 17 20 17H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 15L17 21H7L12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'search':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 15L21 21M10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'star':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.0489 3.40221C11.4495 2.5781 12.6996 2.5781 13.1002 3.40221L15.4637 8.19656C15.6345 8.54218 15.9652 8.78278 16.3498 8.83891L21.6396 9.61048C22.5466 9.74359 22.9139 10.9039 22.2474 11.5525L18.4658 15.2361C18.1897 15.5043 18.0628 15.8916 18.1277 16.2751L19.0353 21.5438C19.1901 22.4479 18.2124 23.1365 17.4075 22.7138L12.6527 20.2329C12.3102 20.0535 11.8389 20.0535 11.4964 20.2329L6.74158 22.7138C5.93669 23.1365 4.95899 22.4479 5.11378 21.5438L6.02138 16.2751C6.08629 15.8916 5.95943 15.5043 5.68333 15.2361L1.90173 11.5525C1.23522 10.9039 1.60251 9.74359 2.50951 9.61048L7.79933 8.83891C8.18392 8.78278 8.51464 8.54218 8.68542 8.19656L11.0489 3.40221Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'heart':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.8401 4.60999C20.3294 4.09927 19.7229 3.69323 19.0555 3.41509C18.388 3.13696 17.6726 2.99274 16.9501 2.99274C16.2276 2.99274 15.5122 3.13696 14.8448 3.41509C14.1773 3.69323 13.5709 4.09927 13.0601 4.60999L12.0001 5.66999L10.9401 4.60999C9.90843 3.5783 8.50915 2.9929 7.05012 2.9929C5.59109 2.9929 4.19181 3.5783 3.16012 4.60999C2.12843 5.64169 1.54297 7.04096 1.54297 8.49999C1.54297 9.95903 2.12843 11.3583 3.16012 12.39L4.22012 13.45L12.0001 21.23L19.7801 13.45L20.8401 12.39C21.3508 11.8792 21.7569 11.2728 22.035 10.6053C22.3131 9.93789 22.4574 9.22248 22.4574 8.49999C22.4574 7.77751 22.3131 7.0621 22.035 6.39464C21.7569 5.72718 21.3508 5.12075 20.8401 4.60999V4.60999Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'bookmark':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 7.8C5 6.11984 5 5.27976 5.32698 4.63803C5.6146 4.07354 6.07354 3.6146 6.63803 3.32698C7.27976 3 8.11984 3 9.8 3H14.2C15.8802 3 16.7202 3 17.362 3.32698C17.9265 3.6146 18.3854 4.07354 18.673 4.63803C19 5.27976 19 6.11984 19 7.8V21L12 17L5 21V7.8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'log-out':
        case 'logout':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15M10 17L15 12M15 12L10 7M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'settings':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18.7273 14.7273C18.6063 15.0015 18.5702 15.3056 18.6236 15.6005C18.6771 15.8954 18.8177 16.1676 19.0273 16.3818L19.0818 16.4364C19.2509 16.6052 19.385 16.8057 19.4765 17.0265C19.568 17.2472 19.6151 17.4838 19.6151 17.7227C19.6151 17.9617 19.568 18.1983 19.4765 18.419C19.385 18.6397 19.2509 18.8402 19.0818 19.0091C18.913 19.1781 18.7124 19.3122 18.4917 19.4037C18.271 19.4952 18.0344 19.5423 17.7955 19.5423C17.5565 19.5423 17.3199 19.4952 17.0992 19.4037C16.8785 19.3122 16.678 19.1781 16.5091 19.0091L16.4545 18.9545C16.2403 18.745 15.9682 18.6044 15.6733 18.5509C15.3784 18.4974 15.0742 18.5335 14.8 18.6545C14.5311 18.7698 14.3018 18.9611 14.1403 19.205C13.9788 19.4489 13.8921 19.7347 13.8909 20.0273V20.1818C13.8909 20.664 13.6994 21.1265 13.3584 21.4675C13.0174 21.8084 12.5549 22 12.0727 22C11.5905 22 11.1281 21.8084 10.7871 21.4675C10.4461 21.1265 10.2545 20.664 10.2545 20.1818V20.1C10.2475 19.7991 10.1501 19.5073 9.97501 19.2625C9.79991 19.0176 9.55521 18.8312 9.27273 18.7273C8.99853 18.6063 8.69437 18.5702 8.39947 18.6236C8.10456 18.6771 7.83244 18.8177 7.61818 19.0273L7.56364 19.0818C7.39478 19.2509 7.19425 19.385 6.97353 19.4765C6.7528 19.568 6.51621 19.6151 6.27727 19.6151C6.03834 19.6151 5.80174 19.568 5.58102 19.4765C5.36029 19.385 5.15977 19.2509 4.99091 19.0818C4.82186 18.913 4.68775 18.7124 4.59626 18.4917C4.50476 18.271 4.45766 18.0344 4.45766 17.7955C4.45766 17.5565 4.50476 17.3199 4.59626 17.0992C4.68775 16.8785 4.82186 16.678 4.99091 16.5091L5.04545 16.4545C5.25503 16.2403 5.39562 15.9682 5.4491 15.6733C5.50257 15.3784 5.46647 15.0742 5.34545 14.8C5.23022 14.5311 5.03887 14.3018 4.79497 14.1403C4.55107 13.9788 4.26526 13.8921 3.97273 13.8909H3.81818C3.33597 13.8909 2.87351 13.6994 2.53253 13.3584C2.19156 13.0174 2 12.5549 2 12.0727C2 11.5905 2.19156 11.1281 2.53253 10.7871C2.87351 10.4461 3.33597 10.2545 3.81818 10.2545H3.9C4.2009 10.2475 4.49273 10.1501 4.73754 9.97501C4.98236 9.79991 5.16883 9.55521 5.27273 9.27273C5.39374 8.99853 5.42984 8.69437 5.37637 8.39947C5.3229 8.10456 5.18231 7.83244 4.97273 7.61818L4.91818 7.56364C4.74913 7.39478 4.61503 7.19425 4.52353 6.97353C4.43203 6.7528 4.38493 6.51621 4.38493 6.27727C4.38493 6.03834 4.43203 5.80174 4.52353 5.58102C4.61503 5.36029 4.74913 5.15977 4.91818 4.99091C5.08704 4.82186 5.28757 4.68775 5.50829 4.59626C5.72901 4.45766 5.96561 4.45766 6.20455 4.45766C6.44348 4.45766 6.68008 4.50476 6.9008 4.59626C7.12152 4.68775 7.32205 4.82186 7.49091 4.99091L7.54545 5.04545C7.75971 5.25503 8.03183 5.39562 8.32674 5.4491C8.62164 5.50257 8.9258 5.46647 9.2 5.34545H9.27273C9.54161 5.23022 9.77093 5.03887 9.93245 4.79497C10.094 4.55107 10.1807 4.26526 10.1818 3.97273V3.81818C10.1818 3.33597 10.3734 2.87351 10.7144 2.53253C11.0553 2.19156 11.5178 2 12 2C12.4822 2 12.9447 2.19156 13.2856 2.53253C13.6266 2.87351 13.8182 3.33597 13.8182 3.81818V3.9C13.8193 4.19253 13.906 4.47834 14.0676 4.72224C14.2291 4.96614 14.4584 5.15749 14.7273 5.27273C15.0015 5.39374 15.3056 5.42984 15.6005 5.37637C15.8954 5.3229 16.1676 5.18231 16.3818 4.97273L16.4364 4.91818C16.6052 4.74913 16.8057 4.61503 17.0265 4.52353C17.2472 4.43203 17.4838 4.38493 17.7227 4.38493C17.9617 4.38493 18.1983 4.43203 18.419 4.52353C18.6397 4.61503 18.8402 4.74913 19.0091 4.91818C19.1781 5.08704 19.3122 5.28757 19.4037 5.50829C19.4952 5.72901 19.5423 5.96561 19.5423 6.20455C19.5423 6.44348 19.4952 6.68008 19.4037 6.9008C19.3122 7.12152 19.1781 7.32205 19.0091 7.49091L18.9545 7.54545C18.745 7.75971 18.6044 8.03183 18.5509 8.32674C18.4974 8.62164 18.5335 8.9258 18.6545 9.2V9.27273C18.7698 9.54161 18.9611 9.77093 19.205 9.93245C19.4489 10.094 19.7347 10.1807 20.0273 10.1818H20.1818C20.664 10.1818 21.1265 10.3734 21.4675 10.7144C21.8084 11.0553 22 11.5178 22 12C22 12.4822 21.8084 12.9447 21.4675 13.2856C21.1265 13.6266 20.664 13.8182 20.1818 13.8182H20.1C19.8075 13.8193 19.5217 13.906 19.2778 14.0676C19.0339 14.2291 18.8425 14.4584 18.7273 14.7273Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'user':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'users':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'users-group':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 19C18 17.4087 18 16.6131 17.6955 16.0073C17.4895 15.6276 17.1997 15.3012 16.8495 15.0555C16.3047 14.6802 15.5883 14.5867 14.1556 14.3996L13.8444 14.3493C13.0353 14.2401 12.6307 14.1855 12.3667 13.9575C12.1029 13.7296 11.9956 13.3728 11.7808 12.6593L11.1 10.5M6 19C6 17.4087 6 16.6131 6.30448 16.0073C6.51046 15.6276 6.80036 15.3012 7.15052 15.0555C7.69526 14.6802 8.41165 14.5867 9.84442 14.3996L10.1556 14.3493C10.9647 14.2401 11.3693 14.1855 11.6333 13.9575C11.8971 13.7296 12.0044 13.3728 12.2192 12.6593L12.9 10.5M15 7.5C15 9.433 13.433 11 11.5 11C9.567 11 8 9.433 8 7.5C8 5.567 9.567 4 11.5 4C13.433 4 15 5.567 15 7.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'chevron-down':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'chevron-right':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'chevron-up':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'chevron-left':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'plus':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12H12M12 12H18M12 12V18M12 12V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
        case 'minus':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
        case 'x':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
        case 'crown':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 19H21M4 15L7 9L10 13L14 7L17 13L20 9L21 15H3H4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
        case 'check-circle':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
        case 'film':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.8 22.6L4.2 22.6C3.08 22.6 2.51997 22.6 2.092 22.382C1.71569 22.1903 1.40973 21.8843 1.21799 21.508C1 21.08 1 20.5203 1 19.4V4.6C1 3.47977 1 2.91962 1.21799 2.49197C1.40973 2.11569 1.71569 1.80973 2.092 1.61799C2.51962 1.4 3.07967 1.4 4.19978 1.4H19.8002C20.9203 1.4 21.4801 1.4 21.9079 1.61799C22.2842 1.80973 22.5905 2.11569 22.7822 2.49197C23.0002 2.91962 23.0002 3.47977 23.0002 4.6V19.4C23.0002 20.5203 23.0002 21.08 22.7822 21.508C22.5905 21.8843 22.2842 22.1903 21.9079 22.382C21.4805 22.6 20.9215 22.6 19.8036 22.6H19.8ZM7 1.4V22.6M17 1.4V22.6M1 12H7M17 12H23M1 7H7M17 7H23M1 17H7M17 17H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
        case 'play':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 3L19 12L5 21V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'pause':
            return (
                <svg className={combinedClassName} style={combinedStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 4H6V20H10V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18 4H14V20H18V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        default:
            return null;
    }
}
