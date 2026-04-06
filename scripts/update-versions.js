// scripts/update-versions.js

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const version = process.argv[2]
const appsDir = path.join(__dirname, '..', 'apps')

for (const app of fs.readdirSync(appsDir)) {
    const pkgPath = path.join(appsDir, app, 'package.json')
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
        pkg.version = version
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
        console.log(`Updated ${pkg.name} to ${version}`)
    }
}
