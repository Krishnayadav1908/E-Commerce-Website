import { ChevronRightIcon } from "@heroicons/react/24/solid";

const OrdersCard = (props) => {
  const { totalPrice, totalProducts, date, status, paymentStatus } = props;
  const normalizedStatus = (paymentStatus || status || "pending").toLowerCase();
  const isPaid = normalizedStatus === "paid" || normalizedStatus === "success";

  // Format date if needed
  let displayDate = date;
  if (date) {
    // Try to format if it's an ISO string
    const d = new Date(date);
    if (!isNaN(d)) {
      displayDate = d.toLocaleDateString();
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-teal-200 p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isPaid
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {isPaid ? "Paid" : "Pending"}
          </span>
          <ChevronRightIcon className="h-5 w-5 text-gray-400" />
        </div>
        <p className="text-gray-600 text-sm mb-2">{displayDate}</p>
        <p className="text-slate-500 text-xs mb-4">
          {totalProducts} {totalProducts === 1 ? "item" : "items"}
        </p>
      </div>
      <div className="pt-4 border-t border-gray-100">
        <p className="text-2xl font-bold bg-gradient-to-r from-black to-teal-700 bg-clip-text text-transparent">
          Rs.{totalPrice}
        </p>
      </div>
    </div>
  );
};

export default OrdersCard;
