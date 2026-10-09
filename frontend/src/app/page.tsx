import { Landing } from '@/components/accelerator/Landing'
export default function HomePage() { return <Landing home /> }
import { PublicLayout } from '@/components/layout/PublicLayout'
import { EoaLanding } from '@/components/eoa/Landing'
export default function HomePage() { return <PublicLayout><EoaLanding home /></PublicLayout> }
