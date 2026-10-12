# ADR 0004: External wallets pay from their own funds

Date: 2026-10-12. Status: accepted.

## Context

The pay screen serves two payer kinds: card (relayer float, ADR-0002) and
wallet (payer's own USDC). The wallet path only accepts the Privy embedded
wallet, so a payer arriving with MetaMask holding USDC cannot pay. The
payment code already speaks EIP-1193 (`createWalletClient` + provider in
`payRequest`); only the provider source is Privy-bound.

## Decision

Accept any injected EIP-1193 wallet (MetaMask et al, EIP-6963 discovery via
wagmi) on the pay screen. The external payer pays from their own USDC and
holds their own MON for gas — same as any dapp, no sponsorship. Privy stays
as fallback; intent verification (signature, expiry, replay scan) is
unchanged and payer-agnostic.

## Alternatives

- **Relayer-sponsored gas for external payers**: needs 7702/4337/paymaster
  infrastructure; `docs/gas-for-new-wallets.md` rejected this for scope.
- **MetaMask-only allowlist**: same interface underneath, excludes
  Rabby/Coinbase for no technical reason.
- **WalletConnect**: mobile-QR value, but another dependency + modal;
  demo is desktop-first. Revisit if mobile payers appear.

## Consequences

- A 0-MON external payer hits `Signer had insufficient balance` with no
  recourse in-app; the copy must say "you need testnet MON" plainly, not
  jargon.
- Local nonce ledger + receipts are per-browser: switching wallets mid-flow
  loses the local already-paid hint, but the on-chain scan (the authority)
  still catches it.
- `privy-user.ts` ("embedded wallet only") stays true for the dashboard;
  the pay screen gets its own provider source.
