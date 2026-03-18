import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, Form, Button } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import { useGetConsumerMutation, useUpdateConsumerMutation } from '../api/consumers_api'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  mobileNumber: z.string().min(1, 'Phone is required'),
})
type FormData = z.infer<typeof schema>

export default function ConsumerEditPage() {
  const { consumerId } = useParams()
  const navigate = useNavigate()

  const [getConsumer, { data, isLoading, error }] = useGetConsumerMutation()
  const consumer = data?.data
  const [updateConsumer, { isLoading: isSaving }] = useUpdateConsumerMutation()

  useEffect(() => {
    getConsumer(Number(consumerId))
  }, [consumerId])

  const refetch = () => getConsumer(Number(consumerId))

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      mobileNumber: '',
    },
  })

  // Reset form when consumer data loads
  useEffect(() => {
    if (consumer) {
      reset({
        name: consumer.name ?? '',
        email: consumer.email ?? '',
        mobileNumber: consumer.mobileNumber ?? '',
      })
    }
  }, [consumer, reset])

  const onSubmit = async (formData: FormData) => {
    if (!consumer) return
    try {
      await updateConsumer({
        consumerId: consumer.id,
        request: formData,
      }).unwrap()
      toast.success('Consumer updated successfully.')
      navigate(`/consumers/${consumer.id}`)
    } catch {
      toast.error('Failed to update consumer.')
    }
  }

  if (isLoading) return <Loader fullPage />
  if (error || !consumer) return <ErrorState error="Consumer not found." onRetry={refetch} />

  return (
    <div>
      <h4 className="fw-bold mb-4">Edit Consumer — {consumer.name}</h4>
      <Card className="shadow-sm" style={{ maxWidth: 600 }}>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control isInvalid={!!errors.name} {...register('name')} />
              <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control isInvalid={!!errors.email} {...register('email')} />
              <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control isInvalid={!!errors.mobileNumber} {...register('mobileNumber')} />
              <Form.Control.Feedback type="invalid">{errors.mobileNumber?.message}</Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
              <Button variant="secondary" onClick={() => navigate(`/consumers/${consumer.id}`)}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
