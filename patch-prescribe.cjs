const fs = require('fs')

let content = fs.readFileSync('apps/frontend/src/routes/prescribe.tsx', 'utf8')

// Move the patient state up before the hooks
content = content.replace(
  /const \[generatedRx, setGeneratedRx\] = useState<any \| null>\(null\)/,
  `const [generatedRx, setGeneratedRx] = useState<any | null>(null)
  const [patientSearch, setPatientSearch] = useState("Patient 421")
  const [patientId, setPatientId] = useState(421)`
)

// Remove the old definitions
content = content.replace(
  /const \[patientSearch, setPatientSearch\] = useState\("Patient 421"\)/g,
  (match, offset, str) => {
    // Only remove if it's after line 35
    if (offset > 1000) return ''
    return match
  }
)
content = content.replace(
  /const patientId = 421;/g,
  ''
)

fs.writeFileSync('apps/frontend/src/routes/prescribe.tsx', content)
