import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { monadTestnet } from "viem/chains";

// External payer wallets (MetaMask et al, ADR-0004). Injected only: no
// WalletConnect modal, no vendor. The pay screen mounts this; the dashboard
// keeps Privy and never sees wagmi.
export const externalWalletConfig = createConfig({
	chains: [monadTestnet],
	connectors: [injected()],
	transports: {
		[monadTestnet.id]: http(),
	},
});
