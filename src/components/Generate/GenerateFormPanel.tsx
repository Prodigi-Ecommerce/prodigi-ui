import { useState, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDropzone } from 'react-dropzone'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useWorkspaceContext } from '@/contexts/WorkspaceContext'
import { useAuth } from '@/contexts/AuthContext'
import { processImages } from '@/components/AIProductPhotoForm/AiProductPhotoForm.utils'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  projectName: z
    .string()
    .min(1, 'Project name is required')
    .max(120, 'Project name is too long'),
  pictures: z
    .array(z.instanceof(File))
    .nonempty('Please select at least one file')
    .refine(
      (files) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/heic',
          'image/heif',
        ]
        return files.every((file) => allowedTypes.includes(file.type))
      },
      { message: 'Only JPEG, PNG, and WebP files are allowed' }
    ),
})

type GenerateFormPanelProps = {
  className?: string
}

export function GenerateFormPanel({ className }: GenerateFormPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { selectedWorkspaceId } = useWorkspaceContext()
  const { user, accessToken } = useAuth()
  const authHeaders = useMemo(
    () => (accessToken ? { accessToken } : null),
    [user, accessToken]
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: '',
      pictures: [],
    },
  })

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const updatedFiles = [...form.getValues('pictures'), ...acceptedFiles]
      form.setValue('pictures', updatedFiles, { shouldValidate: true })

      const previewUrls = acceptedFiles.map((file) => URL.createObjectURL(file))
      setPreviews((prev) => [...prev, ...previewUrls])
    },
    [form]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic'],
      'image/heif': ['.heif'],
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedWorkspaceId) {
      setSubmitError('Select a workspace before creating a project')
      return
    }
    if (!authHeaders) {
      setSubmitError('You must be signed in to create a project')
      return
    }

    setIsProcessing(true)
    setSubmitError(null)
    try {
      const files = values.pictures
      await processImages({
        files,
        projectName: values.projectName,
        workspaceId: selectedWorkspaceId,
        auth: authHeaders,
      })
      form.reset({
        projectName: '',
        pictures: [],
      })
      setPreviews([])
    } catch (error) {
      console.error('Processing failed:', error)
      setSubmitError(
        error instanceof Error ? error.message : 'Processing failed. Try again.'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const sectionTitleClass =
    'text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground'

  return (
    <div
      className={cn(
        'grid w-full max-w-xl gap-4 bg-card text-card-foreground rounded-2xl shadow-lg shadow-primary/10 p-5 border border-border',
        className
      )}
    >
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-semibold">Generate</h1>
        <p className="text-xs text-muted-foreground">
          Upload images and create a new project in your selected workspace.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={sectionTitleClass}>Project name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Spring campaign lookbook"
                    {...field}
                    disabled={isProcessing}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pictures"
            render={() => (
              <FormItem>
                <FormLabel className={sectionTitleClass}>Upload images</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <div
                      {...getRootProps()}
                      className={cn(
                        'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                        isDragActive
                          ? 'border-primary bg-primary/10'
                          : 'border-muted-foreground/30 hover:border-primary/60'
                      )}
                    >
                      <input {...getInputProps()} />
                      {isDragActive ? (
                        <p className="text-primary font-medium">
                          Drop your images here...
                        </p>
                      ) : (
                        <p className="text-muted-foreground">
                          Drag & drop images here, or click to select
                        </p>
                      )}
                    </div>

                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? [])
                        onDrop(files)
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {previews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {previews.map((src, index) => (
                <div
                  key={index}
                  className="relative w-full pb-[100%] overflow-hidden rounded-md border border-border/60"
                >
                  <img
                    src={src}
                    alt={`Preview ${index + 1}`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isProcessing || !selectedWorkspaceId || !authHeaders}
          >
            {isProcessing ? 'Processing...' : 'Create project'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
