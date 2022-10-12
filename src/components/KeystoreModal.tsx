import { observer, useLocalObservable } from 'mobx-react-lite';
import Dialog from 'components/Dialog';
import { TextField } from '@material-ui/core';
import Button from 'components/Button';
import { useStore } from 'store';
import { ethers } from 'ethers';
import sleep from 'utils/sleep';
import store from 'store2';
import DrawerModal from 'components/DrawerModal';
import { isMobile } from 'utils/env';

interface IProps {
  switchingAccount: boolean
  open: boolean
  onClose: () => void
}

const Keystore = observer((props: IProps) => {
  const { snackbarStore, userStore } = useStore();
  const state = useLocalObservable(() => ({
    checking: false,
    keystore: props.switchingAccount ? '' : (localStorage.getItem('keystore') || ''),
    password: props.switchingAccount ? '' : localStorage.getItem('password') || '',
    percent: 0
  }));
  return (
    <div className="p-8 w-full md:w-[560px]">
       <TextField
        multiline
        name='keystore'
        label={props.switchingAccount ? '输入 Keystore' : "Keystore"}
        value={state.keystore}
        minRows={isMobile ? 10 : 14}
        maxRows={isMobile ? 10 : 14}
        onChange={(e) => { state.keystore = e.target.value; }}
        variant="outlined"
        fullWidth
        margin="dense"
        disabled={!props.switchingAccount}
      />
      <div className="mt-4" />
      <TextField
        multiline
        name='password'
        label={props.switchingAccount ? '输入 Password' : "Password"}
        value={state.password}
        minRows={2}
        maxRows={2}
        onChange={(e) => { state.password = e.target.value; }}
        variant="outlined"
        fullWidth
        margin="dense"
        disabled={!props.switchingAccount}
      />
      {props.switchingAccount && (
        <div className="flex justify-center">
          <Button className="mt-8 w-full md:w-auto" onClick={async () => {
            if (state.checking) {
              return;
            }
            state.checking = true;
            try {
              const wallet = await ethers.Wallet.fromEncryptedJson(state.keystore, state.password, (percent) => {
                state.percent = parseInt(`${percent * 100}`, 10);
              });
              userStore.setKeystore(state.keystore);
              userStore.setPassword(state.password);
              userStore.setAddress(wallet.address);
              userStore.setPrivateKey(wallet.privateKey);
              store.remove('groupStatusMap');
              store.remove('lightNodeGroupMap');
              snackbarStore.show({
                message: '导入成功',
              });
              await sleep(2000);
              window.location.reload();
            } catch (err) {
              console.log(err);
              snackbarStore.show({
                message: (err as any).message,
                type: 'error',
                duration: 3000
              });
              state.checking = false;
            }
          }}>{state.checking ? `正在处理 ${state.percent}%` : '确定'}</Button>
        </div>
      )}
    </div>
  )
})


export default observer((props: IProps) => {
  if (isMobile) {
    return (
      <DrawerModal open={props.open} onClose={() => props.onClose()}>
        <Keystore {...props} />
      </DrawerModal>
    )
  }

  return (
    <Dialog
      open={props.open}
      onClose={() => props.onClose()}
      hideCloseButton
      transitionDuration={{
        enter: 300,
      }}
    >
      <Keystore {...props} />
    </Dialog>
  )
});
