interface Props {
  onStart: () => void;
}

export function TitleScreen({ onStart }: Props) {
  return (
    <div style={styles.root}>
      <style>{particleKeyframes}</style>
      <div style={styles.particles} />
      <div style={styles.container}>
        <h1 style={styles.title}>CRYSTAL DEFENSE</h1>
        <p style={styles.subtitle}>近未来クリスタル防衛戦</p>
        <button
          style={styles.button}
          onClick={onStart}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0,240,255,0.15)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0,240,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(0,240,255,0.15)';
          }}
        >
          ステージ選択
        </button>
      </div>
      <div style={styles.footer}>
        <span>PC: クリックでタワー配置</span>
        <span>スマホ: タップでタワー配置</span>
      </div>
    </div>
  );
}

const particleKeyframes = `
  @keyframes floatParticle {
    0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
    50% { transform: translateY(-20px) scale(1.5); opacity: 0.8; }
  }
  @keyframes titleGlow {
    0%, 100% { text-shadow: 0 0 20px rgba(0,240,255,0.5), 0 0 40px rgba(0,240,255,0.2); }
    50% { text-shadow: 0 0 30px rgba(0,240,255,0.8), 0 0 60px rgba(0,240,255,0.3), 0 0 80px rgba(170,68,255,0.2); }
  }
`;

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100dvh',
    backgroundColor: '#0a0a1a',
    color: '#e0e8ff',
    fontFamily: "'Orbitron', 'Courier New', monospace",
    position: 'relative',
    overflow: 'hidden',
  },
  particles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 30%, rgba(0,240,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(170,68,255,0.05) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(255,170,0,0.03) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
  container: {
    textAlign: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: '42px',
    fontWeight: 900,
    color: '#00f0ff',
    margin: 0,
    letterSpacing: '6px',
    animation: 'titleGlow 3s ease-in-out infinite',
  },
  subtitle: {
    fontSize: '14px',
    color: '#667799',
    marginTop: '12px',
    marginBottom: '40px',
    letterSpacing: '4px',
  },
  button: {
    padding: '16px 48px',
    fontSize: '18px',
    fontWeight: 'bold',
    fontFamily: "'Orbitron', 'Courier New', monospace",
    border: '1px solid rgba(0,240,255,0.4)',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: '#00f0ff',
    cursor: 'pointer',
    transition: 'background-color 0.3s, box-shadow 0.3s',
    boxShadow: '0 0 10px rgba(0,240,255,0.15)',
    letterSpacing: '2px',
  },
  footer: {
    position: 'absolute',
    bottom: '24px',
    display: 'flex',
    gap: '24px',
    fontSize: '11px',
    color: '#334466',
    zIndex: 1,
  },
};
