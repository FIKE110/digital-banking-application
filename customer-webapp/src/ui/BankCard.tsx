import { useState } from 'react';
import Icon from './Icon';
import CopyButton from './CopyButton';
import { BANK_NAME } from '../config';

export interface BankCardView {
  id: string;
  last4: string;
  cardNumber?: string;
  cardholderName?: string;
  expiry?: string;
  status: string;
  type: string;
  accountName?: string;
}

export default function BankCard({ card }: { card: BankCardView }) {
  const [revealed, setRevealed] = useState(false);
  const frozen = card.status === 'FROZEN';

  return (
    <div className={`bank-card ${frozen ? 'bank-card--frozen' : ''} ${card.type === 'VIRTUAL' ? 'bank-card--virtual' : 'bank-card--physical'}`} style={{ ['--bank-brand' as string]: BANK_NAME }}>
      <div className="bank-card__top">
        <span className="bank-card__brand">{BANK_NAME.toUpperCase()}</span>
        <span className="badge" style={{ background: 'var(--color-nav-3)', color: 'var(--hero-text)', border: '1px solid var(--color-nav-hairline)' }}>
          {card.type === 'VIRTUAL' ? 'VIRTUAL' : 'PHYSICAL'}
        </span>
      </div>
      <div className="bank-card__chip" aria-hidden="true" />
      <div className="bank-card__number">
        {card.cardNumber ? (
          revealed ? (
            card.cardNumber.match(/.{1,4}/g)?.join(' ')
          ) : (
            <span className="bank-card__number--hidden">{card.cardNumber.match(/.{1,4}/g)?.join(' ') ?? '•••• •••• •••• ••••'}</span>
          )
        ) : (
          '•••• •••• •••• ' + card.last4
        )}
      </div>
      <div className="bank-card__bottom">
        <div>
          <div className="bank-card__meta-label">Card holder</div>
          <div className="bank-card__meta-value">{card.cardholderName ?? 'YOU'}</div>
        </div>
        <div>
          <div className="bank-card__meta-label">Expires</div>
          <div className="bank-card__meta-value">{card.expiry ?? '-'}</div>
        </div>
        <div className="row" style={{ gap: 6 }}>
          {card.cardNumber && (
            <button
              type="button"
              className="bank-card__reveal"
              onClick={() => setRevealed(v => !v)}
              aria-label={revealed ? 'Hide card number' : 'Reveal card number'}
            >
              <Icon name={revealed ? 'eyeOff' : 'eye'} size={14} />
            </button>
          )}
          {card.cardNumber && revealed && <CopyButton value={card.cardNumber} label="Copy" copiedLabel="Copied" />}
        </div>
      </div>
    </div>
  );
}
