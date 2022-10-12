import React from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { isMobile, isPc } from 'utils/env';
import Button from 'components/Button';
import { BiEditAlt } from 'react-icons/bi';
import { RiSettings4Fill } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { useStore } from 'store';
import { useParams } from 'react-router-dom';
import { ProfileApi, UserApi, PostApi } from 'apis';
import { IProfile, IUser } from 'apis/types';
import openProfileEditor from 'pages/Group/openProfileEditor';
import PostItem from 'components/Post/Item';
import classNames from 'classnames';
import { runInAction } from 'mobx';
import Loading from 'components/Loading';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import Sidebar from 'components/Sidebar';
import openEditor from 'components/Post/OpenEditor';
import sleep from 'utils/sleep';
import BackBar from 'components/BackBar';

import './index.css';

export default observer(() => {
  const { userStore, groupStore, postStore } = useStore();
  const state = useLocalObservable(() => ({
    user: {} as IUser,
    profile: {} as IProfile,
    notFound: false,
    postPage: 1,
    invisibleOverlay: false,
    fetchingProfile: false,
    fetchedProfile: false,
    fetchingPosts: false,
    fetchedPosts: false,
    hasMorePosts: false,
    get fetched() {
      return this.fetchedProfile && this.fetchedPosts
    }
  }));
  const { userAddress } = useParams() as { userAddress: string };
  const { user, profile } = state;
  const isMyself = userStore.address === userAddress;
  const DEFAULT_BG_GRADIENT =
  'https://static-assets.pek3b.qingstor.com/rum-avatars/default_cover.png';
  const scrollRef = React.useRef<HTMLInputElement>(null);
  const postCount = postStore.userPosts.length;

  React.useEffect(() => {
    (async () => {
      state.fetchingProfile = true;
      try {
        if (isMyself) {
          state.user = userStore.user;
          state.profile = userStore.profile;
        } else {
          const user = await UserApi.get(groupStore.groupId, userAddress);
          state.user = user;
          const profile = await ProfileApi.get(groupStore.groupId, userAddress);
          state.profile = profile;
        }
      } catch (err) {
        console.log(err);
        state.notFound = true;
      }
      state.fetchingProfile = false;
      state.fetchedProfile = true;
      document.title = state.profile.name;
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (state.fetchingPosts) {
        return;
      }
      state.fetchingPosts = true;
      try {
        if (state.postPage === 1) {
          postStore.resetUserTrxIds();
        }
        const limit = 10;
        const posts = await PostApi.list(groupStore.groupId, {
          userAddress,
          viewer: userStore.address,
          offset: (state.postPage - 1) * limit,
          limit: limit
        });
        postStore.addPosts(posts);
        state.hasMorePosts = posts.length === limit;
        postStore.addUserPosts(posts);
        const showImageSmoothly = !state.fetchedPosts && postStore.userRrxIds.slice(0, 5).some((trxId) => (postStore.map[trxId].images || []).length > 0);
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
      state.fetchingPosts = false;
      state.fetchedPosts = true;
    })();
  }, [state.postPage]);

  const [sentryRef, { rootRef }] = useInfiniteScroll({
    loading: state.fetchingPosts,
    hasNextPage: state.hasMorePosts,
    rootMargin: '0px 0px 200px 0px',
    onLoadMore: async () => {
      state.postPage += 1;
    },
  });

  React.useEffect(() => {
    rootRef(scrollRef.current);
  }, [scrollRef.current]);

  React.useEffect(() => {
    if (isMyself) {
      state.profile = userStore.profile;
    }
  }, [userStore.profile]);

  if (!state.fetched) {
    return (
      <div className="pt-[30vh] flex justify-center">
        <Loading />
      </div>
    )
  }

  if (state.fetched && state.notFound) {
    return (
      <div className="h-screen flex justify-center items-center">
        {isMobile && <BackBar />}
        <div className="-mt-20 text-base md:text-xl text-center text-gray-600">
          抱歉，你访问的用户不存在
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-auto user-page bg-white md:bg-transparent" ref={scrollRef}>
      {isMobile && <BackBar />}
      <div className="w-full md:w-[600px] box-border mx-auto md:pt-5">
        {/* {isMobile && (
          <div>
            {Menu()}
            {isMyself && !(isWeChat && !userStore.canPublish) && EditorEntry()}
          </div>
        )} */}
        <div>
          <div className="flex items-stretch overflow-hidden relative p-6 px-5 md:px-8 md:rounded-12">
            <div
              className="absolute top-0 left-0 w-full h-full overflow-hidden bg-cover bg-center md:rounded-12"
              style={{
                backgroundImage: `url('${DEFAULT_BG_GRADIENT}')`,
              }}
            >
              <div className="absolute top-0 left-0 right-0 bottom-0 blur-layer md:rounded-12" />
            </div>
            <div className="w-full flex justify-between items-center z-10">
              <div className="flex items-center">
                <img
                  width={isMobile ? 64 : 70}
                  height={isMobile ? 64 : 70}
                  className="rounded-full avatar bg-white"
                  src={profile.avatar}
                  alt={profile.name}
                />
                <div className="pt-2 pl-3 pr-1 md:px-4 text-white ml-1">
                  <div className="font-bold text-20 md:text-24 md:pt-1 leading-none truncate w-[42vw] md:w-auto">
                    {profile.name}
                  </div>
                  {user.postCount > 0 && (
                    <div className="mt-[6px] opacity-70 text-14">
                      {user.postCount}  条内容
                    </div>
                  )}
                </div>
              </div>
              <Button
                className="mr-2"
                outline
                color="white"
                size={isMobile ? 'small' : 'normal'}
                onClick={openProfileEditor}
              >
                <div className="flex items-center text-16 mr-1">
                  <BiEditAlt />
                </div>
                <span className="hidden md:block">编辑资料</span>
                <span className="md:hidden">编辑</span>
              </Button>
            </div>
            <div className="justify-between z-10 w-full box-border pt-8 md:pt-8 px-5 md:px-16 text-white relative hidden">
              <div className="w-10/12 md:w-auto">
                <img
                  width={isMobile ? 74 : 120}
                  height={isMobile ? 74 : 120}
                  className="rounded-full avatar bg-white"
                  src={profile.avatar}
                  alt={profile.name}
                />
                <div className="font-bold mt-3 md:mt-2 text-18 md:text-24 pt-1 leading-snug w-[230px] md:w-[320px] break-words">
                  {profile.name}
                </div>
                <div className="text-14 md:text-16 flex items-center">
                  {user.postCount > 0 && (
                    <span className="mt-2">
                      {' '}
                      <span className="text-16 font-bold">
                        {user.postCount}
                      </span> 篇文章{' '}
                    </span>
                  )}
                  {user.postCount > 0 && (
                    <span className="mx-3 mt-2 opacity-50">|</span>
                  )}
                  {user.postCount > 0 && (
                    <span
                      className="cursor-pointer mt-2"
                    >
                      <span className="text-16 font-bold">
                        {user.postCount}
                      </span>{' '}
                      关注{' '}
                    </span>
                  )}
                  {user.postCount > 0 && (
                    <span className="opacity-50 mx-3 mt-2">|</span>
                  )}
                  {user.postCount > 0 && (
                    <span
                      className="cursor-pointer mt-2"
                    >
                      <span className="text-16 font-bold">{user.postCount}</span>{' '}
                      被关注
                    </span>
                  )}
                </div>
                {/* <div className="pt-2 pr-5 text-white opacity-90 w-[230px] md:w-[320px] box-border">
                  {profile.intro && <div className="text-13 whitespace-pre-line">{profile.intro}</div>}
                </div> */}
              </div>
              <div className="mt-16 md:mt-12 pt-4 mr-6 md:mr-0 absolute md:static top-0 right-0">
                {/* {!isMyself && (
                  <div>
                    {false ? (
                      <Button onClick={unsubscribe} outline color="white">
                        已关注
                      </Button>
                    ) : (
                      <Button onClick={subscribe}>关注</Button>
                    )}
                  </div>
                )} */}
                {isPc && isMyself && (
                  <Button
                    outline
                    color="white"
                    size={isMobile ? 'small' : 'normal'}
                    onClick={openProfileEditor}
                  >
                    <div className="flex items-center text-16 mr-1">
                      <BiEditAlt />
                    </div>
                    编辑资料
                  </Button>
                )}
                {isMobile && isMyself && (
                  <Link to="/settings">
                    <Button outline color="white" size={isMobile ? 'small' : 'normal'}>
                      <div className="flex items-center text-16 mr-1">
                        <RiSettings4Fill />
                      </div>
                      账号设置
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className={classNames({
            'opacity-0': state.invisibleOverlay
          }, "md:mt-5 w-full box-border")}>
            {postStore.userPosts.map((post) => (
              <div key={post.trxId}>
                <PostItem
                  post={post}
                  where="postList"
                  withBorder
                  disabledUserCardTooltip
                />
              </div>
            ))}
          </div>
          {isMyself && state.fetchedPosts && !state.fetchingPosts && postCount === 0 && (
            <div className="flex justify-center py-16">
              <Button
                outline
                onClick={async () => {
                  const post = await openEditor();
                  if (post) {
                    await sleep(400);
                    scrollRef.current?.scrollTo(0, 0);
                    await sleep(200);
                    postStore.addUserPost(post);
                  }
                }}
              >
                点击发布第一条内容
              </Button>
            </div>
          )}
          {!isMyself && state.fetchedPosts && postCount === 0 && (
            <div className="py-32 text-center text-gray-500 text-14">
              还没有发布过内容
            </div>
          )}
          {state.fetchedPosts && state.fetchingPosts && (
            <div className="pt-6 md:pt-3 pb-12 md:pb-5">
              <Loading />
            </div>
          )}
        </div>
      </div>
      <Sidebar scrollRef={scrollRef} />
      <div ref={sentryRef} />
    </div>
  )
})