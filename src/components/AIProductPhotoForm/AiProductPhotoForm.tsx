import { useState, useCallback } from 'react'
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
import { processImages } from './AiProductPhotoForm.utils'

const formSchema = z.object({
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

export function AiProductPhotoForm() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [previews, setPreviews] = useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pictures: [],
    },
  })

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Add files to form state
      const updatedFiles = [...form.getValues('pictures'), ...acceptedFiles]
      form.setValue('pictures', updatedFiles, { shouldValidate: true })

      // Generate previews
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
    setIsProcessing(true)
    try {
      const files = values.pictures
      const result = await processImages(files)
      setCurrentProjectId(result.projectId)
    } catch (error) {
      console.error('Processing failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-[10vh] pb-20 px-4">
      <div className="grid w-full max-w-lg gap-5 bg-card text-card-foreground rounded-lg shadow-lg shadow-primary/20 p-6 border border-border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="pictures"
              render={({ }) => (
                <FormItem>
                  <FormLabel>Upload Images</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {/* Drag and Drop Zone */}
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive
                            ? 'border-primary bg-primary/10'
                            : 'border-muted-foreground/30 hover:border-primary/60'
                          }`}
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

                      {/* Hidden native input as fallback */}
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

            {/* Image Preview Grid */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {previews.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square overflow-hidden rounded-md border border-border"
                  >
                    <img
                      src={src}
                      alt={`Preview ${idx}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Submit'}
            </Button>
          </form>
        </Form>

        {currentProjectId && (
          <div className="mt-4 p-3 bg-primary/10 rounded-md">
            <p className="text-sm text-muted-foreground">
              Project ID:{' '}
              <span className="font-mono font-semibold text-foreground">
                {currentProjectId}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
