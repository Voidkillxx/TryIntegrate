import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import CategoryFilter from '../components/CategoryFilter';
import '../Styles/ProductList.css';

const ProductList = ({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  onAddToCart,
  currentPage,
  lastPage, // NEW PROP
  setCurrentPage,
  loading
}) => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const categoryIdFromUrl = searchParams.get('category');
    if (categoryIdFromUrl) {
      onSelectCategory(parseInt(categoryIdFromUrl));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // If category changes, reset to page 1
    setCurrentPage(1);
  }, [selectedCategory, setCurrentPage]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container className="my-5">
      <div className="product-list-container">
        <h3 className="product-list-title">All Products</h3>
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />
        
        {loading ? (
           <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
              <p className="mt-2 text-muted">Loading products...</p>
           </div>
        ) : (
           <>
             <Row className="g-2 mt-3">
                {(products || []).map(product => (
                    <Col key={product.id} xs={6} sm={4} md={3} lg={3}>
                    <ProductCard product={product} onAddToCart={onAddToCart} />
                    </Col>
                ))}
                {(!products || products.length === 0) && (
                    <div className="col-12 text-center py-5 text-muted">
                        <h5>No products found.</h5>
                    </div>
                )}
             </Row>
             
             {/* Pagination */}
             {/* We pass lastPage as totalItems and 1 as itemsPerPage so the math (lastPage / 1) results in the correct page count */}
             {lastPage > 1 && (
                 <Pagination 
                    itemsPerPage={1} 
                    totalItems={lastPage} 
                    currentPage={currentPage} 
                    paginate={paginate} 
                 />
             )}
           </>
        )}
      </div>
    </Container>
  );
};

export default ProductList;