import { ContextManager } from './context'
import { AppRoutes } from './routes'
import "./App.css"
import { Footer, Header} from './components'

function App() {
  return (
    <ContextManager>
      <div className="App">
          <Header/>
          <AppRoutes/>
          <Footer />
      </div>
    </ContextManager>
  )
}

export default App