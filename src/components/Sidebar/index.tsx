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
import { BiArrowBack } from 'react-icons/bi';
import { useLocation } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { isPc, isMobile, getMixinContext } from 'utils/env';
import { RiSearchLine, RiSearchFill } from 'react-icons/ri';
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
import { IoPersonOutline, IoPerson } from 'react-icons/io5';
import store from 'store2';
import Button from 'components/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tabs from './Tabs';

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
  const state = useLocalObservable(() => ({
    showBackToTop: false,
    showPostEditorEntry: false,
    openMessageModal: false,
    consoleClickCount: 0,
    unreadCount: 0,
    tabIndex: 1,
    anchorEl: null
  }));
  const history = useHistory();
  const location = useLocation();
  const aliveController = useAliveController();

  const isHomePage = location.pathname === `/${groupStore.groupId}`;
  const isSearchPage = location.pathname === `/${groupStore.groupId}/search`;
  // const isUserPage = location.pathname.startsWith(`/${groupStore.groupId}/users/`);
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

  const logout = async () => {
    confirmDialogStore.show({
      content: '确定退出帐号吗？',
      ok: async () => {
        confirmDialogStore.hide();
        await sleep(400);
        store.clear();
        modalStore.pageLoading.show();
        window.location.href = `/${groupStore.groupId}`;
      },
    });
  }

  return (
    <div>
      <div className={classNames({
        hidden: isSearchPage
      }, "fixed top-0 left-0 z-[999] h-[40px] md:h-[42px] flex items-center justify-center w-screen bg-white border-b border-neutral-100 md:shadow-sm")}>
        <div className="w-[600px] flex items-center justify-between">
          {isHomePage && (
            <Tabs />
          )}
          {!isHomePage && (
            <div
              className="flex items-center cursor-pointer text-neutral-500"
              onClick={() => {
                pathStore.prevPath ? history.goBack() : history.push(`/${groupStore.groupId}`)
              }}>
              <div className="flex items-center text-20 ml-3 md:ml-2">
                <BiArrowBack />
              </div>
              <span className="ml-3 text-15 leading-none">返回</span>
            </div>
          )}
          {isPc && !userStore.isLogin && (
            <div className="px-2 opacity-70">
              <Button outline size="mini">登录</Button>
            </div>
          )}
          {userStore.isLogin && (
            <div className="flex items-center">
              {isPc && (
                <div
                  className="p-1 cursor-pointer mr-4"
                  onClick={async () => {
                    const result = await openSearchModal();
                    if (result) {
                      postStore.resetSearchedTrxIds();
                      await aliveController.drop('search');
                      history.push(`${groupStore.groupId}/search?${qs.stringify(result!, {
                        skipEmptyString: true
                      })}`);
                    }
                  }}>
                  <AiOutlineSearch className="text-22 text-neutral-500 opacity-80" />
                </div>
              )}
              <div
                className="mr-5 p-1 cursor-pointer"
                onClick={() => { 
                  state.openMessageModal = true;
                }}>
                <Badge
                  badgeContent={state.unreadCount}
                  className='transform cursor-pointer scale-90'
                  color="error"
                  overlap='rectangular'
                  onClick={() => { 
                    state.openMessageModal = true;
                  }}
                >
                  <div className="cursor-pointer transform scale-110">
                    <MdNotificationsNone className="text-24 text-neutral-400 opacity-80 md:opacity-90" />
                  </div>
                </Badge>
              </div>
              {isPc && (
                <div>
                  <Avatar
                    className="cursor-pointer"
                    url={userStore.profile.avatar}
                    size={30}
                    onClick={(e) => {
                      state.anchorEl = e.currentTarget
                    }}
                  />
                  <Menu
                    anchorEl={state.anchorEl}
                    getContentAnchorEl={null}
                    open={Boolean(state.anchorEl)}
                    onClose={() => {
                      state.anchorEl = null;
                    }}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <MenuItem 
                      onClick={() => {
                        state.anchorEl = null;
                        history.push(`/${groupStore.groupId}/users/${userStore.address}`);
                      }}>
                      <div className="py-1 px-3 flex items-center">
                        我的主页
                      </div>
                    </MenuItem>
                    <MenuItem onClick={() => {
                      state.anchorEl = null;
                      logout();
                    }}>
                      <div className="py-1 px-3 flex items-center text-red-400">
                        退出帐号
                      </div>
                    </MenuItem>
                  </Menu>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {isPc && (
        <div className='mt-10 mr-[-430px] scale-100 bottom-[30px] right-[50%] fixed'>
          {(isMyUserPage || (isHomePage && userStore.isLogin && state.showPostEditorEntry)) && (
            <Fade in={true} timeout={350}>
              <div
                className='mt-10 w-10 h-10 mx-auto flex items-center justify-center rounded-full cursor-pointer border border-black bg-black'
                onClick={onOpenEditor}
              >
                <BsPencil className="text-15 text-white" />
              </div>
            </Fade>
          )}
          {state.showBackToTop && (
            <Fade in={true} timeout={350}>
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
            </Fade>
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
      )}

      {isMobile && (
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
              <div className="pt-[6px] fixed bottom-0 left-0 w-screen flex justify-around text-gray-88 text-12 border-t border-neutral-100 bg-white z-50">
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
                  logout();
                }}>
                  {getMixinContext().isMixinImmersive && (
                    <div className="text-gray-88 opacity-80 mr-4">|</div>
                  )}
                  <span className="text-14 text-red-500">退出</span>
                </div>
              )}
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
  );
});

