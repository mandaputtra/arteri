import { createFileRoute } from "@tanstack/react-router";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PayRequest } from "../components/PayRequest";
import { externalWalletConfig } from "../lib/external-wallet";
import { displayFieldsFrom } from "../lib/request";

// wagmi needs its own QueryClient; the app shell owns another one for its own
// queries, so the pay route carries a local instance rather than sharing.
const payQueryClient = new QueryClient();
export const Route = createFileRoute("/pay/$slug")({
	component: PayRoute,
});

function PayRoute() {
	const { slug } = Route.useParams();
	// `d` is the requester's note and `from` is their name. Both are unsigned and
	// display-only: every payment term — recipient, token, amount, nonce, expiry —
	// comes from the signed blob and is verified before anything is payable.
	const { description, requesterName } = displayFieldsFrom(Route.useSearch());
	return (
		<WagmiProvider config={externalWalletConfig}>
			<QueryClientProvider client={payQueryClient}>
				<PayRequest
					slug={slug}
					description={description}
					requesterName={requesterName}
				/>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
