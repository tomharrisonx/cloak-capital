import { ConnectButton } from '@rainbow-me/rainbowkit';
import '../styles/Header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <p className="brand-eyebrow">Confidential Fundraising</p>
          <h1 className="brand-title">Cloak Capital</h1>
          <p className="brand-subtitle">Secure contributions. Private amounts. Transparent outcomes.</p>
        </div>
        <div className="header-actions">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
