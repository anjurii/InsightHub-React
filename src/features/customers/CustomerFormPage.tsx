import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useCreateCustomer } from '../../hooks/useCustomers'

const schema = z.object({
  name: z.string().min(2, 'Enter the customer name'),
  email: z.string().email('Enter a valid email address'),
  company: z.string().min(2, 'Enter the company name'),
  status: z.enum(['Active', 'Inactive', 'Pending']),
})

type FormValues = z.infer<typeof schema>

export default function CustomerFormPage() {
  const navigate = useNavigate()
  const createCustomer = useCreateCustomer()
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { status: 'Active' } })

  async function onSubmit(values: FormValues) {
    await createCustomer.mutateAsync(values)
    navigate('/customers')
  }

  return <main className="form-page"><div className="form-page-header"><div><p className="eyebrow">Customers</p><h1>Add customer</h1><p className="subheading">Create a customer profile for your workspace.</p></div><button className="button secondary" onClick={() => navigate('/customers')}>Cancel</button></div><form className="customer-form card" onSubmit={handleSubmit(onSubmit)}><Field label="Full name" error={errors.name?.message}><input {...register('name')} placeholder="Olivia Martin" /></Field><Field label="Email address" error={errors.email?.message}><input {...register('email')} type="email" placeholder="olivia@company.com" /></Field><Field label="Company" error={errors.company?.message}><input {...register('company')} placeholder="Company name" /></Field><Field label="Status" error={errors.status?.message}><select {...register('status')}><option>Active</option><option>Pending</option><option>Inactive</option></select></Field><div className="form-actions"><button type="button" className="button secondary" onClick={() => navigate('/customers')}>Cancel</button><button className="button primary" disabled={createCustomer.isPending}>{createCustomer.isPending ? 'Saving...' : 'Save customer'}</button></div></form></main>
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="form-field">{label}{children}{error && <span className="field-error">{error}</span>}</label>
}
