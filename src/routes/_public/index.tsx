import { createFileRoute, Link } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Image as ImageIcon,
  LineChart,
  Palette,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'

const heroStats = [
  { label: 'Faster launches', value: '6x' },
  { label: 'Unit cost drop', value: '84%' },
  { label: 'Avg. uplift', value: '+38% CTR' },
]

const featureHighlights: Array<{
  title: string
  description: string
  icon: LucideIcon
}> = [
  {
    title: 'Photorealistic quality',
    description:
      'Generate studio-ready flats, ghost mannequins, and lifestyle sets without coordinating a shoot.',
    icon: Sparkles,
  },
  {
    title: 'Brand-consistent styling',
    description:
      'Lock your palettes, lighting moods, and props so every SKU lands on-brand across channels.',
    icon: Palette,
  },
  {
    title: 'Retail-ready outputs',
    description:
      'Export instantly in the aspect ratios, backgrounds, and file specs your marketplaces demand.',
    icon: ImageIcon,
  },
]

const workflowSteps: Array<{
  title: string
  description: string
}> = [
  {
    title: 'Upload a garment snapshot',
    description:
      'Drop in a quick hanger shot or dressing-room selfie. Our cleanup AI removes wrinkles, shadows, and noise.',
  },
  {
    title: 'Pick a creative direction',
    description:
      'Choose from curated flat lay themes or build your own lookbooks with props, surfaces, and lighting presets.',
  },
  {
    title: 'Ship to every storefront',
    description:
      'Publish directly to Shopify, Amazon, Zalando, or export layered PSDs for your designers.',
  },
]

const HeroShowcase = () => {
  return (
    <div className="relative mt-16 flex flex-col gap-6 rounded-3xl border bg-card/80 p-8 shadow-lg shadow-primary/10 backdrop-blur">
      <Badge className="w-fit" variant="secondary">
        Before → After in seconds
      </Badge>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-dashed bg-muted/60 p-6">
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Input
          </span>
          <div className="mt-4 h-56 rounded-2xl bg-gradient-to-br from-slate-200 via-white to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800" />
          <p className="mt-4 text-sm text-muted-foreground">
            Quick mobile snapshot with creases, mixed lighting, and shadows.
          </p>
        </div>
        <div className="relative rounded-2xl border bg-background p-6">
          <span className="text-xs uppercase tracking-[0.3em] text-primary">
            Output
          </span>
          <div className="mt-4 h-56 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background">
            <div className="absolute right-6 top-10 h-32 w-32 rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute left-8 bottom-6 h-24 w-24 rounded-full bg-secondary/40 blur-2xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-40 rounded-[2rem] border border-white/40 bg-white/90 shadow-2xl shadow-primary/20 dark:bg-slate-900/80" />
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Styled flat lay with natural shadows, reflective highlights, and export-ready cropping.
          </p>
        </div>
      </div>
    </div>
  )
}

const LandingPage = () => {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden px-6 pb-20 pt-24 sm:px-12">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-transparent to-secondary/40" />
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-16 text-center lg:flex-row lg:items-start lg:text-left">
          <div className="flex-1 space-y-6">
            <Badge variant="outline" className="border-primary/40 text-primary">
              AI Merchandising Engine
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Transform simple garment snaps into premium product photography
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              Prodigi converts your raw garment shots into on-brand flats, ghost mannequins, and lifestyle images—so
              you can launch collections, refresh PDPs, and test creatives without waiting on the studio.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="group px-8 py-6 text-base">
                <Link to="/dashboard">
                  Start creating
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-primary/10 bg-background/80 p-4">
                  <p className="text-3xl font-semibold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <HeroShowcase />
          </div>
        </div>
      </section>

      <section className="bg-background px-6 py-20 sm:px-12">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary">Why brands choose Prodigi</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Deliver scroll-stopping visuals without the overhead
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Pair the precision of a creative director with the speed of automation. Every render learns from your
              brand playbook.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featureHighlights.map((feature) => (
              <Card key={feature.title} className="border-primary/10">
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-secondary/30 px-6 py-20 sm:px-12">
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <Badge variant="outline" className="border-primary/30 text-primary">
                Seamless workflow
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Designed for merchandising, growth, and creative teams
              </h2>
              <p className="text-lg text-muted-foreground">
                Prodigi automates the busywork—from retouching and backdrop swaps to channel-specific exports—so your
                team can focus on storytelling and conversion.
              </p>
              <div className="space-y-5">
                {workflowSteps.map((step, index) => {
                  const stepNumber = String(index + 1)
                  return (
                    <div
                      key={step.title}
                      className="flex gap-4 rounded-2xl border border-primary/10 bg-background/80 p-5"
                    >
                      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <span className="text-base font-semibold leading-none tabular-nums">{stepNumber}</span>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <Card className="border-primary/20">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Wand2 className="h-4 w-4" />
                    Auto-retouching pipeline
                  </div>
                  <h3 className="text-2xl font-semibold">
                    12 creative looks with every upload
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Instantly adapt your hero imagery for PDPs, paid social, and marketplaces with one-click variants.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <LineChart className="h-4 w-4" />
                    Creative intelligence
                  </div>
                  <h3 className="text-2xl font-semibold">
                    Learn what imagery converts fastest
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Prodigi benchmarks every render against campaign performance to recommend top-performing looks.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

export const Route = createFileRoute('/_public/')({
  component: LandingPage,
  staticData: {
    title: 'Prodigi · AI Product Photography',
  },
})
