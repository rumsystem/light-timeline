import { observer } from 'mobx-react-lite';
import Modal from 'components/Modal';
import Button from 'components/Button';
import { useStore } from 'store';

export default observer(() => {
  const { confirmDialogStore } = useStore();
  const {
    open,
    ok,
    cancel,
    content,
    cancelText,
    cancelDisabled,
    okText = '确定',
    contentClassName,
    loading,
  } = confirmDialogStore;

  return (
    <Modal
      hideCloseButton
      open={open}
      onClose={() => {
        if (!cancel) {
          confirmDialogStore.hide();
        }
      }}
    >
      <div className="pt-10 pb-8 px-12">
        <div className="flex items-center justify-center min-h-[70px] md:min-h-[60px]">
          <div
            className={`text-slate-600 leading-7 ${contentClassName} md:min-w-[160px] md:max-w-[250px] text-center text-16`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
        <div className="flex mt-[26px] items-center justify-center w-full">
          {!cancelDisabled && (
            <Button
              size="large"
              className="w-[110px] mr-5 opacity-70"
              outline
              onClick={() => {
                if (cancel) {
                  cancel();
                } else {
                  confirmDialogStore.hide();
                }
              }}>
              {cancelText}
            </Button>
          )}
          <Button size="large" className={`${cancelDisabled ? 'w-[150px]' : 'w-[110px]'}`} onClick={() => ok()} isDoing={loading}>
            {okText}
          </Button>
        </div>
      </div>
    </Modal>
  );
});
