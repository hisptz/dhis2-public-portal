import React from 'react'
import "./main.css";
import "./output.css";
import {createHashHistory, createRouter, RouterProvider} from "@tanstack/react-router";
import {routeTree} from "./routes.gen";


const hashHistory = createHashHistory();

const router = createRouter({routeTree, history: hashHistory});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
		interface Register {
				router: typeof router;
		}
}

const MyApp = () => (
		<RouterProvider router={router}/>
);
export default MyApp
