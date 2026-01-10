import { XMarkIcon } from '@heroicons/react/24/solid'
import { useContext } from 'react'
import { ShoppingCartContext } from '../../Context'

const ProductDetail = () => {
  const context = useContext(ShoppingCartContext)

  return (
    <aside
      className={`fixed top-0 right-0 z-50 h-full w-[420px] bg-white shadow-2xl rounded-l-3xl transform transition-transform duration-300 ${
        context.isProductDetailOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-5 border-b">
        <h2 className="text-lg font-semibold">Product Details</h2>
        <button onClick={context.closeProductDetail}>
          <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-black" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col p-6 gap-5 overflow-y-auto h-[calc(100%-80px)]">
        <img
          className="w-full h-64 object-cover rounded-2xl"
          src={context.productToShow?.images?.[0]}
          alt={context.productToShow?.title}
        />

        <span className="text-sm text-gray-500">
          {context.productToShow?.category?.name}
        </span>

        <h3 className="text-xl font-semibold">
          {context.productToShow?.title}
        </h3>

        <p className="text-2xl font-bold">
          ${context.productToShow?.price}
        </p>

        <p className="text-sm text-gray-600 leading-relaxed">
          {context.productToShow?.description}
        </p>

        <button
          className="mt-auto bg-black text-white py-3 rounded-full font-medium hover:scale-105 transition"
          onClick={() => {
            context.setCartProducts([
              ...context.cartProducts,
              context.productToShow,
            ])
            context.setCount(context.count + 1)
            context.openCheckoutSideMenu()
            context.closeProductDetail()
          }}
        >
          Add to Cart
        </button>
      </div>
    </aside>
  )
}

export default ProductDetail