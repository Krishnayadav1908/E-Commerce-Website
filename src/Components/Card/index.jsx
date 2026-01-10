import { useContext } from 'react'
import { PlusIcon } from '@heroicons/react/24/solid'
import { ShoppingCartContext } from '../../Context'

const Card = ({ data }) => {
  const context = useContext(ShoppingCartContext)

  const showProduct = () => {
    context.openProductDetail()
    context.setProductToShow(data)
  }

  const addProductsToCart = (event, productData) => {
    event.stopPropagation()
    context.setCartProducts([...context.cartProducts, productData])
    context.setCount(context.count + 1)
    context.openCheckoutSideMenu()
    context.closeProductDetail()
  }

  return (
    <div
      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
      onClick={showProduct}
    >
      {/* Image */}
      <figure className="relative h-56 w-full overflow-hidden rounded-t-2xl">
        <span className="absolute bottom-3 left-3 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-medium">
  {data.category}
</span>

      <img
        src={data.image}
        alt={data.title}
        onError={(e) => {
        e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'
        }}
        className="w-full h-56 object-cover"
      />

        <button
          className="absolute top-3 right-3 flex items-center justify-center w-9 h-9 rounded-full bg-black text-white hover:scale-110 transition"
          onClick={(event) => addProductsToCart(event, data)}
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </figure>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
          {data.title}
        </h3>

        <p className="text-lg font-semibold text-black">
          ${data.price}
        </p>
      </div>
    </div>
  )
}

export default Card