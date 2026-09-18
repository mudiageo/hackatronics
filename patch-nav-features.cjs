const fs = require('fs')

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8')
  
  if (content.includes('lucide-react"')) {
    content = content.replace('lucide-react";', 'Camera, Mic } from "lucide-react";')
  }

  const aiLinks = `
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-6 px-3">
          Gemini AI (v2)
        </div>
        <Link 
          to="/ai-scanner" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-600 dark:text-blue-400 font-medium transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/50"
          activeProps={{ className: "bg-blue-100 dark:bg-blue-900/40" }}
        >
          <Camera className="w-5 h-5" />
          Receipt Scanner
        </Link>
        <Link 
          to="/ai-analyst" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 font-medium transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
          activeProps={{ className: "bg-indigo-100 dark:bg-indigo-900/40" }}
        >
          <Sparkles className="w-5 h-5" />
          Executive Analyst
        </Link>
        <Link 
          to="/ai-voice" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 font-medium transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/50"
          activeProps={{ className: "bg-rose-100 dark:bg-rose-900/40" }}
        >
          <Mic className="w-5 h-5" />
          Voice Assistant
        </Link>
`

  // Replace the old AI Hub link
  content = content.replace(/<div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-6 px-3">[\s\S]*?AI Hub\n\s*<\/Link>/, aiLinks)
  
  // Clean up any duplicated imports just in case
  content = content.replace(/import \{.*?\} from "lucide-react";/, (match) => {
    let inner = match.replace(/import \{/,'').replace(/\} from "lucide-react";/,'').split(',').map(s=>s.trim());
    let unique = [...new Set(inner)].filter(Boolean);
    return `import { ${unique.join(', ')} } from "lucide-react";`
  })

  fs.writeFileSync(filepath, content)
}

patchFile('apps/frontend/src/components/Sidebar.tsx')
patchFile('apps/frontend/src/components/MobileNav.tsx')

// Remove old ai.tsx to avoid conflicts
if (fs.existsSync('apps/frontend/src/routes/ai.tsx')) {
  fs.unlinkSync('apps/frontend/src/routes/ai.tsx')
}
