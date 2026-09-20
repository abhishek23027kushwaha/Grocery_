import { AdminButton, AdminShell, EmptyAdminPage, StatusBadge } from '@/components/admin-shell'
import { adminCustomers, adminOrders } from '@/lib/admin-data'
import { AdminCategoryManager } from '@/components/admin-category-manager'
import { AdminProductsManager } from '@/components/admin-products-manager'
import { MyOrdersClient } from '@/components/my-orders-client'
import { OrderTableClient } from '@/components/order-table-client'
import Link from 'next/link'

const config: Record<string, { title: string; description: string }> = { orders: { title: 'Orders', description: 'Track, update and fulfil every customer order.' }, 'my-orders': { title: 'My Orders', description: 'Track your personal orders.' }, products: { title: 'Products', description: 'Manage your grocery catalogue, pricing and availability.' }, categories: { title: 'Categories', description: 'Organise products into easy-to-browse collections.' }, inventory: { title: 'Inventory', description: 'Monitor stock levels and restock products before they run out.' }, customers: { title: 'Customers', description: 'View customer profiles, order history and lifetime value.' }, promotions: { title: 'Promotions', description: 'Create discount codes and manage seasonal campaigns.' } }

export default async function AdminSection({ params }: { params: Promise<{ section: string }> }) { 
  const { section } = await params; 
  const page = config[section] ?? config.products; 
  const isProducts = section === 'products' || section === 'inventory'; 
  const isOrders = section === 'orders'; 
  const isMyOrders = section === 'my-orders';
  const isCustomers = section === 'customers'; 
  const isCategories = section === 'categories'; 
  
  if (isProducts) {
    return (
      <AdminShell title="" description="" action={null}>
        <AdminProductsManager inventory={section === 'inventory'} />
      </AdminShell>
    )
  }

  return <AdminShell title={page.title} description={page.description} action={<AdminButton>{isOrders || isMyOrders ? 'Create order' : isCategories ? 'Add category' : isCustomers ? 'Export customers' : 'Add new'}</AdminButton>}>{isOrders ? <OrderTableClient /> : isMyOrders ? <MyOrdersClient /> : isCustomers ? <CustomerTable /> : isCategories ? <AdminCategoryManager /> : <EmptyAdminPage title={`Manage ${page.title.toLowerCase()}`} description="This workspace is ready for your store operations. Add your first item to get started." action={<AdminButton>Create {section.slice(0, -1)}</AdminButton>} />}</AdminShell> 
}

function CustomerTable() { return <div className="overflow-hidden rounded-2xl border border-[#e5ebe3] bg-white"><div className="border-b border-[#edf1eb] p-5"><h2 className="font-extrabold">Customer directory</h2></div><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-[#fafcf9] text-xs text-[#789080]"><tr><th className="px-6 py-3">Customer</th><th className="px-6 py-3">Orders</th><th className="px-6 py-3">Lifetime spend</th><th className="px-6 py-3">Status</th></tr></thead><tbody>{adminCustomers.map((customer) => <tr key={customer.email} className="border-t border-[#edf1eb]"><td className="px-6 py-4"><b>{customer.name}</b><span className="mt-1 block text-xs text-[#789080]">{customer.email}</span></td><td className="px-6 py-4">{customer.orders}</td><td className="px-6 py-4 font-bold">{customer.spent}</td><td className="px-6 py-4"><StatusBadge status={customer.status}/></td></tr>)}</tbody></table></div> }
