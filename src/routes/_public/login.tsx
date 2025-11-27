import { useEffect, useRef, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Loader2, Lock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const LoginPage = () => {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authMode, setAuthMode] = useState<'sign_in' | 'sign_up'>('sign_in')
  const [formError, setFormError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [modeSwitching, setModeSwitching] = useState(false)
  const hasMounted = useRef(false)

  const formSchema = z.object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password is too long'),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (!isLoading && user) {
      void navigate({ to: '/dashboard', replace: true })
    }
  }, [isLoading, navigate, user])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setFormError(null)
    setStatusMessage(null)
    setIsSubmitting(true)

    const dashboardRedirectUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/dashboard`
        : undefined

    try {
      if (authMode === 'sign_in') {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        })
        if (error) {
          setFormError(error.message)
        } else {
          void navigate({ to: '/dashboard', replace: true })
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: dashboardRedirectUrl
            ? { emailRedirectTo: dashboardRedirectUrl }
            : undefined,
        })
        if (error) {
          setFormError(error.message)
        } else {
          setStatusMessage(
            'Account created. Please check your email to confirm your address.'
          )
          setAuthMode('sign_in')
          form.reset({ email: values.email, password: '' })
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleMode = () => {
    setAuthMode((prev) => (prev === 'sign_in' ? 'sign_up' : 'sign_in'))
    setFormError(null)
    setStatusMessage(null)
    form.clearErrors()
  }

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }
    setModeSwitching(true)
    const timer = setTimeout(() => setModeSwitching(false), 520)
    return () => clearTimeout(timer)
  }, [authMode])

  const auraStyle = {
    background:
      'radial-gradient(60% 60% at 15% 10%, rgba(59,130,246,0.28), transparent), radial-gradient(55% 55% at 85% 80%, rgba(14,165,233,0.2), transparent)',
  }

  const modeAnimationClass = modeSwitching
    ? 'scale-[1.015] -translate-y-1 rotate-[0.25deg] shadow-[0_20px_70px_-38px_rgba(59,130,246,0.6)]'
    : 'scale-100 translate-y-0 rotate-0 shadow-primary/10'

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-2xl border border-border/60 bg-card/90 p-8 shadow-2xl backdrop-blur transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${modeAnimationClass}`}
      >
        <div
          aria-hidden
          className={`pointer-events-none absolute -inset-16 blur-3xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            modeSwitching ? 'opacity-60 scale-105 rotate-0' : 'opacity-0 scale-95 rotate-2'
          }`}
          style={auraStyle}
        />
        <div className="relative space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-primary">
              Prodigi
            </p>
            <h1
              className={`text-2xl font-semibold tracking-tight transition-all duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                modeSwitching ? 'opacity-100 -translate-y-1 scale-[1.01]' : 'opacity-100 translate-y-0 scale-100'
              }`}
            >
              {authMode === 'sign_in' ? 'Sign in' : 'Create your account'}
            </h1>
            <p
              className={`mt-2 text-sm text-muted-foreground transition-all duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                modeSwitching ? 'opacity-100 -translate-y-1 scale-[1.005]' : 'opacity-100 translate-y-0 scale-100'
              }`}
            >
              {authMode === 'sign_in'
                ? 'Access your workspaces and projects'
                : 'Launch faster with AI-powered product photography'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete={
                          authMode === 'sign_up'
                            ? 'new-password'
                            : 'current-password'
                        }
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
              {statusMessage && (
                <p className="text-sm text-primary">{statusMessage}</p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Please wait…'
                  : authMode === 'sign_in'
                    ? 'Sign in'
                    : 'Create account'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm text-muted-foreground hover:text-primary"
                disabled={isSubmitting}
                onClick={handleToggleMode}
              >
                {authMode === 'sign_in'
                  ? "Need an account? Let's create one"
                  : 'Already have an account? Sign in'}
              </Button>
            </form>
          </Form>
        )}

        <Button asChild variant="link" className="px-1 text-primary">
          <Link to="/" preload="intent">
            Back to marketing site
          </Link>
        </Button>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_public/login')({
  component: LoginPage,
  staticData: {
    title: 'Sign in',
  },
})
