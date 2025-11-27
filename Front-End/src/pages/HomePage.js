import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import ProductCard from "../components/ProductCard";
import CategoryCard from "../components/CategoryCard"; 
import "../Styles/HomePage.css";

// FIX: Accept onAddToCart prop from App.js
const HomePage = ({ onAddToCart, loading }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const loadData = async () => {
      setLocalLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('http://localhost:8095/api/categories'),
          fetch('http://localhost:8095/api/products')
        ]);

        const catData = await catRes.json();
        const prodData = await prodRes.json();

        setCategories(catData);

        if (prodData.data) {
          setProducts(prodData.data);
        } else {
          setProducts(prodData);
        }

      } catch (error) {
        console.error("Error loading home data:", error);
      } finally {
        setLocalLoading(false);
      }
    };

    loadData();
  }, []);

  // Slice to show only the first 8 products as "Featured"
  const featuredProducts = products.slice(0, 8);

  // Use prop loading if provided, else local
  const isLoading = loading || localLoading;

  if (isLoading) {
    return (
      <Container className="text-center my-5 py-5">
        <Spinner animation="border" variant="success" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid className="home-container p-0">
      {/* Hero Section */}
      <div className="home-hero mb-5">
        <div className="hero-content">
          <h2>FRESH GROCERIES ONLINE</h2>
          <Link to="/products">
            <button className="home-shop-btn">SHOP NOW</button>
          </Link>
        </div>
      </div>

      {/* Category Section */}
      <section id="categories" className="category-section mb-5">
        <Container>
          <h2 className="home-section-title mb-4 text-start text-success fw-bold">
            Shop by Categories
          </h2>
          <Row className="g-2 justify-content-center">
            {categories.length === 0 ? (
               <p className="text-muted">No categories available.</p>
            ) : (
               categories.map((cat) => (
                 <Col key={cat.id} xs={3} sm={3} md={3} lg={2}>
                   <CategoryCard category={cat} />
                 </Col>
               ))
            )}
          </Row>
        </Container>
      </section>

      {/* Featured Products Section */}
      <section id="products" className="product-section mb-5">
        <Container>
          <h2 className="home-section-title mb-4 text-start text-success fw-bold">
            Featured Products
          </h2>
          <Row className="g-2">
            {featuredProducts.length === 0 ? (
               <p className="text-muted">No featured products available.</p>
            ) : (
               featuredProducts.map((product) => (
                 <Col key={product.id} xs={3} sm={3} md={3} lg={3}>
                   {/* FIX: Use the onAddToCart prop which triggers the Modal */}
                   <ProductCard product={product} onAddToCart={onAddToCart} />
                 </Col>
               ))
            )}
          </Row>
        </Container>
      </section>
    </Container>
  );
};

export default HomePage;