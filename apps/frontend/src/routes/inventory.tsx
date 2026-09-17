import { createFileRoute } from '@tanstack/react-router'
import { Plus, Package, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '../components/PageHeader'
import { getInventory } from '../services/inventory.service'
import type { InventoryItem } from '../services/inventory.service'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/inventory')({
  component: Inventory,
  loader: async () => await getInventory(),
})

function getStatusBadge(status: string) {
  switch (status) {
    case 'In Stock':
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100/80 border-0">In Stock</Badge>
    case 'Low Stock':
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80 border-0">Low Stock</Badge>
    case 'Out of Stock':
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100/80 border-0">Out of Stock</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function Inventory() {
  const initialInventory = Route.useLoaderData()
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handleAddItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const qty = Number(formData.get('qtyOnHand'))
    const reorder = Number(formData.get('reorderLevel'))
    
    const newItem: InventoryItem = {
      id: `INV-${Math.floor(Math.random() * 1000) + 100}`,
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      qtyOnHand: qty,
      reorderLevel: reorder,
      unitPrice: Number(formData.get('unitPrice')),
      costPrice: Number(formData.get('costPrice')),
      status: qty === 0 ? 'Out of Stock' : (qty <= reorder ? 'Low Stock' : 'In Stock'),
      movements: []
    }

    setInventory([newItem, ...inventory])
    setIsAddModalOpen(false)
    toast.success('Inventory item added successfully')
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <PageHeader 
        title="Inventory" 
        description="Track stock so it can feed into transactions and financial intelligence." 
        action={
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex gap-2 items-center">
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Inventory Item</DialogTitle>
                <DialogDescription>
                  Register a new product to track in your inventory.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddItem} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input id="name" name="name" placeholder="e.g. Paracetamol 500mg" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU / Code</Label>
                  <Input id="sku" name="sku" placeholder="e.g. MED-PAR-500" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qtyOnHand">Quantity on Hand</Label>
                    <Input id="qtyOnHand" name="qtyOnHand" type="number" defaultValue={0} min="0" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reorderLevel">Reorder Level</Label>
                    <Input id="reorderLevel" name="reorderLevel" type="number" defaultValue={10} min="0" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Unit Price ($)</Label>
                    <Input id="unitPrice" name="unitPrice" type="number" step="0.01" placeholder="10.00" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costPrice">Cost Price ($)</Label>
                    <Input id="costPrice" name="costPrice" type="number" step="0.01" placeholder="5.00" required />
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit">Save Item</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      
      <div className="border rounded-lg bg-card shadow-sm overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow className="bg-muted/50 border-border">
              <TableHead className="font-medium text-foreground">Item Name</TableHead>
              <TableHead className="font-medium text-foreground">SKU</TableHead>
              <TableHead className="text-right font-medium text-foreground">Qty on Hand</TableHead>
              <TableHead className="text-right font-medium text-foreground">Unit Price</TableHead>
              <TableHead className="font-medium text-foreground text-right pr-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow 
                key={item.id} 
                className="border-border hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedItem(item)}
              >
                <TableCell className="font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    {item.name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                <TableCell className={`text-right font-bold ${item.qtyOnHand <= item.reorderLevel ? 'text-red-600' : 'text-foreground'}`}>
                  {item.qtyOnHand}
                </TableCell>
                <TableCell className="text-right text-foreground">
                  ${item.unitPrice.toFixed(2)}
                </TableCell>
                <TableCell className="flex justify-end pr-6">
                  {getStatusBadge(item.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto border-l-border bg-card">
          {selectedItem && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="text-xl font-bold flex items-center justify-between">
                  {selectedItem.name}
                  {getStatusBadge(selectedItem.status)}
                </SheetTitle>
                <SheetDescription>
                  SKU: {selectedItem.sku}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/50">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Quantity on Hand</div>
                    <div className={`text-3xl font-bold ${selectedItem.qtyOnHand <= selectedItem.reorderLevel ? 'text-red-600' : 'text-foreground'}`}>
                      {selectedItem.qtyOnHand}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Reorder Level</div>
                    <div className="text-sm font-medium text-foreground">{selectedItem.reorderLevel}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Unit Price</div>
                    <div className="text-sm font-medium text-foreground">${selectedItem.unitPrice.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Cost Price</div>
                    <div className="text-sm font-medium text-foreground">${selectedItem.costPrice.toFixed(2)}</div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="font-semibold text-lg mb-4">Stock Movements</h3>
                  
                  {selectedItem.movements && selectedItem.movements.length > 0 ? (
                    <div className="space-y-3">
                      {selectedItem.movements.map((movement) => (
                        <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${movement.type === 'In' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {movement.type === 'In' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-foreground">
                                {movement.type === 'In' ? 'Stock Added' : 'Stock Reduced'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Ref: {movement.reference} • {movement.date}
                              </div>
                            </div>
                          </div>
                          <div className={`font-bold ${movement.type === 'In' ? 'text-green-600' : 'text-foreground'}`}>
                            {movement.type === 'In' ? '+' : ''}{movement.qty}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed rounded-xl text-center text-muted-foreground bg-muted/20">
                      <p className="text-sm">No recent stock movements.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
