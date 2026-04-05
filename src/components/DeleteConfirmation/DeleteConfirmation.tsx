import { Modal, Button } from "antd";

interface DeleteConfirmationProps {
  id: string;
  titleText: string;
  confirmationText: string;
  loading: boolean;
  handleDelete: (id: string) => void;
  handleCancel: () => void;
  open: boolean;
  buttonText?: string;
}

export default function DeleteConfirmation({
  id, 
  titleText, 
  confirmationText, 
  loading, 
  handleDelete, 
  handleCancel, 
  open, 
  buttonText = "Delete"
}: DeleteConfirmationProps) {
    return (
        <Modal
            open={open}
            title={titleText}
            // onOk={handleDelete}
            onCancel={handleCancel}
            footer={[
                <Button 
                  key="delete"
                  type="primary"
                  loading={loading}
                  className="bg-[#4542CC] text-white hover:!bg-[#4542CC] hover:!opacity-90"
                  onClick={()=>handleDelete(id)}
                  disabled={loading} // Disable button while loading
                >
                  {buttonText}
                </Button>,
              ]}
        >
            <p>{confirmationText}</p>
        </Modal>
    );

}