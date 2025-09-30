import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute("/_public/")({
  component: () => <h1>Home Page</h1>,
  staticData: {
    title: "Home Page",
  }
})