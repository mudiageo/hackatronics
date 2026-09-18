const fs = require('fs')

let content = fs.readFileSync('apps/frontend/src/routes/transactions.tsx', 'utf8')

// Add state for form fields
content = content.replace(
  'const [isScanning, setIsScanning] = useState(false)',
  `const [isScanning, setIsScanning] = useState(false)
  const [formData, setFormData] = useState({ description: '', counterparty: '', amount: '', type: '' })`
)

// Update handleFileScan to use state
content = content.replace(
  `        const descEl = document.getElementById('description') as HTMLInputElement;
        if (descEl) descEl.value = 'AI Scanned Sale: ' + res.items.map((i: any) => i.read_as).join(', ');
        
        const amountInput = document.getElementById('amount') as HTMLInputElement;
        if (amountInput) amountInput.value = (res.amount / 100).toString();
        
        const counterpartyEl = document.getElementById('counterparty') as HTMLInputElement;
        if (counterpartyEl) counterpartyEl.value = res.customer || 'Walk-in Customer';
        
        const typeEl = document.getElementById('type') as HTMLInputElement;
        if (typeEl) typeEl.value = 'Pharmacy Sales';
        
        setIsAddModalOpen(true);`,
  `        setFormData({
          description: 'AI Scanned Sale: ' + res.items.map((i: any) => i.read_as).join(', '),
          amount: (res.amount / 100).toString(),
          counterparty: res.customer || 'Walk-in Customer',
          type: 'Pharmacy Sales'
        });
        setIsAddModalOpen(true);`
)

// Reset form data when opening manually (if not scanned)
content = content.replace(
  '<Plus className="w-4 h-4" /> Add Transaction',
  '<Plus className="w-4 h-4" /> Add Transaction'
)
content = content.replace(
  '<Button className="flex gap-2 items-center">',
  '<Button className="flex gap-2 items-center" onClick={() => setFormData({ description: "", counterparty: "", amount: "", type: "" })}>'
)

// Update Inputs to use state
content = content.replace(
  '<Input id="description" name="description" placeholder="e.g. Office Supplies" required />',
  '<Input id="description" name="description" placeholder="e.g. Office Supplies" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />'
)
content = content.replace(
  '<Input id="counterparty" name="counterparty" placeholder="e.g. Stationery Hub" required />',
  '<Input id="counterparty" name="counterparty" placeholder="e.g. Stationery Hub" required value={formData.counterparty} onChange={e => setFormData({...formData, counterparty: e.target.value})} />'
)
content = content.replace(
  '<Input id="amount" name="amount" type="number" step="0.01" placeholder="-150.00" required />',
  '<Input id="amount" name="amount" type="number" step="0.01" placeholder="-150.00" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />'
)
content = content.replace(
  '<Input id="type" name="type" placeholder="e.g. Expense" required />',
  '<Input id="type" name="type" placeholder="e.g. Expense" required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} />'
)

fs.writeFileSync('apps/frontend/src/routes/transactions.tsx', content)
