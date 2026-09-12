import { WattWiseProvider } from './context/WattWiseContext'
import { Layout } from './components/Layout'

export default function App() {
  return (
    <WattWiseProvider>
      <Layout />
    </WattWiseProvider>
  )
}
