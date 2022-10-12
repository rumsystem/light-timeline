import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { StoreProvider } from 'store';
import { ThemeRoot } from 'utils/theme';
import Dialog from 'components/Dialog';
import { isMobile } from 'utils/env';
import DrawerModal from 'components/DrawerModal';
import { useStore } from 'store';
import { ethers } from 'ethers';
import store from 'store2';
import KeystoreModal from './KeystoreModal';
import Button from 'components/Button';
import sleep from 'utils/sleep';

const Main = observer(() => {
  const { userStore } = useStore();
  const state = useLocalObservable(() => ({
    loading: false,
    openKeystoreModal: false,
  }));

  return (
    <div className="box-border px-16 py-12 pb-10">
      <div className="flex justify-center">
        <Button
          size="large"
          onClick={async () => {
            state.loading = true;
            await sleep(200);
            const wallet = ethers.Wallet.createRandom();
            const password = "123";
            const keystore = await wallet.encrypt(password, {
              scrypt: {
                N: 64
              }
            });
            userStore.setKeystore(keystore.replaceAll('\\', ''));
            userStore.setPassword(password);
            userStore.setAddress(wallet.address);
            userStore.setPrivateKey(wallet.privateKey);
            store.remove('groupStatusMap');
            store.remove('lightNodeGroupMap');
            window.location.reload();
          }}
        >
          {state.loading ? '正在创建帐号...' : '使用随机帐号'}
        </Button>
      </div>
      <div className="text-gray-88 opacity-60 mt-4 md:mt-[10px] text-center">
        <span className="cursor-pointer text-12" onClick={() => {
          state.openKeystoreModal = true;
        }}>密钥登录</span>
      </div>
      <KeystoreModal
        switchingAccount
        open={state.openKeystoreModal}
        onClose={() => {
        state.openKeystoreModal = false;
      }} />
    </div>
  )
});

const Modal = observer((props: {
  close: (result?: any) => void
}) => {
  const state = useLocalObservable(() => ({
    open: false,
  }));

  React.useEffect(() => {
    setTimeout(() => {
      state.open = true;
    });
  }, []);

  const close = (result?: any) => {
    state.open = false;
    props.close(result);
  }

  if (isMobile) {
    return (
      <DrawerModal open={state.open} onClose={() => close()}>
        <Main />
      </DrawerModal>
    )
  }

  return (
    <Dialog
      maxWidth="xl"
      hideCloseButton
      open={state.open}
      onClose={() => close()}
      transitionDuration={{
        enter: 300,
      }}
    >
      <Main />
    </Dialog>
  );
});


export default () => {
  const div = document.createElement('div');
  document.body.append(div);
  const unmount = () => {
    unmountComponentAtNode(div);
    div.remove();
  };
  render(
    (
      <ThemeRoot>
        <StoreProvider>
          <Modal
            close={() => {
              setTimeout(unmount, 500);
            }}
          />
        </StoreProvider>
      </ThemeRoot>
    ),
    div,
  );
};
