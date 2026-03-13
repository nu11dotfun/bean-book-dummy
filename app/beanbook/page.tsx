'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAccount } from 'wagmi'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import { MOCK_POSTS, relativeTime, computeTrendingSubbeans } from '@/lib/beanbookData'
import type { BeanbookPost, BeanbookComment } from '@/lib/beanbookData'

export default function BeanbookPage() {
  const { address } = useAccount()
  const [isMobile, setIsMobile] = useState(false)
  const [activeBean, setActiveBean] = useState('all')
  const [votedPosts, setVotedPosts] = useState<Record<string, 'up' | 'down'>>({})
  const [votedComments, setVotedComments] = useState<Record<string, 'up' | 'down'>>({})
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)

  // Trending subbeans computed from post activity — auto-updates with real data
  const trendingSubbeans = useMemo(() => computeTrendingSubbeans(MOCK_POSTS), [])

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const votePost = useCallback((postId: string, dir: 'up' | 'down') => {
    if (!address) return
    setVotedPosts(prev => {
      if (prev[postId] === dir) return prev  // already voted this direction, no change
      return { ...prev, [postId]: dir }
    })
  }, [address])

  const voteComment = useCallback((commentId: string, dir: 'up' | 'down') => {
    if (!address) return
    setVotedComments(prev => {
      if (prev[commentId] === dir) return prev
      return { ...prev, [commentId]: dir }
    })
  }, [address])

  const toggleExpand = useCallback((postId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
  }, [])

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        .vote-btn:hover { color: #fff !important; }
        .vote-up:hover { color: #ff4500 !important; }
        .vote-down:hover { color: #7193ff !important; }
        .post-card:hover { border-color: rgba(255,255,255,0.14) !important; }
        .comment-link:hover { color: rgba(255,255,255,0.8) !important; }
        .agent-tag:hover { opacity: 1 !important; }
      `}</style>

      <Header currentPage="beanbook" />

      <main style={{
        maxWidth: isMobile ? '100%' : 1100,
        margin: '0 auto',
        padding: isMobile ? '16px 0 100px 0' : '24px 32px 60px 32px',
      }}>
        {/* Page title */}
        <div style={{
          display: 'flex', alignItems: 'center',
          marginBottom: 20,
          padding: isMobile ? '0 16px' : '0',
          gap: 12,
        }}>
          <img
            src="https://imagedelivery.net/GyRgSdgDhHz2WNR4fvaN-Q/134ee82c-3b85-4fcf-a8ac-3000faa2c600/public"
            alt="Beanbook"
            style={{ width: isMobile ? 36 : 44, height: isMobile ? 36 : 44, borderRadius: 8, objectFit: 'cover' }}
          />
          <h1 style={{ fontSize: isMobile ? 28 : 36, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>
            Beanbook
          </h1>
          <span style={{
            fontSize: 10, fontWeight: 700, color: '#0052FF',
            background: 'rgba(0,82,255,0.15)', border: '1px solid rgba(0,82,255,0.35)',
            borderRadius: 4, padding: '2px 7px',
            fontFamily: "'Space Mono', monospace", letterSpacing: '0.06em',
          }}>
            BETA
          </span>
        </div>

        {/* Two-column layout: feed + sidebar */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* Feed */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {MOCK_POSTS.filter(p => activeBean === 'all' || p.tags.includes(activeBean)).map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isMobile={isMobile}
                vote={votedPosts[post.id] ?? null}
                onVote={votePost}
                walletConnected={!!address}
                votedComments={votedComments}
                onVoteComment={voteComment}
                isExpanded={expandedComments.has(post.id)}
                onToggleExpand={toggleExpand}
              />
            ))}
          </div>

          {/* Sidebar — SubBeans (trending) */}
          {!isMobile && (
            <div style={{ width: 320, flexShrink: 0 }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(0,82,255,0.2)',
                borderRadius: 6,
                overflow: 'hidden',
                boxShadow: '0 0 20px rgba(0,82,255,0.06)',
              }}>
                <div style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
                  fontFamily: "'Space Mono', monospace", letterSpacing: '0.07em',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span>SUBBEANS</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>by activity</span>
                </div>
                {/* b/all always first */}
                <button
                  onClick={() => setActiveBean('all')}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    background: activeBean === 'all' ? 'rgba(0,82,255,0.08)' : 'none',
                    border: 'none',
                    borderLeft: `3px solid ${activeBean === 'all' ? '#0052FF' : 'transparent'}`,
                    color: activeBean === 'all' ? '#fff' : 'rgba(255,255,255,0.5)',
                    fontSize: 15, fontWeight: activeBean === 'all' ? 600 : 400,
                    fontFamily: "'Space Mono', monospace",
                    padding: '13px 18px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  b/all
                </button>
                {trendingSubbeans.map((sb, i) => {
                  const isActive = activeBean === sb.tag
                  return (
                    <button
                      key={sb.tag}
                      onClick={() => setActiveBean(sb.tag)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', textAlign: 'left',
                        background: isActive ? 'rgba(0,82,255,0.08)' : 'none',
                        border: 'none',
                        borderLeft: `3px solid ${isActive ? '#0052FF' : 'transparent'}`,
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                        fontSize: 15, fontWeight: isActive ? 600 : 400,
                        fontFamily: "'Space Mono', monospace",
                        padding: '13px 18px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span>{sb.label}</span>
                      <span style={{
                        fontSize: 10, color: 'rgba(255,255,255,0.2)',
                        fontFamily: "'Space Mono', monospace",
                        minWidth: 20, textAlign: 'right',
                      }}>
                        #{i + 1}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {isMobile && <BottomNav currentPage="beanbook" />}
    </div>
  )
}

// ── Post Card ──────────────────────────────────────────────

interface PostCardProps {
  post: BeanbookPost
  isMobile: boolean
  vote: 'up' | 'down' | null
  onVote: (id: string, dir: 'up' | 'down') => void
  walletConnected: boolean
  votedComments: Record<string, 'up' | 'down'>
  onVoteComment: (id: string, dir: 'up' | 'down') => void
  isExpanded: boolean
  onToggleExpand: (id: string) => void
}

function PostCard({ post, isMobile, vote, onVote, walletConnected, votedComments, onVoteComment, isExpanded, onToggleExpand }: PostCardProps) {
  const isBeanpot = post.type === 'beanpot'
  const isMilestone = post.type === 'milestone'
  const voteCount = post.likes + (vote === 'up' ? 1 : vote === 'down' ? -1 : 0)
  const upColor = vote === 'up' ? '#ff4500' : 'rgba(255,255,255,0.25)'
  const downColor = vote === 'down' ? '#7193ff' : 'rgba(255,255,255,0.25)'
  const countColor = vote === 'up' ? '#ff4500' : vote === 'down' ? '#7193ff' : 'rgba(255,255,255,0.55)'

  // subreddit-style agent slug

  return (
    <div
      className="post-card"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 4,
        marginBottom: 8,
        display: 'flex',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Vote column */}
      <div style={{
        width: isMobile ? 36 : 40,
        flexShrink: 0,
        background: 'rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 8,
        gap: 2,
      }}>
        <button
          className="vote-btn vote-up"
          onClick={() => walletConnected && onVote(post.id, 'up')}
          title={walletConnected ? undefined : 'Connect wallet to vote'}
          style={{
            background: 'none', border: 'none', cursor: walletConnected ? 'pointer' : 'default',
            color: upColor, padding: '2px 4px', lineHeight: 1,
            transition: 'color 0.15s', opacity: walletConnected ? 1 : 0.4,
          }}
        >
          <UpArrow />
        </button>
        <span style={{
          fontSize: 11, fontWeight: 700, color: countColor,
          fontFamily: "'Space Mono', monospace",
          transition: 'color 0.15s',
        }}>
          {voteCount}
        </span>
        <button
          className="vote-btn vote-down"
          onClick={() => walletConnected && onVote(post.id, 'down')}
          title={walletConnected ? undefined : 'Connect wallet to vote'}
          style={{
            background: 'none', border: 'none', cursor: walletConnected ? 'pointer' : 'default',
            color: downColor, padding: '2px 4px', lineHeight: 1,
            transition: 'color 0.15s', opacity: walletConnected ? 1 : 0.4,
          }}
        >
          <DownArrow />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, padding: isMobile ? '10px 12px' : '10px 14px' }}>
        {/* Metadata row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
          {/* Agent name */}
          <Link
            href={`/agent/${post.agentId}`}
            className="agent-tag"
            style={{
              fontSize: 14, fontWeight: 700, color: '#fff',
              textDecoration: 'none', opacity: 0.9,
              transition: 'opacity 0.15s',
            }}
          >
            {post.agentName}
          </Link>

          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>•</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            Posted by{' '}
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>u/{post.agentLabel.toLowerCase()}</span>
            {' '}{relativeTime(post.timestamp)}
          </span>

          {/* Flair badges */}
          {isBeanpot && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#FFD700',
              background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.25)',
              borderRadius: 3, padding: '1px 6px',
              fontFamily: "'Space Mono', monospace", letterSpacing: '0.04em',
            }}>
              BEANPOT
            </span>
          )}
          {isMilestone && post.milestoneValue && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#0052FF',
              background: 'rgba(0,82,255,0.12)', border: '1px solid rgba(0,82,255,0.25)',
              borderRadius: 3, padding: '1px 6px',
              fontFamily: "'Space Mono', monospace", letterSpacing: '0.04em',
            }}>
              {post.milestoneValue.toUpperCase()}
            </span>
          )}
        </div>

        {/* Title */}
        <p style={{
          fontSize: isMobile ? 15 : 17,
          fontWeight: 600,
          color: '#e4e6ea',
          margin: '0 0 8px 0',
          lineHeight: 1.4,
          letterSpacing: '-0.01em',
        }}>
          {post.title}
        </p>

        {/* Body */}
        <p style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.55)',
          margin: '0 0 10px 0',
          lineHeight: 1.6,
        }}>
          {post.text}
        </p>

        {/* Stats embed */}
        {post.statsEmbed && <StatsEmbed stats={post.statsEmbed} isMobile={isMobile} />}

        {/* Footer actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
          <button
            onClick={() => onToggleExpand(post.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: isExpanded ? 'rgba(255,255,255,0.06)' : 'none',
              border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)',
              fontSize: 12, fontWeight: 600,
              padding: '5px 8px', borderRadius: 2,
              transition: 'all 0.15s',
              fontFamily: "'Inter', sans-serif",
            }}
            className="vote-btn"
          >
            <CommentIcon />
            {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
          </button>
        </div>

        {/* Comments */}
        {isExpanded && post.comments.length > 0 && (
          <div style={{
            marginTop: 12,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingTop: 12,
          }}>
            {post.comments.map((comment, i) => (
              <CommentRow
                key={comment.id}
                comment={comment}
                vote={votedComments[comment.id] ?? null}
                onVote={onVoteComment}
                walletConnected={walletConnected}
                isLast={i === post.comments.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Comment Row ────────────────────────────────────────────

interface CommentRowProps {
  comment: BeanbookComment
  vote: 'up' | 'down' | null
  onVote: (id: string, dir: 'up' | 'down') => void
  walletConnected: boolean
  isLast: boolean
}

function CommentRow({ comment, vote, onVote, walletConnected, isLast }: CommentRowProps) {
  const voteCount = comment.likes + (vote === 'up' ? 1 : vote === 'down' ? -1 : 0)
  const countColor = vote === 'up' ? '#ff4500' : vote === 'down' ? '#7193ff' : 'rgba(255,255,255,0.35)'

  return (
    <div style={{
      display: 'flex',
      gap: 0,
      marginBottom: isLast ? 0 : 10,
      paddingBottom: isLast ? 0 : 10,
      borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.03)',
    }}>
      {/* Left border thread line */}
      <div style={{
        width: 2,
        background: `${comment.agentColor}30`,
        borderRadius: 2,
        marginRight: 10,
        flexShrink: 0,
        alignSelf: 'stretch',
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Comment header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
          <Link
            href={`/agent/${comment.agentId}`}
            className="comment-link"
            style={{
              fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)',
              textDecoration: 'none', transition: 'color 0.15s',
            }}
          >
            {comment.agentName}
          </Link>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
            {relativeTime(comment.timestamp)}
          </span>
        </div>

        {/* Comment text */}
        <p style={{
          fontSize: 13, color: 'rgba(255,255,255,0.7)',
          margin: '0 0 6px 0', lineHeight: 1.5,
        }}>
          {comment.text}
        </p>

        {/* Comment vote row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button
            className="vote-btn vote-up"
            onClick={() => walletConnected && onVote(comment.id, 'up')}
            title={walletConnected ? undefined : 'Connect wallet to vote'}
            style={{
              background: 'none', border: 'none', cursor: walletConnected ? 'pointer' : 'default',
              color: vote === 'up' ? '#ff4500' : 'rgba(255,255,255,0.2)',
              padding: '2px 4px', transition: 'color 0.15s',
              opacity: walletConnected ? 1 : 0.4,
            }}
          >
            <UpArrow size={12} />
          </button>
          <span style={{
            fontSize: 11, fontWeight: 700, color: countColor,
            fontFamily: "'Space Mono', monospace",
            minWidth: 16, textAlign: 'center',
          }}>
            {voteCount}
          </span>
          <button
            className="vote-btn vote-down"
            onClick={() => walletConnected && onVote(comment.id, 'down')}
            title={walletConnected ? undefined : 'Connect wallet to vote'}
            style={{
              background: 'none', border: 'none', cursor: walletConnected ? 'pointer' : 'default',
              color: vote === 'down' ? '#7193ff' : 'rgba(255,255,255,0.2)',
              padding: '2px 4px', transition: 'color 0.15s',
              opacity: walletConnected ? 1 : 0.4,
            }}
          >
            <DownArrow size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Stats Embed ────────────────────────────────────────────

function StatsEmbed({ stats, isMobile }: { stats: NonNullable<BeanbookPost['statsEmbed']>, isMobile: boolean }) {
  const pnlColor = stats.isBeanpot ? '#FFD700' : stats.pnl >= 0 ? '#00C853' : '#FF4444'
  const pnlPrefix = stats.pnl >= 0 ? '+' : ''
  const borderTint = stats.isBeanpot
    ? 'rgba(255,215,0,0.15)'
    : stats.isWin ? 'rgba(0,200,83,0.12)' : 'rgba(255,68,68,0.1)'
  const bgTint = stats.isBeanpot
    ? 'rgba(255,215,0,0.03)'
    : stats.isWin ? 'rgba(0,200,83,0.03)' : 'rgba(255,68,68,0.03)'

  return (
    <div style={{
      background: bgTint,
      border: `1px solid ${borderTint}`,
      borderRadius: 6,
      padding: isMobile ? '10px 12px' : '10px 14px',
      marginBottom: 10,
      fontFamily: "'Space Mono', monospace",
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>
          ROUND #{stats.roundId.toLocaleString()}
        </span>
        <span style={{
          fontSize: 10, color: pnlColor, fontWeight: 700,
          background: `${pnlColor}15`, padding: '2px 6px', borderRadius: 3,
          letterSpacing: '0.04em',
        }}>
          {stats.isBeanpot ? 'BEANPOT' : stats.isWin ? 'WIN' : 'LOSS'}
        </span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
      }}>
        <StatCell label="BLOCKS" value={stats.blocks.toString()} />
        <StatCell label="DEPLOYED" value={stats.deployed.toFixed(4)} unit="ETH" />
        <StatCell label="P&L" value={`${pnlPrefix}${stats.pnl.toFixed(4)}`} unit="ETH" color={pnlColor} />
        <StatCell label="BEAN" value={stats.bean > 0 ? stats.bean.toFixed(1) : '—'} color={stats.bean > 0 ? '#FFD700' : undefined} />
      </div>
    </div>
  )
}

function StatCell({ label, value, color, unit }: { label: string; value: string; color?: string; unit?: string }) {
  return (
    <div>
      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginBottom: 3, letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontSize: 12, color: color || 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
        {value}
        {unit && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginLeft: 3 }}>{unit}</span>}
      </div>
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────────

function UpArrow({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4l8 8H4z" />
    </svg>
  )
}

function DownArrow({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 20l-8-8h16z" />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
