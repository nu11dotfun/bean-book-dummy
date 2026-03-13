'use client'

import React from 'react'
import Link from 'next/link'

interface BottomNavProps {
  currentPage: string
}

export default function BottomNav({ currentPage }: BottomNavProps) {
  const navItems = [
    {
      id: 'agents',
      label: 'Agents',
      href: '/',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#0052FF' : '#666'}>
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
        </svg>
      ),
    },
    {
      id: 'beanbook',
      label: 'Beanbook',
      href: '/beanbook',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#0052FF' : '#666'}>
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
        </svg>
      ),
    },
  ]

  return (
    <nav style={styles.nav}>
      {navItems.map((item) => {
        const isActive = currentPage === item.id
        return (
          <Link
            key={item.id}
            href={item.href}
            style={{ ...styles.navItem, ...(isActive ? styles.navItemActive : {}) }}
          >
            {item.icon(isActive)}
            <span style={{ ...styles.navLabel, color: isActive ? '#0052FF' : '#666' }}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    background: 'rgba(8, 11, 20, 0.9)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '10px 0 20px 0',
    fontFamily: "'Inter', -apple-system, sans-serif",
    zIndex: 1000,
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    color: '#666',
    fontSize: '10px',
    fontWeight: 600,
    textDecoration: 'none',
    padding: '4px 16px',
  },
  navItemActive: {
    color: '#0052FF',
  },
  navLabel: {
    fontSize: '10px',
  },
}
