import styles from "./spinner.module.css";

export default function Spinner({ className }: { className?: string }) {
    return (
        <div id={styles.container} className={`${className}`}>
            <svg viewBox="0 0 20 20" width="20" height="20">
                <circle id={styles.spinner} cx="10" cy="10" r="7.75" />
            </svg>
        </div>
    );
}
