import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Arteri } from "./Arteri";

vi.mock("@privy-io/react-auth", () => ({
	usePrivy: () => ({ ready: true, authenticated: false, user: null }),
	useLogin: () => ({ login: () => {} }),
	useLogout: () => ({ logout: async () => {} }),
}));

// Guards the shell: the signed-out copy and the primary action must exist before any
// wallet does, and the marketing surface must stay free of jargon.
describe("Arteri shell", () => {
	it("renders the signed-out state with jargon-free copy", () => {
		const html = renderToStaticMarkup(createElement(Arteri));

		expect(html).toContain(
			"Easy dollar payments. No passwords, no crypto fuss.",
		);
		expect(html).toContain("Get started");
		expect(html).not.toMatch(
			/seed phrase|wallet address|gas|chainId|0x[a-f0-9]{6}/i,
		);
	});
});
