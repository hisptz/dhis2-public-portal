import { createLazyFileRoute } from "@tanstack/react-router"

export const Route = createLazyFileRoute(
  "/library/_provider/$libraryId/_formProvider/edit/",
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/library/_provider/$libraryId/_formProvider/edit/"!</div>
}
