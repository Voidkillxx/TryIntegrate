import React, { useContext, useState, useEffect } from 'react';
import { Navbar, Container, Nav, Form, FormControl, Badge } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import LogoutConfirmModal from './LogoutConfirmModal';
import '../Styles/Navbar.css'; 
import 'bootstrap-icons/font/bootstrap-icons.css';

const AppNavbar = ({ currentUser, handleLogout, searchTerm, setSearchTerm, handleResetFilters, showAlert }) => {
  const { cartItems } = useContext(CartContext);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  // 1. State to control menu visibility
  const [expanded, setExpanded] = useState(false);

  // 2. Lock background scroll when menu is open
  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [expanded]);

  // Helper: Close menu immediately when an item is clicked
  const closeMenu = () => setExpanded(false);

  const handleShowLogoutModal = () => {
    setShowLogoutModal(true);
    closeMenu(); 
  };

  const handleCloseLogoutModal = () => setShowLogoutModal(false);
  const handleConfirmLogout = () => { handleLogout(); handleCloseLogoutModal(); };

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartBadgeText = itemCount > 99 ? '99+' : itemCount;

  const handleCartClick = (event) => {
    if (!currentUser) {
      event.preventDefault();
      showAlert('Please log in to view the cart.', 'warning');
      navigate('/login');
    }
    closeMenu();
  };

  const handleLogoClick = () => {
    handleResetFilters();
    navigate(isAdminRoute ? '/admin' : '/');
    closeMenu();
  };

  const handleNavClick = () => {
    handleResetFilters();
    closeMenu();
  };

  return (
    <>
      <Navbar 
        expand="lg" 
        className="navbar-custom" 
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
      >
        <Container fluid>
          <Navbar.Brand as="div" onClick={handleLogoClick} className="navbar-logo-wrapper"> 
            <img
              src="/img/logo.png"
              alt="Grocery Store Logo"
              className="navbar-logo"
            />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav">

            {/* Nav Links */}
            {!isAdminRoute && (
              <Nav className="me-auto nav-links-custom">
                <Nav.Link as={Link} to="/" onClick={handleNavClick}>Home</Nav.Link>
                <Nav.Link as={Link} to="/products" onClick={handleNavClick}>Products</Nav.Link>
              </Nav>
            )}
            {isAdminRoute && <Nav className="me-auto"></Nav>}

            {/* Search Bar */}
            {!isAdminRoute && (
              <Form className="d-flex search-bar-custom" onSubmit={(e) => { e.preventDefault(); closeMenu(); }}>
                <FormControl
                  type="search"
                  placeholder="Search..."
                  className="me-2"
                  aria-label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form>
            )}

            {/* Right Side Nav */}
            <Nav>
              {currentUser ? (
                <Nav.Link onClick={handleShowLogoutModal} className="logout-button">
                  Logout
                </Nav.Link>
              ) : (
                <Nav.Link as={Link} to="/login" className="login-button-custom" onClick={closeMenu}>
                  Login
                </Nav.Link>
              )}

              {!isAdminRoute && (!currentUser || currentUser.role !== 'admin') && (
                <Nav.Link
                  as={Link}
                  to="/cart"
                  className="cart-icon-link"
                  onClick={handleCartClick}
                >
                  <i className="bi bi-cart"></i>
                  {itemCount > 0 && (
                    <Badge pill bg="danger" className="cart-badge">
                      {cartBadgeText}
                    </Badge>
                  )}
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <LogoutConfirmModal
        show={showLogoutModal}
        handleClose={handleCloseLogoutModal}
        handleConfirmLogout={handleConfirmLogout}
      />
    </>
  );
};

export default AppNavbar;