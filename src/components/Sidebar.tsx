import React from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from 'store';
import Tooltip from '@material-ui/core/Tooltip';
import Fade from '@material-ui/core/Fade';
import { BsPencil } from 'react-icons/bs';
import openEditor from 'components/Post/OpenEditor';
import { MdNotificationsNone } from 'react-icons/md';
import { BsInfo } from 'react-icons/bs';
import openGroupInfo from 'components/openGroupInfo';
import Avatar from 'components/Avatar';
import sleep from 'utils/sleep';
import useScroll from 'hooks/useScroll';
import { MdArrowUpward } from 'react-icons/md';
import { BiArrowBack, BiLogOut } from 'react-icons/bi';
import { useLocation } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import store from 'store2';
import { isPc, getMixinContext } from 'utils/env';
import { RiSearchLine, RiSearchFill } from 'react-icons/ri';
import {
  IoPersonOutline,
  IoPerson,
  IoChatbubbleEllipsesOutline,
} from 'react-icons/io5';
import { AiOutlineHome, AiFillHome, AiOutlineSearch } from 'react-icons/ai';
import Badge from '@material-ui/core/Badge';
import classNames from 'classnames';
import openLoginModal from 'components/openLoginModal';
import MessagesModal from 'components/Notification/NotificationModal';
import VConsole from 'vconsole';
import { getSocket } from 'utils/socket';
import { NotificationApi } from 'apis';
import openSearchModal from 'components/openSearchModal';
import qs from 'query-string';
import { useAliveController } from 'react-activation';


interface IProps {
  scrollRef: React.RefObject<HTMLElement>
}

