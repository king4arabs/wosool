import { loadBuildEnvironment } from './load-build-env.mjs'
import { checkDeploymentEnvironment } from './hosting-preflight.mjs'

try {
  loadBuildEnvironment()
  checkDeploymentEnvironment()
  console.log('Frontend production/staging environment preflight passed')
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
