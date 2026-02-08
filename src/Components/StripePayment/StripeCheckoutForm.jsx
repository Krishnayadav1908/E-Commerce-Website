import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const StripeCheckoutForm = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    setSuccess(null);

    if (!stripe || !elements) {
      setProcessing(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: "if_required",
    });

    if (error) {
      setError(error.message);
      setProcessing(false);
    } else {
      setSuccess("Payment successful!");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement className="p-2 border rounded" />
      <button
        type="submit"
        disabled={!stripe || processing}
        className="bg-purple-600 text-white px-4 py-2 rounded w-full mt-2"
      >
        {processing ? "Processing..." : "Pay Now"}
      </button>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
    </form>
  );
};

export default StripeCheckoutForm;
