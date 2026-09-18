const fs = require('fs')

let content = fs.readFileSync('apps/frontend/src/routes/wallet.tsx', 'utf8')

// Remove the Bank role specific block
content = content.replace(
  /if \(role === 'Bank'\) \{[\s\S]*?return \([\s\S]*?\}[\s\S]*?\}/,
  ''
)

// Change handleReceiveDemo to not use toast.promise if it's failing
content = content.replace(
  /const handleReceiveDemo = async \(\) => \{[\s\S]*?toast\.promise\([\s\S]*?\)[\s\S]*?\}/,
  `const handleReceiveDemo = async () => {
    toast('Generating test deposit...', { icon: '🔄' })
    try {
      await receiveFundsFn({ data: { amount: 5000000, description: 'Demo Funding' } })
      await router.invalidate()
      toast.success('Successfully received ₦50,000.00!')
    } catch (err) {
      toast.error('Failed to receive funds')
    }
  }`
)

fs.writeFileSync('apps/frontend/src/routes/wallet.tsx', content)
