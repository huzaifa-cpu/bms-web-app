import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, Form, Button, Row, Col } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Loader } from '../../../core/ui/components/loader'
import { ErrorState } from '../../../core/ui/components/error_state'
import { useGetRoleQuery, useCreateRoleMutation, useUpdateRoleMutation, useGetFeaturesQuery } from '../api/roles_api'

const schema = z.object({
  roleName: z.string().min(2, 'Name is required'),
  roleType: z.enum(['CONSUMER', 'PROVIDER', 'ADMIN', 'EMPLOYEE', 'SUPER_ADMIN'] as const, { message: 'Role Type is required' }),
  permissions: z.array(z.string()),
})
type FormData = z.infer<typeof schema>

export default function RoleFormPage() {
  const navigate = useNavigate()
  const { roleId } = useParams()
  const isEdit = !!roleId

  const { data, isLoading, error } = useGetRoleQuery(Number(roleId), { skip: !isEdit })
  const existing = data?.data

  const { data: featuresData, isLoading: featuresLoading } = useGetFeaturesQuery()
  const features = featuresData?.data ?? []

  // Build feature actions map and all permissions from API data
  const { featureActions, allPermissions } = useMemo(() => {
    const featureActions: Record<string, string[]> = {}
    const allPermissions: string[] = []

    features.forEach(f => {
      featureActions[f.feature] = f.permissions
      f.permissions.forEach(p => {
        allPermissions.push(`${f.feature}.${p}`)
      })
    })

    return { featureActions, allPermissions }
  }, [features])

  const [createRole] = useCreateRoleMutation()
  const [updateRole] = useUpdateRoleMutation()

  const { register, handleSubmit, setValue, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: existing ? {
      roleName: existing.roleName,
      roleType: existing.roleType,
      permissions: existing.permissions,
    } : undefined,
    defaultValues: !isEdit ? { roleName: '', permissions: [], roleType: undefined } : undefined,
  })

  // Watch permissions for select all functionality
  const watchedPermissions = useWatch({ control, name: 'permissions' }) ?? []

  // Check if all permissions are selected
  const isAllSelected = allPermissions.length > 0 && allPermissions.every(p => watchedPermissions.includes(p))

  // Handle select all toggle
  const handleSelectAll = (checked: boolean) => {
    setValue('permissions', checked ? allPermissions : [])
  }


  if (isEdit && isLoading) return <Loader fullPage />
  if (featuresLoading) return <Loader fullPage />
  if (isEdit && (error || !existing)) return <ErrorState error="Role not found." />

  const onSubmit = async (formData: FormData) => {
    try {
      if (isEdit) {
        await updateRole({
          roleId: Number(roleId),
          request: { roleName: formData.roleName, permissions: formData.permissions },
        }).unwrap()
        toast.success('Role updated.')
      } else {
        await createRole(formData).unwrap()
        toast.success('Role created.')
      }
      navigate('/roles')
    } catch {
      toast.error(isEdit ? 'Failed to update role.' : 'Failed to create role.')
    }
  }

  return (
    <div>
      <h4 className="fw-bold mb-4">{isEdit ? `Edit Role — ${existing?.roleName}` : 'New Role'}</h4>
      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Role Name</Form.Label>
                  <Form.Control isInvalid={!!errors.roleName} {...register('roleName')} />
                  <Form.Control.Feedback type="invalid">{errors.roleName?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Role Type</Form.Label>
                  <Form.Select isInvalid={!!errors.roleType} {...register('roleType')} disabled={isEdit}>
                    <option value="">Select Role Type...</option>
                    <option value="CONSUMER">Consumer</option>
                    <option value="PROVIDER">Provider</option>
                    <option value="ADMIN">Admin</option>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.roleType?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Permissions</h6>
              <Form.Check
                type="checkbox"
                label="Select All"
                checked={isAllSelected}
                onChange={e => handleSelectAll(e.target.checked)}
              />
            </div>
            {Object.entries(featureActions).map(([feature, actions]) => (
              <div key={feature} className="mb-4 border rounded p-3">
                <strong className="d-block mb-2 text-secondary">{feature.replace(/_/g, ' ')}</strong>
                <Row>
                  {actions.map(action => {
                    const permKey = `${feature}.${action}`
                    return (
                      <Col xs={12} sm={6} md={4} key={permKey}>
                        <Form.Check
                          label={action.replace(/_/g, ' ')}
                          value={permKey}
                          type="checkbox"
                          {...register('permissions')}
                        />
                      </Col>
                    )
                  })}
                </Row>
              </div>
            ))}

            <div className="d-flex gap-2 mt-2">
              <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Role'}</Button>
              <Button variant="secondary" onClick={() => navigate('/roles')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
