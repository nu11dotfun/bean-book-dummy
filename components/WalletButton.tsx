'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState, useRef, useEffect } from 'react'
import { useBalance, useDisconnect } from 'wagmi'

export default function WalletButton() {
  const [isOpen, setIsOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  const { disconnect } = useDisconnect()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current && !popupRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mouseup', handleClickOutside)
    return () => document.removeEventListener('mouseup', handleClickOutside)
  }, [])

  return (
    <div style={{ position: 'relative', zIndex: 9999 }} ref={buttonRef}>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openConnectModal,
          openChainModal,
          mounted,
        }) => {
          const ready = mounted
          const connected = ready && account && chain

          if (!connected) {
            return (
              <button onClick={openConnectModal} style={styles.connectButton}>
                Connect Wallet
              </button>
            )
          }

          if (chain?.unsupported) {
            return (
              <button onClick={openChainModal} style={styles.wrongNetwork}>
                Wrong network
              </button>
            )
          }

          return (
            <>
              <button
                onClick={() => setIsOpen(!isOpen)}
                style={styles.accountButton}
              >
                <div style={styles.headerPfpPlaceholder}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#999" stroke="none">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                </div>
                {account.displayName}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  style={{
                    marginLeft: '6px',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                >
                  <path
                    d="M2.5 4.5L6 8L9.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {isOpen && (
                <WalletPopup
                  address={account.address}
                  displayName={account.displayName}
                  popupRef={popupRef}
                  onClose={() => setIsOpen(false)}
                  onDisconnect={() => { setIsOpen(false); disconnect() }}
                />
              )}
            </>
          )
        }}
      </ConnectButton.Custom>
    </div>
  )
}

function WalletPopup({
  address,
  displayName,
  popupRef,
  onClose,
  onDisconnect,
}: {
  address: string
  displayName: string
  popupRef: React.RefObject<HTMLDivElement | null>
  onClose: () => void
  onDisconnect: () => void
}) {
  const { data: ethBalance } = useBalance({
    address: address as `0x${string}`,
  })

  return (
    <div style={styles.popup} ref={popupRef}>
      <div style={styles.profileHeader}>
        <div style={styles.profileLeft}>
          <div style={styles.popupPfpPlaceholder}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#999" stroke="none">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
          <div style={styles.profileInfo}>
            <span style={styles.profileName}>{displayName}</span>
            <span style={styles.profileAddress}>{displayName}</span>
          </div>
        </div>
        <button onClick={onClose} style={styles.closeButton}>
          ✕
        </button>
      </div>

      <div style={styles.ethSection}>
        <span style={styles.ethLabel}>ETH Balance</span>
        <span style={styles.ethValue}>
          {ethBalance ? parseFloat(ethBalance.formatted).toFixed(4) : '0.0000'} ETH
        </span>
      </div>

      <button onClick={onDisconnect} style={styles.disconnectButton}>
        Disconnect
      </button>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  connectButton: {
    background: '#0052FF',
    border: '1px solid #444',
    color: '#fff',
    fontWeight: 500,
    padding: '8px 16px',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  wrongNetwork: {
    background: '#ff4444',
    border: 'none',
    color: '#fff',
    fontWeight: 500,
    padding: '8px 16px',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  accountButton: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px)',
    color: '#fff',
    fontWeight: 500,
    padding: '6px 14px 6px 8px',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },
  headerPfpPlaceholder: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: '#222',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popup: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    width: '320px',
    background: '#0a0a0a',
    border: '1px solid #222',
    borderRadius: '16px',
    padding: '20px',
    zIndex: 1000,
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
  },
  profileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  profileLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  popupPfpPlaceholder: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: '#1a1a1a',
    border: '2px solid #222',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  profileName: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#fff',
  },
  profileAddress: {
    fontSize: '12px',
    color: '#999',
    fontFamily: 'monospace',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: '#999',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px',
  },
  ethSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    background: '#111',
    borderRadius: '10px',
    marginBottom: '16px',
  },
  ethLabel: {
    fontSize: '13px',
    color: '#bbb',
  },
  ethValue: {
    fontSize: '13px',
    color: '#fff',
    fontFamily: 'monospace',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  disconnectButton: {
    width: '100%',
    background: '#111',
    border: '1px solid #222',
    color: '#999',
    fontWeight: 500,
    padding: '10px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s ease',
  },
}
