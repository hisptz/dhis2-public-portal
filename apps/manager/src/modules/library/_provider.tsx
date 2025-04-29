import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/library/_provider")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/library/_provide"!</div>
}
