import Layout from "../../Components/Layout";

const Performance = () => {
  return (
    <Layout>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-3xl bg-white shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900">Performance & SEO Audit</h1>
          <p className="mt-3 text-gray-600">
            This page highlights the performance and SEO improvements made in KrishCart.
            Replace the sample numbers with your latest Lighthouse report.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-gray-100 p-5 bg-gray-50">
              <p className="text-xs uppercase text-gray-500">LCP</p>
              <p className="text-2xl font-semibold text-gray-900">2.4s</p>
              <p className="text-sm text-gray-600 mt-2">Largest Contentful Paint</p>
            </div>
            <div className="rounded-2xl border border-gray-100 p-5 bg-gray-50">
              <p className="text-xs uppercase text-gray-500">TTFB</p>
              <p className="text-2xl font-semibold text-gray-900">350ms</p>
              <p className="text-sm text-gray-600 mt-2">Time To First Byte</p>
            </div>
            <div className="rounded-2xl border border-gray-100 p-5 bg-gray-50">
              <p className="text-xs uppercase text-gray-500">CLS</p>
              <p className="text-2xl font-semibold text-gray-900">0.02</p>
              <p className="text-sm text-gray-600 mt-2">Cumulative Layout Shift</p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Key Improvements</h2>
              <ul className="mt-4 space-y-3 text-gray-700">
                <li>Server-side pagination + filtering for product grid.</li>
                <li>Lazy-loaded product images with async decoding.</li>
                <li>Hero image prioritized for faster LCP.</li>
                <li>Client-side debounce on search to reduce API calls.</li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">SEO Enhancements</h2>
              <ul className="mt-4 space-y-3 text-gray-700">
                <li>Meta description and Open Graph tags for previews.</li>
                <li>Clean URLs for category navigation.</li>
                <li>Consistent headings and semantic structure.</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-gray-100 p-6 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Audit Evidence</h2>
            <p className="text-gray-600 mt-2">
              Add a screenshot or link to the latest Lighthouse report here.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Performance;
