import React from 'react';
import { runInAction } from 'mobx';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { IPost, IProfile } from 'apis/types';
import { TrxStorage } from 'apis/common';
import PostItem from 'components/Post/Item';
import { PostApi, TrxApi } from 'apis';
import Editor from 'components/Editor';
import { lang } from 'utils/lang';
import { useStore } from 'store';
import classNames from 'classnames';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import Loading from 'components/Loading';
import openLoginModal from 'components/openLoginModal';
import { IObject } from 'quorum-light-node-sdk';
import Button from 'components/Button';
import { isMobile } from 'utils/env';
import Base64 from 'utils/base64';

interface Props {
  scrollRef: React.RefObject<HTMLElement>
}

export default observer((props: Props) => {
  const { userStore, postStore, groupStore } = useStore();
  const state = useLocalObservable(() => ({
    content: '',
    profileMap: {} as Record<string, IProfile>,
    invisibleOverlay: false,
    fetching: false,
    fetched: false,
    hasMore: false,
    page: 1,
    get myProfile () {
      return this.profileMap[userStore.address]
    }
  }));

  const fetchData = async () => {
    state.fetching = true;
    try {
      const limit = 15;
      const posts = await PostApi.list(groupStore.groupId, {
        type: postStore.feedType,
        viewer: userStore.address,
        offset: (state.page - 1) * limit,
        limit,
      });
      postStore.addPosts(posts);
      state.hasMore = posts.length === limit;
      const showImageSmoothly = !state.fetched && postStore.trxIds.slice(0, 5).some((trxId) => (postStore.map[trxId].images || []).length > 0);
        if (showImageSmoothly) {
          runInAction(() => {
            state.invisibleOverlay = true;
          });
          setTimeout(() => {
            runInAction(() => {
              state.invisibleOverlay = false;
            });
          }, 100);
        }
    } catch (err) {
      console.log(err);
    }
    state.fetching = false;
    state.fetched = true;
  }

  React.useEffect(() => {
    if (state.fetching) {
      return;
    }
    fetchData();
  }, [state.page]);

  React.useEffect(() => {
    if (state.fetched) {
      state.fetched = false;
      state.fetching = true;
      state.page = 1;
      postStore.resetTrxIds();
      fetchData();
    }
  }, [postStore.feedType])

  const [sentryRef, { rootRef }] = useInfiniteScroll({
    loading: state.fetching,
    hasNextPage: state.hasMore,
    rootMargin: '0px 0px 300px 0px',
    onLoadMore: async () => {
      state.page += 1;
    },
  });

  React.useEffect(() => {
    rootRef(props.scrollRef.current);
  }, [props.scrollRef.current]);

  const submitPost = async (payload: IObject) => {
    if (!userStore.isLogin) {
      openLoginModal();
      return;
    }
    const res = await TrxApi.createObject({
      groupId: groupStore.groupId,
      object: payload,
      aesKey: groupStore.cipherKey,
      privateKey: userStore.privateKey,
      ...(userStore.jwt ? { eth_pub_key: userStore.vaultAppUser.eth_pub_key, jwt: userStore.jwt } : {})
    });
    console.log(res);
    const post: IPost = {
      content: payload.content || '',
      images: (payload.image || []).map(image => Base64.getUrl(image)),
      userAddress: userStore.address,
      groupId: groupStore.groupId,
      trxId: res.trx_id,
      latestTrxId: '',
      storage: TrxStorage.cache,
      commentCount: 0,
      hotCount: 0,
      likeCount: 0,
      imageCount: (payload.image || []).length,
      timestamp: Date.now(),
      extra: {
        userProfile: userStore.profile
      }
    };
    postStore.addPost(post);
    userStore.updateUser(userStore.address, {
      postCount: userStore.user.postCount + 1
    });
    state.content = '';
  }

  return (
    <div className="md:pt-5">
      <div className="hidden md:block">
        <Editor
          editorKey="post"
          placeholder={lang.andNewIdea}
          autoFocusDisabled
          minRows={3}
          submit={(data) => {
            const payload: IObject = {
              type: 'Note',
              content: data.content,
            };
            if (data.images) {
              payload.image = data.images;
            }
            return submitPost(payload);
          }}
          enabledImage
        />
      </div>
      <div className={classNames({
        'opacity-0': state.invisibleOverlay
      }, "md:mt-5 w-full box-border")}>
        {postStore.posts.map((post) => (
          <div key={post.trxId}>
            <PostItem
              post={post}
              where="postList"
              withBorder
            />
          </div>
        ))}
      </div>
      {!state.fetched && state.fetching && (
        <div className="pt-[30vh]">
          <Loading />
        </div>
      )}
      {state.fetched && state.fetching && (
        <div className="pt-6 md:pt-3 pb-12 md:pb-5">
          <Loading />
        </div>
      )}
      {state.fetched && postStore.total === 0 && (
        <div className="py-[30vh] text-center text-gray-500 text-14 tracking-wider opacity-80">
          {postStore.feedType === 'latest' && '来发布一条内容吧 ~'}
          {postStore.feedType === 'following' && '去关注你感兴趣的人吧 ~'}
          {postStore.feedType === 'latest' && isMobile && !userStore.isLogin && (
            <div className="flex justify-center mt-5">
              <Button onClick={openLoginModal} >
                点击发布
              </Button>
            </div>
          )}
        </div>
      )}
      <div ref={sentryRef} />
    </div>
  )
});

