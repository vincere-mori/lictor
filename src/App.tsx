import { Registry } from './screens/Registry'
import { IconRegistry, IconBrain, IconMode } from './components/icons'

export default function App() {
  return (
    <div className="app">
      <header className="head">
        <div className="head-top">
          <span className="wordmark">LICTOR</span>
          <span className="tagline">sine mora</span>
        </div>
        <div className="rule" />
        <div className="seclabel">
          <span>СЕГОДНЯ</span>
          <span>3 АКТИВНЫХ</span>
        </div>
      </header>

      <main className="main">
        <Registry />
      </main>

      <footer className="foot">
        <div className="capture">
          <span className="capture-plus">+</span>
          <input
            className="capture-input"
            placeholder="что нужно? напр. позвонить маме завтра 18:00 жёстко"
          />
          <button className="capture-send" aria-label="добавить">↑</button>
        </div>
        <nav className="nav">
          <button className="nav-item active">
            <IconRegistry />
            <span className="nav-label">РЕЕСТР</span>
          </button>
          <button className="nav-item">
            <IconBrain />
            <span className="nav-label">МОЗГ</span>
          </button>
          <button className="nav-item">
            <IconMode />
            <span className="nav-label">РЕЖИМ</span>
          </button>
        </nav>
      </footer>
    </div>
  )
}
