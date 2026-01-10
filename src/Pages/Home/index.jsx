import { useContext } from 'react'
import Layout from '../../Components/Layout'
import Card from '../../Components/Card'
import ProductDetail from '../../Components/ProductDetail'
import { ShoppingCartContext } from '../../Context'

// Skeleton UI (modern)
const CardSkeleton = () => (
  <div className="w-60 rounded-2xl bg-white shadow-sm p-3 animate-pulse">
    <div className="h-40 bg-gray-200 rounded-xl mb-4"></div>
    <div className="flex justify-between items-center">
      <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
      <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
    </div>
  </div>
)

function Home() {
  const context = useContext(ShoppingCartContext)

  const renderView = () => {
    if (!context.items) {
      return Array.from({ length: 12 }).map((_, index) => (
        <CardSkeleton key={index} />
      ))
    }

    if (context.filteredItems?.length > 0) {
      return context.filteredItems.map(item => (
        <Card key={item.id} data={item} />
      ))
    }

    return (
      <div className="col-span-full flex flex-col items-center py-16 text-gray-500">
        <span className="text-lg font-medium">No products found</span>
        <span className="text-sm mt-2">Try searching with a different keyword</span>
      </div>
    )
  }

  console.log('ITEMS:', context.items)
  return (
    <Layout>
      {/* HERO BANNER */}
<div className="relative w-full max-w-7xl mx-auto mb-14 px-4">
  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-black to-gray-800 text-white">
    
    {/* Background Glow */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_60%)]"></div>

    <div className="relative flex flex-col md:flex-row items-center justify-between px-8 py-16 gap-10">
      
      {/* Left Content */}
      <div className="max-w-xl">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Upgrade Your Lifestyle
        </h1>
        <p className="mt-4 text-gray-300 text-lg">
          Discover premium products curated just for you at unbeatable prices.
        </p>

        <button
          className="mt-8 bg-white text-black px-8 py-3 rounded-full font-medium
                     hover:scale-105 transition">
          Shop Now
        </button>
      </div>

      {/* Right Image */}
      <div className="w-full md:w-96">
        <img
          src="https://images.unsplash.com/photo-1523275335684-37898b6baf30"
          alt="Hero Product"
          className="w-full h-64 md:h-72 object-cover rounded-2xl shadow-2xl"
        />
      </div>

    </div>
  </div>
</div>
      {/* Heading */}
      <div className="flex flex-col items-center mb-8 text-center">
  <h2 className="text-3xl font-semibold tracking-tight">
    Featured Products
  </h2>
  <p className="text-sm text-gray-500 mt-2">
    Handpicked items you’ll love
  </p>
</div>

      {/* Search */}
      <div className="flex justify-center mb-10">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full max-w-md rounded-full border border-black/10 px-6 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 transition"
          onChange={(event) =>
            context.setSearchByTitle(event.target.value)
          }
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-7xl mx-auto px-4">
        {renderView()}
      </div>

      <ProductDetail />
    </Layout>
  )
}

export default Home