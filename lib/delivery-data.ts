export type DeliveryOrder = {
  id: string
  customer: string
  address: string
  items: string
  amount: string
  status: 'Assigned' | 'Picked up' | 'On the way' | 'Delivered'
  eta: string
}

export const deliveryOrder: DeliveryOrder = {
  id: 'GRV-1048', customer: 'Aarav Mehta', address: '12 Park View Road, Koramangala', items: '4 items · 2 bags', amount: '₹486', status: 'On the way', eta: '8 min'
}

export const deliverySteps = ['Order confirmed', 'Packed by store', 'Picked up', 'On the way', 'Delivered']

export const deliveryStats = [
  { label: 'Today\'s earnings', value: '₹1,240', detail: '+12% vs yesterday' },
  { label: 'Deliveries', value: '18', detail: '4 more to unlock bonus' },
  { label: 'Rating', value: '4.9', detail: 'Based on 142 ratings' },
]
