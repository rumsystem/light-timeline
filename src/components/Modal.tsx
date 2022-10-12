import { IoMdClose } from 'react-icons/io';
import { Dialog, DialogProps } from '@material-ui/core';
import DrawerModal from 'components/DrawerModal';
import { isMobile } from 'utils/env';

interface IProps extends DialogProps {
  hideCloseButton?: boolean
}

export default (props: IProps) => {
  const { hideCloseButton, ...DialogProps } = props;
  
  if (isMobile) {
    return (
      <DrawerModal
        hideCloseButton={hideCloseButton}
        open={props.open}
        onClose={props.onClose as any}
      >
        {props.children}
      </DrawerModal>
    )
  }

  return (
    <Dialog {...DialogProps} className="flex items-center justify-center">
      <div className="bg-white rounded-12">
        {!hideCloseButton && (
          <div
            className="text-gray-6d text-22 p-4 top-0 right-0 absolute cursor-pointer z-10"
            onClick={props.onClose as any}
            data-test-id="dialog-close-button"
          >
            <IoMdClose />
          </div>
        )}
        {props.children}
      </div>
    </Dialog>
  );
};
