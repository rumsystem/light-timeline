import React from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import Dialog from 'components/Dialog';
import Loading from 'components/Loading';
import PostItem from 'components/Post/Item';
import { PostApi } from 'apis';
import { IPost } from 'apis/types';
import { useStore } from 'store';
import DrawerModal from 'components/DrawerModal';
import { isMobile } from 'utils/env';

const PostDetail = observer(() => {
  const { modalStore } = useStore();
  const { trxId } = modalStore.postDetail.data;
  const { postStore, groupStore } = useStore();
  const state = useLocalObservable(() => ({
    open: true,
    loading: true,
  }));
  const post = postStore.map[trxId];

  React.useEffect(() => {
    if (post) {
      state.loading = false;
      return;
    }
    (async () => {
      try {
        const post = await PostApi.get(groupStore.groupId, trxId);
        postStore.addPostToMap(post);
      } catch (err) {
        console.log(err);
      }
      state.loading = false;
    })();
  }, []);

  return (
    <div className="bg-white rounded-0">
      <div className="w-full md:w-[600px] box-border mx-auto h-[90vh] md:h-[80vh] relative">
        {!state.loading && (
          <PostItem
            post={post as IPost}
            where="postDetailModal"
          />
          )}
        {!state.loading && !post && (
          <div>
            404 not found
          </div>
        )}
      </div>
      {state.loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <Loading size={24} />
        </div>
      )}
    </div>
  );
});

export default observer(() => {
  const { modalStore } = useStore();

  if (isMobile) {
    return (
      <DrawerModal
        open={modalStore.postDetail.open}
        onClose={() => modalStore.postDetail.hide()}
      >
        <PostDetail />
      </DrawerModal>
    )
  }

  return (
    <Dialog
      hideCloseButton
      open={modalStore.postDetail.open}
      onClose={() => modalStore.postDetail.hide()}
      transitionDuration={{
        enter: 300,
      }}
    >
      <PostDetail />
    </Dialog>
  );
});
