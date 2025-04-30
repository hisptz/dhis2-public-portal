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

const hashHistory = createHashHistory();

const router = createRouter({ routeTree, history: hashHistory });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const MyApp = () => (
	<DialogProvider>
		<RouterProvider router={router} />
	</DialogProvider>
);
export default MyApp;
