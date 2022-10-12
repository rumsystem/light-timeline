import React from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';
import { PostApi } from 'apis';
import PostItem from 'components/Post/Item';
import { IPost } from 'apis/types';
import { useStore } from 'store';
import { isMobile } from 'utils/env';
import Loading from 'components/Loading';
import { useHistory } from 'react-router-dom';
import BackBar from 'components/BackBar';
import Sidebar from 'components/Sidebar';
import Button from 'components/Button';

export default observer(() => {
  const { postStore, groupStore } = useStore();
  const state = useLocalObservable(() => ({
    loading: true,
  }));
  const { trxId } = useParams() as { trxId: string };
  const post = postStore.map[trxId];
  const history = useHistory();
  const scrollRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (post) {
      state.loading = false;
      document.title = post.content.slice(0, 50);
      return;
    }
    (async () => {
      try {
        const post = await PostApi.get(groupStore.groupId, trxId);
        if (post.latestTrxId) {
          history.push(`/${groupStore.groupId}/posts/${post.latestTrxId}`);
          return;
        }
        if (post) {
          postStore.tryAddPostToMap(post);
          document.title = post.content.slice(0, 50);
        }
      } catch (err) {
        console.log(err);
      }
      state.loading = false;
    })();
  }, []);

  if (state.loading) {
    return (
      <div className="pt-[30vh] flex justify-center">
        <Loading />
      </div>
    )
  }

  if (!post) {
    return (
      <div>
        <div className="pt-[30vh] text-base text-15 md:text-16 text-center text-gray-600">
          抱歉，找不到这条内容
        </div>
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => {
              window.location.reload();
            }}
          >
            刷新页面
          </Button>
        </div>
        <div className="mt-4 md:mt-3 text-center">
          <span
            className="text-gray-88 cursor-pointer text-12 opacity-90"
            onClick={() => {
              history.push(`/${groupStore.groupId}`);
            }}>
            返回首页
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-y-auto h-screen" id="post-detail-page" ref={scrollRef}>
      {isMobile && <BackBar />}
      <div className="w-full md:w-[600px] box-border mx-auto min-h-screen md:py-5">
        <PostItem
          post={post as IPost}
          where="postDetail"
          hideBottom={isMobile}
        />
      </div>
      <Sidebar scrollRef={scrollRef} />
    </div>
  )
})