const fs = require('fs')

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8')
  content = content.replace(/\} , Sparkles \} from "lucide-react";/g, ', Sparkles } from "lucide-react";')
  content = content.replace(/, Wallet as WalletIcon \} , Sparkles \} from "lucide-react";/g, ', Wallet as WalletIcon, Sparkles } from "lucide-react";')
  // To be safe, just replace the whole line:
  content = content.replace(/import \{.*?\} from "lucide-react";/, (match) => {
    let inner = match.replace(/import \{/,'').replace(/\} from "lucide-react";/,'').replace(/\} , Sparkles/g, ', Sparkles').trim()
    return `import { ${inner} } from "lucide-react";`
  })
  
  fs.writeFileSync(filepath, content)
}

patchFile('apps/frontend/src/components/Sidebar.tsx')
patchFile('apps/frontend/src/components/MobileNav.tsx')
