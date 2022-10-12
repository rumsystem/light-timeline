import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { StoreProvider } from 'store';
import { ThemeRoot } from 'utils/theme';
import Modal from 'components/Modal';
import { useStore } from 'store';
import { ethers } from 'ethers';
import store from 'store2';
import KeystoreModal from './KeystoreModal';
import Button from 'components/Button';
import sleep from 'utils/sleep';
import * as Vault from 'utils/vault';

const Main = observer(() => {
  const { userStore } = useStore();
  const state = useLocalObservable(() => ({
    loadingMixin: false,
    loadingRandom: false,
    openKeystoreModal: false,
  }));

  return (
    <div className="box-border px-14 pt-8 pb-10 w-[300px]">
      <div className="text-17 font-bold text-gray-700 text-center opacity-90">
        选择登录方式
      </div>
      <div className="flex justify-center w-full mt-6">
        <Button
          className="w-full"
          size="large"
          onClick={async () => {
            state.loadingMixin = true;
            const {
              aesKey,
              keyInHex
            } = await Vault.createKey();
            await Vault.saveCryptoKeyToLocalStorage(aesKey);
            window.location.href = Vault.getMixinOauthUrl({
              state: keyInHex,
              return_to: encodeURIComponent(window.location.href)
            });
          }}
        >
          Mixin 登录{state.loadingMixin && '...'}
        </Button>
      </div>
      <div className="flex justify-center mt-4 w-full">
        <Button
          className="w-full"
          size="large"
          onClick={async () => {
            state.loadingRandom = true;
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
          {state.loadingRandom ? '正在创建帐号...' : '使用随机帐号'}
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

const ModalWrapper = observer((props: {
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

  return (
    <Modal open={state.open} onClose={() => close()}>
      <Main />
    </Modal>
  )
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
          <ModalWrapper
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
