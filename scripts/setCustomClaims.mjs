import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { readFileSync } from 'fs'

// Usage:
//   node scripts/setCustomClaims.mjs <uid> <role>
//   role one of: Admin | Landlord | Tenant

const [,, uid, role] = process.argv
if (!uid || !role) {
  console.error('Usage: node scripts/setCustomClaims.mjs <uid> <role>')
  process.exit(1)
}

console.log('Setting custom claims for user:', uid)
console.log('Role:', role)

try {
  // Read the service account key
  const serviceAccount = JSON.parse(readFileSync('./serviceAccountkey.json', 'utf8'))
  
  // Initialize with service account credentials
  initializeApp({ 
    credential: cert(serviceAccount),
    projectId: 'domionz'
  })
  
  const claims = { role }
  if (role === 'Admin') claims.admin = true
  
  await getAuth().setCustomUserClaims(uid, claims)
  console.log(`✅ Successfully set claims for ${uid}:`, claims)
  process.exit(0)
} catch (e) {
  console.error('❌ Error setting custom claims:', e.message)
  process.exit(1)
}
