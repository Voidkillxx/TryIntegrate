import React, { useState, useEffect } from "react";
import "../Styles/AdminDashboard.css";
import Pagination from '../components/Pagination';
import DeleteProduct from './DeleteProduct';
import { useNavigate } from "react-router-dom";
import { calculateSellingPrice } from '../utils/PricingUtils';
import { fetchProducts, fetchCategories, fetchUsers, deleteProduct, updateUserRole } from "../utils/api";

function AdminDashboard({ token }) {
    const navigate = useNavigate();

    // State management
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    // activeTab remains 'products' by default. Since buttons are gone, this effectively locks the view.
    const [activeTab, setActiveTab] = useState('products');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const productsPerPage = 10;

    // Delete Logic States
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [deletionStatus, setDeletionStatus] = useState('idle'); // Options: 'idle', 'deleting', 'success', 'error'

    // --- FETCH DATA ---
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Logic preserved for both tabs, though UI currently only shows products
                if (activeTab === 'products') {
                    const prodData = await fetchProducts(currentPage);
                    if (prodData.data) {
                        setProducts(prodData.data);
                        setTotalPages(prodData.last_page);
                    }
                    const catData = await fetchCategories();
                    setCategories(catData);
                } else if (activeTab === 'users') {
                    const userData = await fetchUsers();
                    setUsers(userData);
                }
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [currentPage, activeTab]);

    // --- HANDLERS ---
    const handleSearch = (e) => { setSearchTerm(e.target.value.toLowerCase()); setCurrentPage(1); };
    const handleFilter = (categoryName) => { setFilterCategory(filterCategory === categoryName ? "" : categoryName); setCurrentPage(1); };

    // Filtering logic for products
    const filteredProducts = products.filter((p) => {
        const matchesSearch = p.product_name.toLowerCase().includes(searchTerm);
        const categoryName = p.category ? p.category.category_name : 'Uncategorized';
        const matchesCategory = filterCategory === "" || categoryName === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleDeleteClick = (product) => { 
        setProductToDelete(product); 
        setDeletionStatus('idle'); // Ensure status is clean when opening
        setShowDeleteModal(true); 
    };

    const handleConfirmDelete = async (productId) => {
        setDeletionStatus('deleting');
        try {
            await deleteProduct(productId);
            
            // Wait a moment for UX purposes if the API is too fast, or just proceed
            setDeletionStatus('success');
            
            // Refresh data immediately in background
            const prodData = await fetchProducts(currentPage);
            if (prodData.data) setProducts(prodData.data);

            // Close modal after 5 seconds
            setTimeout(() => {
                handleCloseDeleteModal();
            }, 5000);

        } catch (err) {
            console.error("Delete failed", err);
            setDeletionStatus('error');
            // Optional: Also close on error after 5s, or let user close it manually
             setTimeout(() => {
                handleCloseDeleteModal();
            }, 5000);
        }
    };

    const handleCloseDeleteModal = () => { 
        setShowDeleteModal(false); 
        setProductToDelete(null); 
        setDeletionStatus('idle');
    };

    const handleToggleRole = async (user) => {
        try {
            const newRole = !user.is_admin;
            await updateUserRole(user.id, newRole);
            alert(`User ${user.username} role updated.`);
            const userData = await fetchUsers();
            setUsers(userData);
        } catch (e) {
            alert("Failed to update role");
        }
    };

    if (loading && products.length === 0 && users.length === 0) {
        return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}><div className="spinner-border text-primary"></div></div>;
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <div className="dashboard-nav-buttons">
                    {/* Removed Products and Users buttons as requested */}
                    {/* Only showing Add Product button if we are in products view (default) */}
                    {activeTab === 'products' && (
                        <button onClick={() => navigate("/admin/add")} className="dashboard-nav-btn">
                            Add Product
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            {activeTab === 'products' ? (
                <>
                    <div className="filter-search-row">
                        <div className="filter-section">
                            <div className="filter-label">Filter by Category</div>
                            <div className="category-pills">
                                <button className={`category-pill ${filterCategory === "" ? "active" : ""}`} onClick={() => setFilterCategory("")}>All Categories</button>
                                {categories.map((cat) => (
                                    <button key={cat.id} className={`category-pill ${filterCategory === cat.category_name ? "active" : ""}`} onClick={() => handleFilter(cat.category_name)}>{cat.category_name}</button>
                                ))}
                            </div>
                        </div>
                        <div className="search-container"><input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearch} className="search-input" /></div>
                    </div>
                    <div className="table-wrapper">
                        <table className="product-table">
                            <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Discount</th><th>Selling Price</th><th>Actions</th></tr></thead>
                            <tbody>
                                {filteredProducts.length === 0 ? (
                                    <tr><td colSpan="8" className="empty-message">No products found</td></tr>
                                ) : (
                                    filteredProducts.map((p) => (
                                        <tr key={p.id}>
                                            <td>{p.image_url ? <img src={p.image_url} alt={p.product_name} className="product-img" /> : <span className="text-muted small">No Img</span>}</td>
                                            <td>{p.product_name}</td>
                                            <td>{p.category ? p.category.category_name : 'Uncategorized'}</td>
                                            <td>₱{Number(p.price).toFixed(2)}</td>
                                            <td>{p.stock || 0}</td>
                                            <td>{p.discount || 0}%</td>
                                            <td>₱{calculateSellingPrice(p.price, p.discount).toFixed(2)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="action-btn edit-icon"
                                                        onClick={() => navigate(`/admin/edit/${p.slug || p.id}`)}
                                                        title="Edit"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button className="action-btn delete-icon" onClick={() => handleDeleteClick(p)} title="Delete">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && <Pagination itemsPerPage={productsPerPage} totalItems={totalPages * productsPerPage} currentPage={currentPage} paginate={paginate} />}
                </>
            ) : (
                /* Hidden/Unreachable User Table logic preserved in case you re-enable navigation */
                <div className="table-wrapper">
                    <table className="product-table">
                        <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.id}</td><td>{u.username}</td><td>{u.email}</td>
                                    <td><span style={{ padding: '2px 6px', borderRadius: '4px', background: u.is_admin ? '#dc3545' : '#007bff', color: 'white', fontSize: '0.8rem' }}>{u.is_admin ? 'Admin' : 'User'}</span></td>
                                    <td>
                                        <button className="action-btn edit-icon" onClick={() => handleToggleRole(u)}>
                                            {u.is_admin ? 'Demote' : 'Promote'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <DeleteProduct 
                show={showDeleteModal} 
                handleClose={handleCloseDeleteModal} 
                product={productToDelete} 
                handleConfirmDelete={handleConfirmDelete} 
                deletionStatus={deletionStatus} 
            />
        </div>
    );
}
export default AdminDashboard;