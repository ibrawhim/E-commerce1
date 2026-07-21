import { Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Products from "./pages/Products";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PaymentResult from "./pages/PaymentResult";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import OrderSuccess from "./pages/OrderSuccess";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            <Route path="/"                element={<Products />} />
            <Route path="/cart"            element={<Cart />} />
            <Route path="/checkout"        element={<Checkout />} />
            <Route path="/payment/success" element={<PaymentResult />} />
            <Route path="/order-success"   element={<OrderSuccess />} />
            <Route path="/orders"          element={<MyOrders />} />
            <Route path="/orders/:orderId" element={<OrderDetails />} />
            <Route path="/signin"          element={<SignIn />} />
            <Route path="/signup"          element={<SignUp />} />
          </Routes>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;