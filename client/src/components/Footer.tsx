import { Icon } from './ui/Icon';
import styles from './Footer.module.css';

export function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.footerBrand}>
                    <div className={styles.footerLogo}>
                        <Icon name="film" size="medium" />
                    </div>
                    <span className={styles.footerBrandName}>Merlin</span>
                </div>

                <nav className={styles.footerNav}>
                    <a href="#" className={styles.footerLink}>Privacy Policy</a>
                    <a href="#" className={styles.footerLink}>Terms of Service</a>
                    <a href="#" className={styles.footerLink}>Help Center</a>
                </nav>

                <div className={styles.footerCopyright}>
                    © 2024 Merlin. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
