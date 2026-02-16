import { useContext, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Layout from "../../Components/Layout";
import Card from "../../Components/Card";
import ProductDetail from "../../Components/ProductDetail";
import { ShoppingCartContext } from "../../Context";

// Skeleton UI (modern)
const CardSkeleton = () => (
  <div className="w-60 rounded-2xl bg-white shadow-sm p-3 animate-pulse">
    <div className="h-40 bg-gray-200 rounded-xl mb-4"></div>
    <div className="flex justify-between items-center">
      <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
      <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
    </div>
  </div>
);

function Home() {
  const context = useContext(ShoppingCartContext);
  const productsRef = useRef(null);
  const loadMoreRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    const categoryMap = {
      "/clothes": "clothes",
      "/electronics": "electronics",
      "/furnitures": "furniture",
      "/toys": "toy",
      "/others": "others",
    };
    const nextCategory = categoryMap[path] || null;
    if (context.searchByCategory !== nextCategory) {
      context.setSearchByCategory(nextCategory);
    }
  }, [
    location.pathname,
    context.searchByCategory,
    context.setSearchByCategory,
  ]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          context.productsHasMore &&
          !context.productsLoading
        ) {
          context.fetchMoreProducts();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(target);

    return () => observer.unobserve(target);
  }, [
    context.productsHasMore,
    context.productsLoading,
    context.fetchMoreProducts,
  ]);

  const renderView = () => {
    if (!context.items) {
      return Array.from({ length: 12 }).map((_, index) => (
        <CardSkeleton key={index} />
      ));
    }

    if (context.items?.length > 0) {
      return context.items.map((item) => (
        <Card key={item._id || item.id} data={item} />
      ));
    }

    return (
      <div className="col-span-full flex flex-col items-center py-16 text-gray-500">
        <span className="text-lg font-medium">No products found</span>
        <span className="text-sm mt-2">
          Try searching with a different keyword
        </span>
      </div>
    );
  };

  return (
    <Layout>
      {/* HERO BANNER */}
      <div className="relative w-full max-w-7xl mx-auto mb-20 px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-black to-teal-900 text-white shadow-xl">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_70%)] blur-3xl"></div>

          <div className="relative flex flex-col-reverse md:flex-row items-center justify-between px-8 py-16 gap-10">
            {/* Left Content */}
            <div className="max-w-xl text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-wide">
                Elevate Your Lifestyle
              </h1>
              <p className="mt-4 text-gray-300 text-lg md:text-xl">
                Explore premium products from electronics, fashion, furniture,
                and more – curated for a modern lifestyle.
              </p>

              <button
                className="mt-8 bg-teal-500 hover:bg-teal-400 text-white px-8 py-3 rounded-full font-semibold shadow-lg transition-all duration-300"
                onClick={() => {
                  if (productsRef.current) {
                    productsRef.current.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                Shop Now
              </button>
            </div>

            {/* Right Image */}
            <div className="w-full md:w-2/5 mt-10 md:mt-0 flex justify-center">
              <div className="relative w-full h-72 md:h-96 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-transparent z-10"></div>
                <img
                  src="https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&q=80"
                  alt="Hero Banner"
                  loading="eager"
                  decoding="async"
                  fetchpriority="high"
                  width={800}
                  height={600}
                  className="w-full h-full object-cover brightness-90"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Heading */}
      <div
        ref={productsRef}
        className="flex flex-col items-center mb-8 text-center"
      >
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
          onChange={(event) => context.setSearchByTitle(event.target.value)}
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-7xl mx-auto px-4">
        {renderView()}
      </div>

      <div ref={loadMoreRef} className="h-6" aria-hidden="true" />

      {context.items && context.productsHasMore && (
        <div className="flex justify-center mt-10">
          <button
            type="button"
            onClick={context.fetchMoreProducts}
            disabled={context.productsLoading}
            className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 transition disabled:cursor-not-allowed disabled:text-gray-400"
          >
            {context.productsLoading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}

      <ProductDetail />
    </Layout>
  );
}

export default Home;