export default observer((props: IProps) => {
  const {
    userStore,
    postStore,
    confirmDialogStore,
    groupStore,
    modalStore,
    pathStore
  } = useStore();
  const { profile } = userStore;
  const state = useLocalObservable(() => ({
    showBackToTop: false,
    showPostEditorEntry: false,
    openMessageModal: false,
    consoleClickCount: 0,
    unreadCount: 0
  }));
  const history = useHistory();
  const location = useLocation();
  const aliveController = useAliveController();

  const isHomePage = location.pathname === `/${groupStore.groupId}`;
  const isSearchPage = location.pathname === `/${groupStore.groupId}/search`;
  const isUserPage = location.pathname.startsWith(`/${groupStore.groupId}/users/`);
  const isMyUserPage = location.pathname === `/${groupStore.groupId}/users/${userStore.address}`;

  useScroll({
    scrollRef: props.scrollRef,
    threshold: window.innerHeight,
    callback: (yes) => {
      state.showBackToTop = yes;
      state.showPostEditorEntry = yes;
    }
  });

  const fetchUnreadCount = async () => {
    try {
      const count1 = await NotificationApi.getUnreadCount(groupStore.groupId,
        userStore.address,
        'like');
      const count2 = await NotificationApi.getUnreadCount(groupStore.groupId, userStore.address, 'comment');
      state.unreadCount = count1 + count2;
    } catch (err) {
      console.log(err);
    }
  }

  React.useEffect(() => {
    if (!userStore.isLogin) {
      return;
    }
    fetchUnreadCount();
  }, []);

  React.useEffect(() => {
    if (!userStore.isLogin) {
      return;
    }
    const listener = (notification: any) => {
      console.log({ notification });
      fetchUnreadCount();
    }
    getSocket().on('notification', listener);
    return () => {
      getSocket().off('notification', listener);
    }
  }, []);

  const onOpenEditor = async () => {
    if (!userStore.isLogin) {
      openLoginModal();
      return;
    }
    const post = await openEditor();
    if (post) {
      await sleep(300);
      if ((props.scrollRef.current?.scrollTop || 0) > 0) {
        props.scrollRef.current?.scrollTo(0, 0);
        await sleep(400);
      }
      if (isMyUserPage) {
        postStore.addUserPost(post);
      } else {
        postStore.addPost(post);
      }
    }
  };

  if (isPc) {
    return (
      <div>
        <div className='ml-[-430px] top-[30px] left-[50%] fixed flex-col items-center'>
          {userStore.isLogin && (
            <div className="rounded-full cursor-pointer border border-gray-c4" onClick={() => {
              history.push(`/${groupStore.groupId}/users/${userStore.address}`)
            }}>
              <Avatar
                url={profile.avatar}
                size={60}
              />
            </div>
          )}

          {!isHomePage && (
            <div className='cursor-pointer' onClick={() => {
              pathStore.prevPath ? history.goBack() : history.push(`/${groupStore.groupId}`)
            }}>
              <div
                className='mt-10 w-10 h-10 mx-auto rounded-full flex items-center justify-center border border-gray-9c'
              >
                <BiArrowBack className="text-18 text-gray-88" />
              </div>
            </div>
          )}

          {!isHomePage && (
            <div className='cursor-pointer' onClick={() => {
              history.push(`/${groupStore.groupId}`);
            }}>
              <div
                className='mt-10 w-10 h-10 mx-auto rounded-full flex items-center justify-center border border-gray-9c'
              >
                <AiOutlineHome className="text-20 text-gray-88" />
              </div>
            </div>
          )}

          {userStore.isLogin && (
            <Fade in={true} timeout={350}>
              <div
                className='mt-10 w-10 h-10 mx-auto flex items-center justify-center rounded-full cursor-pointer border border-gray-9c'
                onClick={() => {
                  if (!userStore.isLogin) {
                    openLoginModal();
                    return;
                  }
                  state.openMessageModal = true;
                }}
              >
                <div>
                  <Badge
                    badgeContent={state.unreadCount}
                    className='transform cursor-pointer'
                    color="error"
                    overlap='rectangular'
                    onClick={() => { 
                      state.openMessageModal = true;
                    }}
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      <MdNotificationsNone className="text-24 text-gray-af" />
                    </div>
                  </Badge>
                </div>
              </div>
            </Fade>
          )}

          {userStore.isLogin && (isHomePage || isUserPage) && (
            <div className='cursor-pointer' onClick={async () => {
              const result = await openSearchModal();
              if (result) {
                postStore.resetSearchedTrxIds();
                await aliveController.drop('search');
                history.push(`${groupStore.groupId}/search?${qs.stringify(result!, {
                  skipEmptyString: true
                })}`);
              }
            }}>
              <div
                className='mt-10 w-10 h-10 mx-auto rounded-full flex items-center justify-center border border-gray-9c'
              >
                <AiOutlineSearch className="text-20 text-gray-88" />
              </div>
            </div>
          )}

          {isMyUserPage && (
            <div className='cursor-pointer' onClick={() => {
              confirmDialogStore.show({
                content: '确定退出帐号吗？',
                ok: async () => {
                  confirmDialogStore.hide();
                  await sleep(400);
                  userStore.setKeystore('');
                  userStore.setPrivateKey('');
                  userStore.setPassword('');
                  userStore.setAddress('');
                  store.remove('groupStatusMap');
                  store.remove('lightNodeGroupMap');
                  modalStore.pageLoading.show();
                  window.location.href = `/${groupStore.groupId}`;
                },
              });
            }}>
              <div
                className='mt-10 w-10 h-10 mx-auto rounded-full flex items-center justify-center border border-red-500'
              >
                <BiLogOut className="text-20 text-red-500" />
              </div>
            </div>
          )}

          {(isMyUserPage || (isHomePage && userStore.isLogin && state.showPostEditorEntry)) && (
            <Fade in={true} timeout={350}>
              <div
                className='mt-10 w-10 h-10 mx-auto flex items-center justify-center rounded-full cursor-pointer border border-black bg-black'
                onClick={onOpenEditor}
              >
                <BsPencil className="text-16 text-white" />
              </div>
            </Fade>
          )}
        </div>

        <div className='mt-10 mr-[-430px] scale-100 bottom-[30px] right-[50%] fixed'>
          {state.showBackToTop && (
            <Tooltip
              enterDelay={200}
              enterNextDelay={200}
              placement="left"
              title="回到顶部"
              arrow
              interactive
              >
              <div
                className='mt-10 w-10 h-10 mx-auto rounded-full flex items-center justify-center cursor-pointer border border-gray-c4'
                onClick={() => {
                  props.scrollRef.current?.scroll(0, 0);
                }}
              >
                <MdArrowUpward className="text-20 text-gray-af" />
              </div>
            </Tooltip>
          )}

          <Tooltip
            enterDelay={200}
            enterNextDelay={200}
            placement="left"
            title="种子网络详情"
            arrow
            interactive
            >
              <div
                className='mt-8 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border border-gray-c4'
                onClick={() => openGroupInfo(groupStore.groupId)}
              >
                <BsInfo className="text-24 text-gray-af" />
              </div>
            </Tooltip>
        </div>
        <MessagesModal
          open={state.openMessageModal}
          onClose={() => {
            state.openMessageModal = false;
            fetchUnreadCount();
          }}
          addReadCount={(count) => {
            if (state.unreadCount >= count) {
              state.unreadCount -= count
            }
          }}
        />
      </div>
    );
  }

  // Mobile
  return (
    <div>
      {(isHomePage || isMyUserPage) && userStore.isLogin && (
        <Fade in={true} timeout={350}>
          <div
            className='fixed bottom-[80px] right-6 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer border border-black bg-black'
            onClick={onOpenEditor}
          >
            <BsPencil className="text-20 opacity-90 text-white" />
          </div>
        </Fade>
      )}
      {(isHomePage || isMyUserPage || isSearchPage) && (
        <div>
          <div className="h-12 w-screen"></div>
          <div className="pt-2 fixed bottom-0 left-0 w-screen flex justify-around text-gray-88 text-12 border-t border-gray-ec bg-white z-50">
            <div
              className={classNames(
                {
                  'text-black': isHomePage,
                },
                'px-4 text-center',
              )}
              onClick={() => {
                const path = `/${groupStore.groupId}`;
                if (location.pathname !== path) {
                  history.push(path);
                } else {
                  state.consoleClickCount++;
                  if (state.consoleClickCount === 5) {
                    new VConsole({ theme: 'dark' });
                  } else {
                    setTimeout(() => {
                      state.consoleClickCount = 0;
                    }, 4000);
                  }
                }
              }}
            >
              <div className="flex items-center justify-center text-24 h-6 w-6">
                {isHomePage ? <AiFillHome /> : <AiOutlineHome />}
              </div>
              <div className="transform scale-90">首页</div>
            </div>
            <div
              className={classNames(
                {
                  'text-black': isSearchPage,
                },
                'px-4 text-center',
              )}
              onClick={async () => {
                if (!userStore.isLogin) {
                  openLoginModal();
                  return;
                }
                postStore.resetSearchedTrxIds();
                await aliveController.drop('search');
                history.push(`/${groupStore.groupId}/search`);
              }}
            >
              <div className="flex items-center justify-center text-24 h-6 w-6">
                {isSearchPage ? <RiSearchFill /> : <RiSearchLine />}
              </div>
              <div className="transform scale-90">搜索</div>
            </div>
            <div
              className='px-4 text-center relative'
              onClick={() => {
                if (!userStore.isLogin) {
                  openLoginModal();
                  return;
                }
                state.openMessageModal = true;
              }}
            >
              <div className="flex items-center justify-center text-23 h-6 w-6">
                <IoChatbubbleEllipsesOutline />
              </div>
              <div className="transform scale-90">通知</div>
              <div className="absolute top-0 right-0">
                <Badge
                  badgeContent={state.unreadCount}
                  className="-ml-8 pl-1 -mt-2 transform scale-90"
                  color="error"
                  overlap="rectangular"
                />
              </div>
            </div>
            <div
              className={classNames(
                {
                  'text-black': isMyUserPage,
                },
                'px-4 text-center',
              )}
              onClick={() => {
                if (!userStore.isLogin) {
                  openLoginModal();
                  return;
                }
                const path = `/${groupStore.groupId}/users/${userStore.address}`;
                if (location.pathname !== path) {
                  history.push(path);
                }
              }}
            >
              <div className="flex items-center justify-center text-26 h-6 w-6">
                {isMyUserPage ? <IoPerson /> : <IoPersonOutline />}
              </div>
              <div className="transform scale-90">我的</div>
            </div>
          </div>
          {isMyUserPage && (
            <div className={classNames({
              'right-[10px]': !getMixinContext().isMixinImmersive,
              'left-[70px]': getMixinContext().isMixinImmersive
            }, 'px-4 cursor-pointer fixed top-[12px] z-[21] flex items-center justify-center')} onClick={() => {
              confirmDialogStore.show({
                content: '确定退出帐号吗？',
                ok: async () => {
                  confirmDialogStore.hide();
                  await sleep(400);
                  userStore.setKeystore('');
                  userStore.setPrivateKey('');
                  userStore.setPassword('');
                  userStore.setAddress('');
                  store.remove('groupStatusMap');
                  store.remove('lightNodeGroupMap');
                  modalStore.pageLoading.show();
                  window.location.href = `/${groupStore.groupId}`;
                },
              });
            }}>
              {getMixinContext().isMixinImmersive && (
                <div className="text-gray-88 opacity-80 mr-4">|</div>
              )}
              <span className="text-14 text-red-500">退出</span>
            </div>
          )}
        </div>
      )}
      <MessagesModal
        open={state.openMessageModal}
        onClose={() => {
          state.openMessageModal = false;
          fetchUnreadCount();
        }}
        addReadCount={(count) => {
          if (state.unreadCount >= count) {
            state.unreadCount -= count
          }
        }}
      />
    </div>
  )
});

