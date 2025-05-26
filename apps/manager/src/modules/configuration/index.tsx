import { createFileRoute } from "@tanstack/react-router"
import React from "react"
import { ConfigurationPage } from "../../shared/components/ConfigurationPage/ConfigurationPage"

export const Route = createFileRoute("/configuration/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <ConfigurationPage />
}
