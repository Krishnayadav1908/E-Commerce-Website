import { XMarkIcon } from "@heroicons/react/24/solid"

const OrderCard = props => {
    const { id, title, imageUrl, price, handleDelete } = props
    let renderXMarkIcon
    if (handleDelete) {
        renderXMarkIcon = <XMarkIcon  onClick={() => handleDelete(id)} className='h-6 w-6 text-black cursor-pointer'></XMarkIcon>
    }

    const handleImageError = (e) => {
        // Use a solid color background as fallback instead of external URL
        e.target.style.display = 'none'
        e.target.parentElement.style.backgroundColor = '#e5e7eb'
    }

    return (
        <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
                <figure className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                    {imageUrl ? (
                        <img className="w-full h-full rounded-lg object-cover"
                        src={imageUrl}
                        alt={title}
                        onError={handleImageError} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                    )}
                </figure>
                <p className="text-sm font-light">{title}</p>
            </div>
            <div className=" flex items-center gap-2">
                <p className="text-lg font-medium">Rs.{price}</p>
                {renderXMarkIcon}
            </div>
        </div>
    )
}

export default OrderCard