import React, { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripeCheckoutForm from "./StripeCheckoutForm";

const StripePayment = ({ amount }) => {
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleStartPayment = async () => {
    // Fetch Stripe public key from backend
    const keyRes = await fetch("/api/stripe-public-key");
    const { key } = await keyRes.json();
    setStripePromise(loadStripe(key));

    // Stripe expects amount in paise, minimum 5000 (₹50)
    let validAmount = amount * 100;
    if (validAmount < 5000) validAmount = 5000;

    // Create payment intent on backend
    const res = await fetch("/api/stripe/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: validAmount }),
    });
    const data = await res.json();
    if (!data.clientSecret) {
      alert("Payment intent creation failed");
      return;
    }
    setClientSecret(data.clientSecret);
    setShowForm(true);
  };

  return (
    <div>
      {!showForm && (
        <button
          onClick={handleStartPayment}
          className="bg-purple-600 text-white px-4 py-2 rounded mt-4 w-full"
        >
          Pay with Stripe (Test)
        </button>
      )}
      {showForm && stripePromise && clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: { theme: "stripe" },
            paymentMethodOrder: ["card", "upi"],
          }}
        >
          <StripeCheckoutForm clientSecret={clientSecret} />
        </Elements>
      )}
    </div>
  );
};

export default StripePayment;
