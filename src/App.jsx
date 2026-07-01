import { Routes, Route } from "react-router-dom";
import  {CartProvider}  from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Products from "./pages/Products";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

function App() {
  return (
    <CartProvider>
      <Navbar />
      <Routes>
        <Route path="/"         element={<Products />} />
        <Route path="/cart"     element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/signin"   element={<SignIn />} />
        <Route path="/signup"   element={<SignUp />} />
      </Routes>
      <Footer />
    </CartProvider>
  );
}

export default App;