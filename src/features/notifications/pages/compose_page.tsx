import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, Form, Button, Row, Col } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useBroadcastNotificationMutation } from '../api/notifications_api'

const schema = z.object({
  title: z.string().min(3, 'Title is required'),
  body: z.string().min(10, 'Message body is required'),
  audience: z.enum(['all', 'admins', 'consumers', 'providers', 'employees']),
  channels: z.array(z.string()).min(1, 'Select at least one channel'),
})
type FormData = z.infer<typeof schema>

export default function ComposePage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { audience: 'all', channels: ['push'] },
  })

  const [broadcast, { isLoading }] = useBroadcastNotificationMutation()

  const onSubmit = async (data: FormData) => {
    try {
      await broadcast({
        userIds: [],
        title: data.title,
        message: data.body,
        type: 'GENERAL',
      }).unwrap()
      toast.success('Notification sent successfully.')
      reset()
    } catch {
      toast.error('Failed to send notification.')
    }
  }

  return (
    <div>
      <h4 className="fw-bold mb-4">Compose Notification</h4>
      <Card className="shadow-sm" style={{ maxWidth: 640 }}>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control placeholder="Notification title" isInvalid={!!errors.title} {...register('title')} />
              <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control as="textarea" rows={4} placeholder="Notification message..." isInvalid={!!errors.body} {...register('body')} />
              <Form.Control.Feedback type="invalid">{errors.body?.message}</Form.Control.Feedback>
            </Form.Group>
            <Row>
              <Col sm={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Audience</Form.Label>
                  <Form.Select {...register('audience')}>
                    <option value="all">All Users</option>
                    <option value="admins">Admins</option>
                    <option value="consumers">Consumers</option>
                    <option value="providers">Providers</option>
                    <option value="employees">Employees</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Channels</Form.Label>
                  <div className="d-flex gap-3 mt-1">
                    <Form.Check label="Push" value="push" type="checkbox" {...register('channels')} defaultChecked />
                    <Form.Check label="Email" value="email" type="checkbox" {...register('channels')} />
                    <Form.Check label="SMS" value="sms" type="checkbox" {...register('channels')} />
                  </div>
                  {errors.channels && <div className="text-danger small mt-1">{errors.channels.message}</div>}
                </Form.Group>
              </Col>
            </Row>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Notification'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
