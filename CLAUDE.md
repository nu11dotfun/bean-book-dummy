# MineBean Agent Marketplace — `bean-agent-test`

## Purpose
Agent Marketplace for BEAN Protocol. Users browse AI mining agents, view live stats
pulled from the minebean API, and (future) invest in them.
Standalone project — not the main production site.

## Project location
- This project: ~/Desktop/bean-agent-test
- Main site (read-only reference): ~/Desktop/beans-finance-latest

## Rules
- **Branding: "MineBean"** — The project/protocol is called **MineBean**, never "BEANS Protocol". Use "MineBean" in all UI text, modals, disclaimers, and copy.
- **No API routes / no serverless** — ALL data fetching is client-side `fetch()` only.
  No `/app/api/` routes. No Next.js server actions. This is a hard rule.
- **No Supabase** — not used in this project at all.
- **Do not touch Header.tsx** unless explicitly asked — it mirrors the main site nav.
- Reference beans-finance-latest for styles/patterns but never modify it.

## Run
```bash
npm run dev   # localhost:3002 (3000 is main site)
```

## Tech stack
Next.js 16 / React 19 / TypeScript / wagmi v2 / RainbowKit v2 / Viem

---

## Data Architecture (Phase: Live Data)

### Data source
All data comes from **`https://api.minebean.com`** — public, no auth, no API keys.
Fetched client-side in React components/hooks.

### Agents
- **3 agents** (Anti-Winner, Hot-Blocks, Beanpot Hunter)
- Each agent has a `walletAddress` field — a real wallet currently mining on BEAN
- Agent wallet addresses will be swapped for actual agent-controlled wallets once agents go live
- Agent metadata (name, strategy, color, avatar) stays hardcoded in `lib/agents.ts`
- Agent stats (win rate, ROI, PnL, rounds played) are **computed client-side** from API data

### API endpoints used

| Endpoint | Purpose | Notes |
|---|---|---|
| `GET /api/user/:address/history?type=deploy&limit=50` | Rounds + roundResult + **totals** | Single call per agent, all-time stats in `totals` object |

**Key discovery:** When `type=deploy`, the history endpoint returns a `totals` object with
**all-time aggregated stats** — no pagination needed for summary data:
```json
"totals": {
  "totalETHWon": "...", "totalETHWonFormatted": "0.5",
  "totalBEANWon": "...", "totalBEANWonFormatted": "10000.0",
  "totalETHDeployed": "...", "totalETHDeployedFormatted": "2.0",
  "totalPNL": "-0.70000000",
  "beanPriceEth": "0.00008",
  "roundsPlayed": 75, "roundsWon": 12
}
```
- `totalPNL` = ethWon + (beanWon * beanPriceEth) - totalDeployed (uses live BEAN price)
- `beanPriceEth` = current BEAN/ETH from DexScreener (same as `/api/stats` priceNative)

Each history entry also includes `roundResult` inline:
`settled`, `wonWinningBlock`, `beanpotHit`, `ethWon/Formatted`, `beanWon/Formatted`, `pnl`.

**Grouping:** Entries are grouped by `roundId` in `lib/agentData.ts` —
deployed/won/beans values are summed, blockMasks are OR-merged.

### Stats approach
- **All-time stats** (winRate, ROI, PnL, deployed, BEAN earned): from `totals` — accurate, single call
- **Round history table + sparkline**: from page 1 history entries (most recent 50 rounds)
- **No pagination needed** — `totals` covers all rounds regardless of page

### Rate limiting
- Default: 60 req/min/IP
- **Strategy:** Only 3 API calls total on page load (1 per agent). No batching needed.

### Data flow
```
Page load → fetch history?type=deploy for all 3 agents in parallel (3 calls)
         → use totals for all-time stats (winRate, ROI, PnL)
         → group page-1 entries by roundId for round table + sparkline
         → render
```

---

## Key files

| File | Purpose |
|---|---|
| `app/page.tsx` | Main carousel/discovery page (3 agent cards) |
| `app/agent/[id]/page.tsx` | Individual agent profile (stats + chart + round history) |
| `app/layout.tsx` | Web3Provider wrapper |
| `lib/agents.ts` | 3 agents: metadata + wallet addresses (stats removed, fetched live) |
| `lib/agentData.ts` | Client-side fetch + compute functions for agent stats |
| `lib/api.ts` | API base URL + typed fetch wrapper |
| `lib/wagmi.ts` | wagmi config (Base mainnet) |
| `lib/providers.tsx` | WagmiProvider + QueryClient + RainbowKit |
| `components/Header.tsx` | Top nav bar (mirrors main site) |

## Design conventions
- Dark theme, `#080b14` background
- Primary blue: `#0052FF`
- Cards: `rgba(255,255,255,0.04)` glass + `1px solid rgba(255,255,255,0.08)`
- Neon glow borders: multi-layer `boxShadow` with blue rgba values
- Win: `#00C853`, Loss: `#FF4444`, Beanpot: `#FFD700`
- Font: Inter for body, Space Mono for data/numbers/labels
- All inline `React.CSSProperties` — no CSS modules or Tailwind
- Responsive via `isMobile` state (`window.innerWidth <= 768`)
- Viewport-locked layouts (`height: 100vh, overflow: hidden`)

## Contracts (Base mainnet, read-only reference)
- BEAN token: `0x5c72992b83E74c4D5200A8E8920fB946214a5A5D`
- GridMining: `0x9632495bDb93FD6B0740Ab69cc6c71C9c01da4f0`

## Team
- Damian — frontend
- nu11dotfun — backend, smart contracts, API
