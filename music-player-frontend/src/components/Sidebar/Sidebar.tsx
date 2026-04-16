import styles from './Sidebar.module.css';

export type NavItem = 'home' | 'search' | 'library';

type Props = {
  onAddSong: () => void;
  activeItem: NavItem;
  onNavigate: (item: NavItem) => void;
};

export function Sidebar({ onAddSong, activeItem, onNavigate }: Props) {
  return (
    <aside className={styles.container}>
      <div className={styles.logo}>
        <span className={styles.logoIcon} aria-hidden="true">
          ♪
        </span>
        <span className={styles.logoText}>Kmusic</span>
      </div>

      <nav className={styles.nav}>
        <button
          type="button"
          className={`${styles.navLink} ${activeItem === 'home' ? styles.activeLink : ''}`}
          onClick={() => onNavigate('home')}
        >
          <span className={styles.navIcon} aria-hidden="true">
            ⌂
          </span>
          Inicio
        </button>
        <button
          type="button"
          className={`${styles.navLink} ${activeItem === 'search' ? styles.activeLink : ''}`}
          onClick={() => onNavigate('search')}
        >
          <span className={styles.navIcon} aria-hidden="true">
            ⌕
          </span>
          Buscar
        </button>
        <button
          type="button"
          className={`${styles.navLink} ${activeItem === 'library' ? styles.activeLink : ''}`}
          onClick={() => onNavigate('library')}
        >
          <span className={styles.navIcon} aria-hidden="true">
            ▦
          </span>
          Tu Biblioteca
        </button>
      </nav>

      <div className={styles.actions}>
        <button className={styles.createButton} onClick={onAddSong} type="button">
          Crear playlist
        </button>
      </div>

      <div className={styles.footer}>Listas Dobles — Estructuras de Datos</div>
    </aside>
  );
}
