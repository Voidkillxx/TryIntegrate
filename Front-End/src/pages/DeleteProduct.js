import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DeleteProduct = ({ show, handleClose, product, handleConfirmDelete }) => {
  if (!product) return null; 

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete the product: <strong>{product.product_name}</strong>?
        <br/>
        This action cannot be undone.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={() => handleConfirmDelete(product.id)}>
          Delete Product
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteProduct;