import { createFileRoute } from "@tanstack/react-router"
import React from "react"
import { DatastoreManagerPage } from "../../shared/hooks/datastoreExportImport"

export const Route = createFileRoute("/datastore/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <DatastoreManagerPage />
}
