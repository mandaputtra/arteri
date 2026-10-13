# Arteri

**Approved. Paid.** Instant USDC payments for freelancers — send a link, your client pays,
the money is yours in about a second. Built for the Monad Metropolis hackathon
(Track 02, Consumer Products & Payments).

## How it works

1. Sign up with a social login, email, or Face ID — a wallet is created for you, no seed phrase.
2. Create a payment request (amount + description) and share the link anywhere.
3. Your client opens the link, sees who is asking for how much and why, and picks how to pay:
   - **By card** — through the fiat checkout; the relayer pays the freelancer from its USDC
     float, so the payer needs no wallet and no gas (`docs/adr/0002-fiat-card-checkout.md`,
     `docs/adr/0003-mercuryo-card-leg.md`).
   - **By wallet** — their own injected wallet (MetaMask et al) sends USDC directly to the
     freelancer, gas paid from their own MON (`docs/adr/0004-external-wallets-own-funds.md`),
     or the Privy embedded wallet as a fallback.
4. The balance updates live in dollars, and received payments appear in an activity list.
5. Cash out is **simulated**: the screen is labelled as a demo, no bank is connected, and
   no funds move. No real off-ramp ships.

No escrow contract holds money — payments move directly wallet to wallet. The reference
architecture this product draws on is a different, escrow-based design, kept unmodified as a
source document: [`docs/getpaidnow-architecture.md`](docs/getpaidnow-architecture.md).

## Run it

Prerequisites: [pnpm](https://pnpm.io) 10+ and Node 22+.

```bash
git clone https://github.com/mandaputtra/arteri
cd arteri/app
pnpm install
cp ../.env.example .env      # then fill in VITE_PRIVY_APP_ID
pnpm dev                     # app on http://localhost:3101
```

That is enough to sign in, see your balance, and create a payment link. To watch a
payment actually land you also need the top-up service in a second terminal:

```bash
pnpm relayer                 # top-up + card-settle service on :8791
```

The relayer's short-link, history, and card routes read `DATABASE_URL`. Without it those
routes answer 503 (long, self-describing links and the wallet path still work). For the
full loop, run a local Postgres and point the relayer at it:

```bash
docker compose -f docker-compose.db.yml up -d
echo 'DATABASE_URL=postgres://arteri:arteri@localhost:5434/arteri' >> .env
```

You need three things to demo the full loop:

1. **`VITE_PRIVY_APP_ID`** from [dashboard.privy.io](https://dashboard.privy.io). Enable the
   login methods you want (email, Google, Apple, GitHub) and add
   `http://localhost:3101` as an allowed origin, or sign-in will fail.
2. **Testnet USDC in two wallets** — yours and your payer's. Circle's faucet
   (<https://faucet.circle.com>, Monad Testnet) releases 20 USDC per address every 2 hours.
3. **Testnet MON and USDC in the relayer wallet** for gas and the float. The Monad faucet is
   at <https://faucet.monad.xyz>. Top-ups drip 0.05 MON plus 2 USDC per call, capped per
   address, so a zero-balance wallet can pay from the wallet path with no faucet visit.
   The top-up itself is `POST /topup` on the relayer; there is no in-app button yet.

| Variable | Where it runs | Purpose |
|---|---|---|
| `VITE_PRIVY_APP_ID` | browser | Privy project ID. Public by design. |
| `VITE_RELAYER_URL` | browser, build-time | Relayer base URL. Leave empty locally; defaults to `http://localhost:8791`. On Fly it is a build arg, e.g. `https://arteri-relayer.fly.dev`. |
| `RELAYER_PRIVATE_KEY` | **relayer only** | Hot wallet funding top-ups and the card float. Never reaches the browser. |
| `DATABASE_URL` | **relayer only** | Postgres for short links, users, history, and card checkouts. Optional: without it those routes 503. |
| `ALLOWED_ORIGIN` | **relayer only** | Pins the relayer's CORS to the app origin in production. Unset locally. |

Checks: `pnpm test` (unit tests) · `pnpm typecheck` · `pnpm check` (biome) · `pnpm build`
(SSR bundle, then `pnpm start` to serve it).

## Architecture

- **Stack:** TanStack Start (SSR) · Router · Query · Tailwind v4 · Privy embedded wallets ·
  wagmi (injected wallets) · viem.
- **Token:** USDC on Monad testnet
  (`0x534b2f3A21130d7a60830c2Df862319e593943A3`).
- **Two payment paths:** card (relayer float, custodial) and wallet (direct transfer,
  non-custodial). Money map: [`docs/money-flows.md`](docs/money-flows.md).
- **Top-up:** `POST /topup` on the relayer drips MON (gas) plus USDC, capped per address,
  because Monad rejects zero-balance senders and the Agora faucet is drained — documented in
  [`docs/gas-for-new-wallets.md`](docs/gas-for-new-wallets.md). No in-app button yet.
- **Payment links:** off-chain signed invoice `{to, amount, nonce, expiry}`, verified with
  EIP-712 before any signing prompt. No payment contract (see
  [`docs/adr/0001-offchain-invoices-no-escrow.md`](docs/adr/0001-offchain-invoices-no-escrow.md)).
- **Two Fly apps** in production: `arteri` (app) and `arteri-relayer` (top-up, card settle,
  and the `/api` routes on their own CORS-pinned origin).

Key docs: [`AGENTS.md`](AGENTS.md) (stack, commands, gotchas) ·
[`CONTEXT.md`](CONTEXT.md) (glossary) ·
[`docs/compliance-checklist.md`](docs/compliance-checklist.md) (submission gates) ·
[`docs/bounty-checklist.md`](docs/bounty-checklist.md) ·
[`docs/deploy-fly.md`](docs/deploy-fly.md) ·
[`docs/demo-script.md`](docs/demo-script.md) ·
[`docs/manual-review.md`](docs/manual-review.md) · [`docs/`](docs/).

## AI tools and hackathon disclosure

Per the Metropolis Terms & Conditions §4.1.4: **this project was built with AI coding tools.**
An AI assistant (Claude, GPT-5-class models) did the research, implementation, test-writing,
code review, and documentation under the author's direction, and every change was reviewed
before commit.

The agents were held to verifying their own work by running the product rather than reading
it. Several real defects were caught that way: a 502 from a relayer that never loaded `.env`,
a confirmation animation stuck at zero opacity, and a replay-protection window wider than the
RPC permits. All code is published for review under [MIT](LICENSE).

- Submission deadline **13 Oct 2026, 11:59 PM ET**; demo video capped at **3 minutes**.
- Full eligibility, registration, and evidence checklist: GitHub issue
  [#10](https://github.com/mandaputtra/arteri/issues/10).
