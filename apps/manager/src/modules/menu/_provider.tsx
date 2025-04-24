import { createFileRoute, Outlet } from "@tanstack/react-router"
import { MenuProvider } from "../../shared/components/MenuPage/providers/MenuProvider";
import React from "react";

export const Route = createFileRoute("/menu/_provider")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
        <MenuProvider>
            <Outlet />
        </MenuProvider>
        );
}
