import { useState, useRef, useEffect } from 'react'
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BsArrowLeft, BsCamera } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { ROUTES } from '../../../core/constants/routes'
import { useGetSportMutation, useCreateSportMutation, useUpdateSportMutation } from '../api/sports_api'

const sportSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Name can only contain letters, numbers, spaces, and hyphens'),
})

type SportForm = z.infer<typeof sportSchema>

export default function SportFormPage() {
  const { sportId } = useParams<{ sportId: string }>()
  const navigate = useNavigate()
  const isEditMode = !!sportId

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [getSport, { data: sportData, isLoading: isLoadingSport }] = useGetSportMutation()
  const [createSport, { isLoading: isCreating }] = useCreateSportMutation()
  const [updateSport, { isLoading: isUpdating }] = useUpdateSportMutation()

  useEffect(() => {
    if (isEditMode) getSport(Number(sportId))
  }, [isEditMode, sportId])

  const sport = sportData?.data

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SportForm>({
    resolver: zodResolver(sportSchema),
    defaultValues: { name: '' },
  })

  // Reset form when sport data loads
  useEffect(() => {
    if (sport) {
      reset({ name: sport.name })
      setImagePreview(sport.imageUrl)
    }
  }, [sport, reset])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setImageError(null)

    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setImageError('Please select a valid image file')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setImageError('Image size must be less than 5MB')
        return
      }

      setPendingImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: SportForm) => {
    // Validate image for create mode
    if (!isEditMode && !pendingImageFile) {
      setImageError('Sport image is required')
      return
    }

    try {
      if (isEditMode) {
        await updateSport({
          sportId: Number(sportId),
          name: data.name.trim(),
          image: pendingImageFile || undefined,
        }).unwrap()
        toast.success('Sport updated successfully.')
      } else {
        await createSport({
          name: data.name.trim(),
          image: pendingImageFile!,
        }).unwrap()
        toast.success('Sport created successfully.')
      }
      navigate(ROUTES.CONFIGURATIONS_SPORTS)
    } catch (err: unknown) {
      const e = err as { data?: { errorMessage?: string } }
      toast.error(e?.data?.errorMessage || `Failed to ${isEditMode ? 'update' : 'create'} sport.`)
    }
  }

  if (isEditMode && isLoadingSport) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <div className="mt-2 text-muted">Loading sport...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate(ROUTES.CONFIGURATIONS_SPORTS)}>
          <BsArrowLeft className="me-1" />Back
        </Button>
        <h4 className="fw-bold mb-0">{isEditMode ? 'Edit Sport' : 'Add Sport'}</h4>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-4">
              {/* Image Upload */}
              <Col xs={12} className="text-center">
                <Form.Group>
                  <Form.Label className="d-block mb-2">
                    Sport Image <span className="text-danger">*</span>
                  </Form.Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: 150,
                      height: 150,
                      borderRadius: 12,
                      border: `2px dashed ${imageError ? 'var(--bs-danger)' : 'var(--bs-border-color)'}`,
                      backgroundColor: 'var(--color-bg-page)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Sport preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            padding: '4px 0',
                            fontSize: 12,
                          }}
                        >
                          <BsCamera className="me-1" /> Change
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-muted">
                        <BsCamera size={32} className="mb-1" />
                        <div className="small">Click to upload</div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  {imageError && (
                    <div className="text-danger small mt-2">{imageError}</div>
                  )}
                  <div className="text-muted small mt-2">
                    Recommended: Square image, max 5MB
                  </div>
                </Form.Group>
              </Col>

              {/* Name */}
              <Col md={6} className="mx-auto">
                <Form.Group>
                  <Form.Label>Sport Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter sport name"
                    isInvalid={!!errors.name}
                    {...register('name')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Submit */}
              <Col xs={12} className="text-center mt-4">
                <div className="d-flex gap-2 justify-content-center">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isCreating || isUpdating}
                  >
                    {(isCreating || isUpdating) ? (
                      <>
                        <Spinner size="sm" className="me-1" />
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      isEditMode ? 'Update Sport' : 'Create Sport'
                    )}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate(ROUTES.CONFIGURATIONS_SPORTS)}>
                    Cancel
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

