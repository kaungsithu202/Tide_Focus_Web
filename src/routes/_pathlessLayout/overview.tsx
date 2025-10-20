import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_pathlessLayout/overview')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_pathlessLayout/overview"!</div>
}
