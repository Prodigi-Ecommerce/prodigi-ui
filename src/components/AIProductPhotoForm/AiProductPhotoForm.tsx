import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useState } from 'react'
import axios from 'axios'
import type { Option } from '@/types/option.ts'
import { MultiSelectCombobox } from '@/components/AIProductPhotoForm/MultiSelectCombobox/MultiSelectCombobox.tsx'

const formSchema = z.object({
  pictures: z
    .instanceof(FileList)
    .refine((files) => files?.length > 0, 'Please select at least one file')
    .refine((files) => {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/heic',
        'image/heif',
      ]
      return Array.from(files).every((file) => allowedTypes.includes(file.type))
    }, 'Only JPEG, PNG, and WebP files are allowed'),
  labels: z.array(z.string()).min(1, 'Please have at least one label selected'),
})

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

const uploadAndGenerateImage = async (imageFiles: File[], labels: string[]) => {
  const formData = new FormData()

  imageFiles.forEach((file) => {
    formData.append('image', file)
  })

  try {
    const response = await api.post('/api/images/v2/create', formData, {
      params: {
        garmentTags: labels.join(','),
      },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // Return the array of base64 images
    return response.data.images as string[]
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  }
}

export function AiProductPhotoForm() {
  const [generatedImages, setGeneratedImages] = useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pictures: undefined,
      labels: [],
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const files = Array.from(values.pictures)
    const images = await uploadAndGenerateImage(files, values.labels)
    setGeneratedImages(images)
  }

  const garmentOptions: Option[] = [
    { value: 'jacket', label: 'Jacket' },
    { value: 'shirt', label: 'Shirt' },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center pt-[10vh] pb-20 px-4">
      <div className="grid w-full max-w-sm items-center gap-3 bg-card text-card-foreground rounded-lg shadow-lg shadow-primary/20 p-6 border border-border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="pictures"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Input Pictures</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      multiple
                      onChange={(e) => field.onChange(e.target.files)}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <FormField
              control={form.control}
              name="labels"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Garment Labels</FormLabel>
                  <FormControl>
                    <MultiSelectCombobox
                      options={garmentOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Choose garment types..."
                      error={fieldState.error}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <Button type="submit" className="w-full">Submit</Button>
          </form>
        </Form>
      </div>

      {generatedImages.length > 0 && (
        <div className="w-full max-w-6xl mt-12">
          <h2 className="text-2xl font-semibold mb-6 text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Generated Images
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedImages.map((base64Image, index) => (
              <div
                key={index}
                className="relative group overflow-hidden rounded-lg border border-border bg-card shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300"
              >
                <img
                  src={`data:image/png;base64,${base64Image}`}
                  alt={`Generated ${index + 1}`}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-background/80 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-sm font-medium text-foreground">Image {index + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}