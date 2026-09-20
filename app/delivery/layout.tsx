import { RoleGuard } from '@/components/role-guard'

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuard allowedRoles={['delivery', 'delivery_boy', 'DELIVERY_BOY']}>
      {children}
    </RoleGuard>
  )
}
