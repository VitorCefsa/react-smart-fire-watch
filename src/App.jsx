import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import MainContent from './components/MainContent/MainContent'
import './App.css'

function App() {
  return (
    <>
      <Header />
      <div className="app-container">
        <MainContent />
      </div>
      <Footer />
    </>
  )
}
export default App
