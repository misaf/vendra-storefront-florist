// The bundled starter theme. Route composition lives here; reusable data,
// state, and UI capabilities continue to live in feature modules.
export {
  default as HomePage,
  generateMetadata as generateHomeMetadata,
} from "./pages/home";
export {
  default as ProductsPage,
  generateMetadata as generateProductsMetadata,
} from "./pages/products";
export {
  default as ProductDetailPage,
  generateMetadata as generateProductDetailMetadata,
} from "./pages/product-detail";
export {
  default as BlogPage,
  generateMetadata as generateBlogMetadata,
} from "./pages/blog";
export {
  default as BlogDetailPage,
  generateMetadata as generateBlogDetailMetadata,
} from "./pages/blog-detail";
export { default as FaqPage, generateMetadata as generateFaqMetadata } from "./pages/faq";
export {
  default as AboutPage,
  generateMetadata as generateAboutMetadata,
} from "./pages/about";
export {
  default as ContactPage,
  generateMetadata as generateContactMetadata,
} from "./pages/contact";
export {
  default as CheckoutPage,
  generateMetadata as generateCheckoutMetadata,
} from "./pages/checkout";
export { default as CheckoutSuccessPage } from "./pages/checkout-success";
