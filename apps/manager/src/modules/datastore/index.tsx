import { createFileRoute } from "@tanstack/react-router"
import React from "react"
import { DatastoreManagerPage } from "../../shared/components/DatastoreManagerPage"

export const Route = createFileRoute("/datastore/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <DatastoreManagerPage />
}
