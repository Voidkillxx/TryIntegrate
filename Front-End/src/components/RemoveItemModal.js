import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const RemoveItemModal = ({ show, handleClose, item, handleConfirmRemove }) => {
  if (!item) return null;

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Remove Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to remove **{item.name}** from your cart?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={() => handleConfirmRemove(item.id)}>
          Remove
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RemoveItemModal;