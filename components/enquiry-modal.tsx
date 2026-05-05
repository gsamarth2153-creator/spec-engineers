'use client'

import { useEnquiry } from '@/app/enquiry-context'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const enquirySchema = z.object({
  Name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  type: z.enum(['individual', 'company']),
  company: z.string().optional(),
  service: z.string().min(1, 'Please select a service'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
}).refine((data) => {
  if (data.type === 'company') {
    return data.company && data.company.length >= 2;
  }
  return true;
}, {
  message: 'Company name is required',
  path: ['company'],
})

type EnquiryForm = z.infer<typeof enquirySchema>

const services = [
  'Mechanical Design',
  'Structural Analysis',
  'Manufacturing Optimization',
  'Blading Solutions',
  '3-AXIS Precision Machining',
  'Reconditioning Services',
  'Custom Engineering Solutions',
]

export function EnquiryModal() {
  const { isModalOpen, selectedService, setIsModalOpen } = useEnquiry()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<EnquiryForm>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      service: selectedService || '',
      type: 'individual',
    },
  })

  const watchType = watch('type')

  const onSubmit = async (data: EnquiryForm) => {
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.Name,
          email: data.email,
          phone: data.phone,
          type: data.type,
          company: data.company || null,
          service: data.service,
          message: data.message,
        }),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const result = await res.json()

      if (result.success) {
        toast.success("Enquiry submitted successfully!")
        reset()
        setIsModalOpen(false)
      } else {
        toast.error(result.message || "Something went wrong.")
      }
    } catch (error) {
      console.error("Enquiry submission error:", error)
      toast.error("Failed to submit enquiry. Please try again.")
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send an Enquiry</DialogTitle>
          <DialogDescription>Tell us about your project and we&apos;ll get back to you shortly.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Name</label>
              <Input
                {...register('Name')}
                placeholder="Full Name"
                className={errors.Name ? 'border-destructive' : ''}
              />
              {errors.Name && <p className="text-sm text-destructive mt-1">{errors.Name.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <Input
              {...register('email')}
              type="email"
              placeholder="name@example.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
            <Input
              {...register('phone')}
              placeholder="+91 9876543210"
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Type</label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="flex gap-6">
                  <div
                    onClick={() => field.onChange('individual')}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        field.value === 'individual'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-blue-400 bg-white hover:border-blue-500'
                      }`}
                    >
                      {field.value === 'individual' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                      )}
                    </div>
                    <label
                      htmlFor="individual"
                      className="text-sm font-medium cursor-pointer select-none"
                    >
                      Individual
                    </label>
                  </div>

                  <div
                    onClick={() => field.onChange('company')}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        field.value === 'company'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-blue-400 bg-white hover:border-blue-500'
                      }`}
                    >
                      {field.value === 'company' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                      )}
                    </div>
                    <label
                      htmlFor="company"
                      className="text-sm font-medium cursor-pointer select-none"
                    >
                      Company
                    </label>
                  </div>
                </div>
              )}
            />
          </div>

          {watchType === 'company' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Company</label>
              <Input
                {...register('company')}
                placeholder="Your Company"
                className={errors.company ? 'border-destructive' : ''}
              />
              {errors.company && <p className="text-sm text-destructive mt-1">{errors.company.message}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Service Interested In</label>
            <select
              {...register('service')}
              className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.service ? 'border-destructive' : 'border-border'
              }`}
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
            {errors.service && <p className="text-sm text-destructive mt-1">{errors.service.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Message</label>
            <textarea
              {...register('message')}
              placeholder="Tell us about your project..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                errors.message ? 'border-destructive' : 'border-border'
              }`}
            />
            {errors.message && <p className="text-sm text-destructive mt-1">{errors.message.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
