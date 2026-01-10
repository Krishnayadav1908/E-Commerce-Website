import Footer from '../Footer'

const Layout = ({ children }) => {
  return (
    <>
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>

      <Footer />
    </>
  )
}

export default Layout