import { XMarkIcon } from "@heroicons/react/24/solid";

const OrderCard = (props) => {
  const {
    id,
    title,
    imageUrl,
    price,
    handleDelete,
    quantity,
    onIncrease,
    onDecrease,
    subtotal,
    showRemoveLabel,
  } = props;
  let renderRemoveAction;
  if (handleDelete) {
    renderRemoveAction = showRemoveLabel ? (
      <button
        type="button"
        onClick={() => handleDelete(id)}
        className="text-xs font-semibold text-slate-500 hover:text-slate-800"
      >
        Remove
      </button>
    ) : (
      <XMarkIcon
        onClick={() => handleDelete(id)}
        className="h-6 w-6 text-black cursor-pointer"
      ></XMarkIcon>
    );
  }

  const handleImageError = (e) => {
    // Use a solid color background as fallback instead of external URL
    e.target.style.display = "none";
    e.target.parentElement.style.backgroundColor = "#e5e7eb";
  };

  return (
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center gap-2">
        <figure className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
          {imageUrl ? (
            <img
              className="w-full h-full rounded-lg object-cover"
              src={imageUrl}
              alt={title}
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
              No Image
            </div>
          )}
        </figure>
        <p className="text-sm font-light">{title}</p>
      </div>
      <div className=" flex items-center gap-3">
        {typeof quantity === "number" && (
          <div className="flex items-center gap-2 rounded-full border border-gray-200 px-2 py-1">
            <button
              type="button"
              onClick={onDecrease}
              className="h-6 w-6 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-100"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="text-sm font-medium text-gray-700">
              {quantity}
            </span>
            <button
              type="button"
              onClick={onIncrease}
              className="h-6 w-6 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-100"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        )}
        <div className="flex flex-col items-end">
          <p className="text-lg font-medium">Rs.{price}</p>
          {typeof subtotal === "number" && (
            <p className="text-xs text-slate-500">Subtotal: Rs.{subtotal}</p>
          )}
        </div>
        {renderRemoveAction}
      </div>
    </div>
  );
};

export default OrderCard;
