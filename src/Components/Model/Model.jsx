import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import './Model.css'; 

const Model = ({ isOpen, closeModel, title, description, children ,className}) => {
  return (
    <>
      <Dialog open={isOpen} as="div" className="modal-add-container" onClose={closeModel} __demoMode>
        <DialogBackdrop className="modal-add-backdrop" />
        <div className="modal-add-wrapper">
          <div className="modal-add-content">
            <DialogPanel transition className="modal-add-panel">
              {title && (
                <DialogTitle as="h3" className={className?className:"modal-add-title"}>
                  {title}
                </DialogTitle>
              )}
              {description && <p className="modal-add-description">{description}</p>}
              <div className="modal-add-body">{children}</div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default Model;
