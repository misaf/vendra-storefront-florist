// The bundled starter theme. Keep route composition here; reusable data,
// state, and UI capabilities continue to live in feature modules.
export { default as HomePage, generateMetadata as generateHomeMetadata } from "@/modules/home/page";
export { default as ProductsPage, generateMetadata as generateProductsMetadata } from "@/modules/products/page";
export { default as ProductDetailPage, generateMetadata as generateProductDetailMetadata } from "@/modules/products/detail-page";
export { default as BlogPage, generateMetadata as generateBlogMetadata } from "@/modules/blog/page";
export { default as BlogDetailPage, generateMetadata as generateBlogDetailMetadata } from "@/modules/blog/detail-page";
export { default as FaqPage, generateMetadata as generateFaqMetadata } from "@/modules/faq/page";
export { default as AboutPage, generateMetadata as generateAboutMetadata } from "./pages/about";
export { default as ContactPage, generateMetadata as generateContactMetadata } from "./pages/contact";
export { default as CheckoutPage, generateMetadata as generateCheckoutMetadata } from "./pages/checkout";
export { default as CheckoutSuccessPage } from "./pages/checkout-success";
