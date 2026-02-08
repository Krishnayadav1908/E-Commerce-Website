import Footer from "../Footer";

const Layout = ({ children }) => {
  return (
    <>
      {/* Add top margin to prevent content from hiding behind navbar */}
      <main className="min-h-screen bg-gray-50 mt-16">{children}</main>

      <Footer />
    </>
  );
};

export default Layout;
