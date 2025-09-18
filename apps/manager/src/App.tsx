import React from "react";
import "./main.css";
import "./output.css";
import {
	createHashHistory,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { routeTree } from "./routes.gen";
import { DialogProvider } from "@hisptz/dhis2-ui";
import "leaflet/dist/leaflet.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const hashHistory = createHashHistory();

const router = createRouter({ routeTree, history: hashHistory });


// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: false,
			retryDelay: 0,
			refetchInterval: false,
		},
	},
});

const MyApp = () => (
	<QueryClientProvider client={queryClient}>
		<DialogProvider>
			<RouterProvider router={router} />
		</DialogProvider>
	</QueryClientProvider>
);
export default MyApp;
