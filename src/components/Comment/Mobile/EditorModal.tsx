import React from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { IComment } from 'apis/types';
import TextField from '@material-ui/core/TextField';
import Button from 'components/Button';
import { useStore } from 'store';
import { isMI } from 'utils/env';
import DrawerModal from 'components/DrawerModal';
import Modal from 'components/Modal';

interface IProps {
  open: boolean;
  replyingComment: IComment | null
  isCreating: boolean
  submit: (value: string) => any
  onClose: () => void
}

const Editor = observer((props: IProps) => {
  const { replyingComment } = props;
  const { userStore, groupStore } = useStore();
  const state = useLocalObservable(() => ({
    value: '',
  }));

  React.useEffect(() => {
    setTimeout(() => {
      if (replyingComment) {
        const cachedContent = localStorage.getItem(`COMMENT_REPLY:${replyingComment.trxId}_CONTENT`) || '';
        const replyValue = cachedContent ? cachedContent : state.value;
        state.value = replyValue;
      } else {
        state.value = localStorage.getItem(`COMMENT_CONTENT_${groupStore.groupId}`) || '';
      }
    }, 400);
  }, []);

  const handleEditorChange = (e: any) => {
    state.value = e.target.value;
    if (replyingComment) {
      localStorage.setItem(`COMMENT_REPLY:${replyingComment.trxId}_CONTENT`, e.target.value);
    } else {
      localStorage.setItem(`COMMENT_CONTENT_${groupStore.groupId}`, e.target.value);
    }
  };

  return (
    <div className="mt-2 md:mt-0 comment-editor-container ">
      <div className="mb-2">
        {replyingComment && (
          <div style={{ marginLeft: '1px' }} className="md:pl-3 pt-1">
            <div
              className="border-gray-bd pl-2 text-12 cursor-pointer"
              style={{ borderLeftWidth: '3px' }}
            >
              <div className="truncate text-gray-99">{replyingComment.content}</div>
            </div>
          </div>
        )}
        {!replyingComment && <div className="pt-1" />}
      </div>
      <div className="flex items-start pb-2 md:pb-0">
        <div className="w-full -mt-4 relative">
          <TextField
            id="comment-text-field"
            className="po-input po-text-14 textarea"
            placeholder={
              replyingComment ? `回复 ${replyingComment.extra.userProfile.name}` : '说点什么...'
            }
            multiline
            fullWidth
            disabled={!userStore.isLogin}
            minRows={!isMI ? 3 : 5}
            value={state.value}
            onChange={handleEditorChange}
            margin="normal"
            variant="outlined"
            inputProps={{ maxLength: 8000 }}
          />
          <div className="mt-1"></div>
          <div className="text-right">
            <Button
              onClick={async () => {
                try {
                  const isSuccess = await props.submit(state.value);
                  if (isSuccess) {
                    state.value = '';
                    localStorage.removeItem(`COMMENT_CONTENT_${groupStore.groupId}`);
                    if (props.replyingComment) {
                      localStorage.removeItem(`COMMENT_REPLY:${props.replyingComment.trxId}_CONTENT`);
                    }
                  }
                } catch (err) {}
              }}
              size="large"
              isDoing={props.isCreating}
              color={state.value ? 'primary' : 'gray'}
            >
              发布
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default observer((props: IProps) => {
  const { open, onClose } = props;

  return (
    <div>
      {!isMI && (
        <DrawerModal
          hideCloseButton
          open={open}
          onClose={onClose}
        >
          <div className="container m-auto">
            <div className="w-11/12 md:w-7/12 m-auto md:pt-2 pb-1 md:pb-3">
              <Editor {...props} />
            </div>
          </div>
        </DrawerModal>
      )}
      {isMI && (
        <Modal
          open={open}
          onClose={onClose}
        >
          <div
            className="w-90-vw px-5 pb-1 box-border  md:pt-2"
            style={{
              marginTop: '-52vh',
            }}
          >
            <Editor {...props} />
          </div>
        </Modal>
      )}
    </div>
  )
});