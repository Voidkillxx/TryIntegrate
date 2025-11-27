import React, { useContext } from 'react';
import { Row, Col, Image, Button, Form } from 'react-bootstrap';
import { CartContext } from '../context/CartContext';
import { calculateSellingPrice } from '../utils/PricingUtils'; 
import '../Styles/CartItem.css'; 

const CartItem = ({ item }) => {
  const {
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    selectedItems,
    toggleSelectItem,
    loading // Add loading state if needed
  } = useContext(CartContext);

  if (!item) return null;

  // FIX: Extract the nested 'product' object from the database response
  // If product is null (deleted), fallback to empty object to prevent crash
  const product = item.product || {};

  const isSelected = selectedItems.includes(item.id);

  // --- Handlers ---
  const handleRemove = () => {
      // Use product.product_name
      if (window.confirm(`Are you sure you want to remove ${product.product_name} from your cart?`)) {
        removeFromCart(item.id);
      }
  };

  const handleDecrease = () => {
      if (item.quantity === 1) {
          handleRemove();
      } else {
        decreaseQuantity(item.id);
      }
  };

  const handleIncrease = () => {
      const currentQuantity = item.quantity || 0;
      // Check stock from the PRODUCT object
      const stock = product.stock || 0;

      if (currentQuantity + 1 > stock) {
          // Use product.product_name
          alert(`Cannot add more than ${stock} units of ${product.product_name}.`);
          return;
      }

      increaseQuantity(item.id);
  };
  // ---------------------------------

  const quantity = item.quantity || 0;
  
  // FIX: Use properties from 'product' object
  // Ensure we handle cases where price might be string "10.00" by casting to Number
  const price = parseFloat(product.price) || 0;
  const discount = parseFloat(product.discount) || 0;
  
  const sellingPrice = calculateSellingPrice(price, discount);

  return (
    <Row className="align-items-center cart-item-row g-0 shadow-sm mb-3 bg-white rounded border"> 
      {/* 1. Left: Checkbox & Image */}
      <Col xs={4} md={2} className="d-flex align-items-center p-2">
        <Form.Check
          type="checkbox"
          id={`select-item-${item.id}`}
          checked={isSelected}
          onChange={() => toggleSelectItem(item.id)}
          aria-label={`Select ${product.product_name}`}
          className="me-2"
        />
        <div className="cart-item-img-wrapper" style={{width: '80px', height: '80px'}}>
            {/* FIX: Use product.image_url */}
            <Image 
                src={product.image_url || '/img/placeholder.png'} 
                alt={product.product_name} 
                fluid 
                rounded 
                style={{width: '100%', height: '100%', objectFit: 'cover'}}
            />
        </div>
      </Col>

      {/* 2. Middle: Info */}
      <Col xs={4} md={4} className="ps-2">
        {/* FIX: Use product.product_name */}
        <h5 className="cart-item-name text-truncate mb-1" title={product.product_name}>
            {product.product_name || 'Unknown Product'}
        </h5> 
        <p className="cart-item-unit-price mb-0 text-muted small">
            Unit: ₱{sellingPrice.toFixed(2)}
        </p> 
      </Col>

      {/* 3. Right: Actions (Qty, Total, Remove) */}
      <Col xs={4} md={6}>
        <div className="cart-item-actions d-flex flex-column flex-md-row align-items-end align-items-md-center justify-content-md-between p-2">
            
            {/* Qty Controls */}
            <div className="qty-controls d-flex align-items-center mb-1 mb-md-0">
                <Button variant="outline-secondary" size="sm" className="qty-btn" onClick={handleDecrease} disabled={loading}>-</Button>
                <span className="qty-val mx-2 fw-bold">{quantity}</span>
                <Button variant="outline-secondary" size="sm" className="qty-btn" onClick={handleIncrease} disabled={loading}>+</Button>
            </div>

            {/* Total Price */}
            <strong className="cart-item-total mb-1 mb-md-0 mx-md-3 text-success">
                ₱{(quantity * sellingPrice).toFixed(2)}
            </strong> 
            
            {/* Remove Link */}
            <div onClick={handleRemove} className="cart-item-remove text-danger" role="button" style={{cursor: 'pointer'}}>
                <small><i className="bi bi-trash"></i> Remove</small>
            </div>
        </div>
      </Col>
    </Row>
  );
};

export default CartItem;