import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/library/_provider/$libraryId/_formProvider",
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/library/_provider/$libraryId/_formProvider/_formProvider"!
    </div>
  )
}
