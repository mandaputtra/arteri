import { createFileRoute } from "@tanstack/react-router";
import { Arteri } from "../components/Arteri";

export const Route = createFileRoute("/")({
	component: function Home() {
		return <Arteri />;
	},
});
