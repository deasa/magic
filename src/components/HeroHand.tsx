import { LogoMark } from './Logo'
import { CoinIcon, PulseCardIcon } from './icons'

/** Decorative fanned hand of three cards for the hero. */
export function HeroHand() {
  return (
    <div className="hand" aria-hidden="true">
      <div className="hand-card hand-card-left accent-gold">
        <div className="hand-card-cost">
          <span className="pip pip-g" />
          <span className="pip pip-w" />
        </div>
        <div className="hand-card-art">
          <CoinIcon size={44} />
        </div>
        <div className="hand-card-type">Sorcery · Budget</div>
        <div className="hand-card-lines">
          <span /> <span /> <span className="short" />
        </div>
        <div className="hand-card-foot">$0.25</div>
      </div>
      <div className="hand-card hand-card-right accent-teal">
        <div className="hand-card-cost">
          <span className="pip pip-u" />
          <span className="pip pip-u" />
        </div>
        <div className="hand-card-art">
          <PulseCardIcon size={44} />
        </div>
        <div className="hand-card-type">Instant · Checkup</div>
        <div className="hand-card-lines">
          <span /> <span className="short" /> <span />
        </div>
        <div className="hand-card-foot">99 / 99</div>
      </div>
      <div className="hand-card hand-card-center accent-violet">
        <div className="hand-card-cost">
          <span className="pip pip-w" />
          <span className="pip pip-u" />
          <span className="pip pip-b" />
          <span className="pip pip-r" />
          <span className="pip pip-g" />
        </div>
        <div className="hand-card-art hand-card-art-hero">
          <LogoMark size={88} />
        </div>
        <div className="hand-card-type">Legendary · Commander</div>
        <div className="hand-card-lines">
          <span /> <span /> <span className="short" />
        </div>
        <div className="hand-card-foot">1 of 100</div>
      </div>
      <span className="spark spark-1" />
      <span className="spark spark-2" />
      <span className="spark spark-3" />
    </div>
  )
}
