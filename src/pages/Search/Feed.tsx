import React from 'react';
import { runInAction } from 'mobx';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { IProfile } from 'apis/types';
import PostItem from 'components/Post/Item';
import { PostApi } from 'apis';
import { useStore } from 'store';
import classNames from 'classnames';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import Loading from 'components/Loading';
import Query from 'utils/query';
import { TextField } from '@material-ui/core';
import { FiFilter } from 'react-icons/fi';
import openSearchModal from 'components/openSearchModal';
import qs from 'query-string';
import sleep from 'utils/sleep';
import { useHistory } from 'react-router-dom';
import { MdChevronLeft } from 'react-icons/md';
import { isPc } from 'utils/env';
import { useAliveController } from 'react-activation';

interface Props {
  scrollRef: React.RefObject<HTMLElement>
}

export default observer((props: Props) => {
  const { userStore, postStore, groupStore } = useStore();
  const total = postStore.searchedPosts.length;
  const history = useHistory();
  const aliveController = useAliveController();
  (window as any).aliveController = aliveController;
  const state = useLocalObservable(() => ({
    q: Query.get('q') || '',
    minLike: Query.get('minLike') || '',
    minComment: Query.get('minComment') || '',
    profileMap: {} as Record<string, IProfile>,
    invisibleOverlay: false,
    fetching: false,
    fetched: false,
    hasMore: false,
    page: 1,
    searched: false,
    get myProfile () {
      return this.profileMap[userStore.address]
    },
    get isEmptyInput() {
      return !this.q && !this.minLike && !this.minComment
    }
  }));

  React.useEffect(() => {
    fetchData();
  }, [state.page]);

  const fetchData = async () => {
    if (state.fetching) {
      return;
    }
    if (!state.searched && state.isEmptyInput) {
      return;
    }
    state.fetching = true;
    try {
      const limit = 15;
      const posts = await PostApi.list(groupStore.groupId, {
        q: state.q,
        minLike: state.minLike,
        minComment: state.minComment,
        viewer: userStore.address,
        offset: (state.page - 1) * limit,
        limit
      });
      postStore.addSearchedPosts(posts);
      state.hasMore = posts.length === limit;
      const showImageSmoothly = !state.fetched && postStore.searchedTrxIds.slice(0, 5).some((trxId) => (postStore.map[trxId].images || []).length > 0);
        if (showImageSmoothly) {
          runInAction(() => {
            state.invisibleOverlay = true;
          });
          setTimeout(() => {
            runInAction(() => {
              state.invisibleOverlay = false;
            });
          });
        }
    } catch (err) {
      console.log(err);
    }
    state.fetching = false;
    state.fetched = true;
    state.searched = true;
  }

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

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
      submit();
    }
  }

  const submit = async () => {
    state.page = 1;
    state.fetched = false;
    postStore.resetSearchedTrxIds();
    history.replace(`/${groupStore.groupId}/search?${qs.stringify({
      q: state.q,
      minLike: state.minLike,
      minComment: state.minComment,
    }, {
      skipEmptyString: true
    })}`);
    await fetchData();
  }

  return (
    <div className="pt-[63px] md:pt-[80px] pb-12 md:pb-4">
      <div className="fixed top-0 left-0 md:left-[50%] md:ml-[-300px] z-[100] w-full md:w-[600px]">
        <div className="bg-white flex justify-center items-center px-2 pt-1 md:pt-2 pb-2 md:pb-5 border-b border-gray-ec md:rounded-12 shadow-sm">
          <div className="flex items-center text-30 ml-1 mr-3 text-gray-88 mt-1 cursor-pointer" onClick={async () => {
            history.push(`/${groupStore.groupId}`);
            postStore.resetSearchedTrxIds();
            await aliveController.drop('search');
          }}>
            <MdChevronLeft />
            {isPc && <span className="text-14 mr-5">返回</span>}
          </div>
          <form action="/" className="flex-1 md:flex-initial md:w-64">
            <TextField
              fullWidth
              autoFocus
              placeholder='输入关键词'
              value={state.q}
              onChange={(e) => {
                state.q = e.target.value.trim();
              }}
              onKeyDown={onKeyDown}
              variant="outlined"
              margin="dense"
            />
          </form>
          <div className={classNames({
            'text-orange-500': state.minLike || state.minComment
          }, "ml-4 flex items-center text-gray-88 cursor-pointer mt-1 mr-1 md:mr-0")}
          onClick={async () => {
            const result = await openSearchModal({
              q: state.q,
              minLike: state.minLike,
              minComment: state.minComment,
            });
            if (result) {
              await sleep(300);
              state.q = result.q || '';
              state.minLike = result.minLike || '';
              state.minComment = result.minComment || '';
              submit();
            }
          }}>
            筛选
            <FiFilter className="text-14 ml-1" />
          </div>
        </div>
      </div>
      <div className={classNames({
        'opacity-0': state.invisibleOverlay
      }, "md:mt-5 w-full box-border")}>
        {postStore.searchedPosts.map((post) => (
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
      {state.fetched && total === 0 && (
        <div className="pt-[20vh] text-center text-gray-500 text-14 leading-10 opacity-70">
          没有搜索到相关内容<br /> 换一个关键词试试呢？
        </div>
      )}
      <div ref={sentryRef} />
    </div>
  )
});

