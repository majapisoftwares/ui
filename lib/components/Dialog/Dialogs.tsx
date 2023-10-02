import { useSnapshot } from "valtio";
import dialogsState, { IDialog } from "./dialogs.state";
import { ComponentProps, ReactElement, ReactNode, useEffect } from "react";
import Modal, { useModalState } from "../Modal";

function Dialog({
  icon,
  open,
  title,
  content,
  actions,
  _id,
  hideCloseButton,
  containerClassName,
  panelClassName,
}: IDialog & { containerClassName?: string; panelClassName?: string }) {
  let [modalOpen, { openModal, closeModal }] = useModalState();

  useEffect(() => {
    if (open) {
      openModal();
    } else {
      closeModal();
    }
  }, [closeModal, open, openModal]);

  return (
    <Modal
      open={modalOpen}
      onClose={closeModal}
      panelClassName={panelClassName}
    >
      <Modal.Container className={containerClassName}>
        {!hideCloseButton && <Modal.CloseButton onClick={closeModal} />}
        {icon && <Modal.Icon>{icon as ReactElement}</Modal.Icon>}
        {title && <Modal.Title>{title as ReactNode}</Modal.Title>}
        {content && (
          <Modal.Content>
            {typeof content === "function"
              ? content(_id)
              : (content as ReactNode)}
          </Modal.Content>
        )}
        {actions && (
          <Modal.Actions>
            {typeof actions === "function"
              ? actions(_id)
              : (actions as ReactNode)}
          </Modal.Actions>
        )}
      </Modal.Container>
    </Modal>
  );
}

export default function Dialogs({
  containerClassName,
  panelClassName,
}: {
  containerClassName?: string;
  panelClassName?: string;
}) {
  let { dialogs, setRendered } = useSnapshot(dialogsState);

  useEffect(() => {
    setRendered(true);
    return () => {
      setRendered(false);
    };
  }, [setRendered]);

  return (
    <>
      {dialogs.map((dialog) => (
        <Dialog
          key={dialog._id}
          {...(dialog as ComponentProps<typeof Dialog>)}
          containerClassName={containerClassName}
          panelClassName={panelClassName}
        />
      ))}
    </>
  );
}
