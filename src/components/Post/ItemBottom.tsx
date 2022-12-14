import { observer, useLocalObservable } from 'mobx-react-lite';
import { FaRegComment, FaComment } from 'react-icons/fa';
import { IPost } from 'apis/types';
import { RiThumbUpLine, RiThumbUpFill } from 'react-icons/ri';
import Comment from 'components/Comment';
import CommentMobile from 'components/Comment/Mobile';
import { TrxStorage, OBJECT_STATUS_DELETED_LABEL } from 'apis/common';
import Fade from '@material-ui/core/Fade';
import { useStore } from 'store';
import classNames from 'classnames';
import ContentSyncStatus from 'components/ContentSyncStatus';
import Menu from 'components/ObjectMenu';
import { useHistory } from 'react-router-dom';
import sleep from 'utils/sleep';
import openEditor from 'components/Post/OpenEditor';
import openLoginModal from 'components/openLoginModal';
import { isMobile, isPc } from 'utils/env';
import { TiArrowForwardOutline } from 'react-icons/ti';
import { lang } from 'utils/lang';
import copy from 'copy-to-clipboard';
import Tooltip from '@material-ui/core/Tooltip';
import { TrxApi } from 'apis';

interface IProps {
  post: IPost
  where: 'postList' | 'postDetail' | 'postDetailModal'
  hideBottom?: boolean
}

export default observer((props: IProps) => {
  const {
    confirmDialogStore,
    snackbarStore,
    postStore,
    modalStore,
    userStore,
    groupStore
  } = useStore();
  const { post } = props;
  const inPostDetail = props.where.startsWith('postDetail');
  const state = useLocalObservable(() => ({
    showComment: inPostDetail || false,
    submitting: false,
  }));
  const liked = post.extra?.liked;
  const likeCount = post.likeCount;
  const history = useHistory()

  const updateCounter = async (trxId: string) => {
    if (!userStore.isLogin) {
      openLoginModal();
      return;
    }
    if (state.submitting) {
      return;
    }
    state.submitting = true;
    try {
      const res = await TrxApi.createObject({
        groupId: post.groupId,
        object: {
          id: trxId,
          type: post.extra.liked ? 'Dislike' : 'Like'
        },
        aesKey: groupStore.cipherKey,
        privateKey: userStore.privateKey,
        ...(userStore.jwt ? { eth_pub_key: userStore.vaultAppUser.eth_pub_key, jwt: userStore.jwt } : {})
      });
      console.log(res);
      postStore.updatePost({
        ...post,
        likeCount: post.likeCount + (post.extra.liked ? -1 : 1),
        extra: {
          ...post.extra,
          liked: !post.extra.liked
        }
      });
    } catch (err) {
      console.log(err);
      snackbarStore.show({
        message: lang.somethingWrong,
        type: 'error',
      });
    }
    await sleep(2000);
    state.submitting = false;
  }

  const deletePost = async (trxId: string) => {
    if (!userStore.isLogin) {
      openLoginModal();
      return;
    }
    if (state.submitting) {
      return;
    }
    state.submitting = true;
    try {
      const res = await TrxApi.createObject({
        groupId: post.groupId,
        object: {
          type: 'Note',
          content: OBJECT_STATUS_DELETED_LABEL,
          id: trxId
        },
        aesKey: groupStore.cipherKey,
        privateKey: userStore.privateKey,
        ...(userStore.jwt ? { eth_pub_key: userStore.vaultAppUser.eth_pub_key, jwt: userStore.jwt } : {})
      });
      console.log(res);
    } catch (err) {
      console.log(err);
    }
    state.submitting = false;
  }

  return (
    <div>
      {!props.hideBottom && (
        <div className="pl-12 ml-1 flex items-center dark:text-white dark:text-opacity-60 text-gray-88 leading-none text-12">
          <div
            className={classNames(
              {
                'dark:text-white dark:text-opacity-70 text-gray-33': liked,
              },
              'flex items-center pl-0 p-2 pr-5 cursor-pointer tracking-wide dark:hover:text-white hover:text-gray-33',
            )}
            onClick={() => {
              updateCounter(post.trxId);
            }}
          >
            <div className="text-16 mr-[6px] opacity-90">
              {liked ? (
                <RiThumbUpFill className="dark:text-white dark:text-opacity-60 text-black opacity-60 dark:opacity-80" />
              ) : (
                <RiThumbUpLine />
              )}
            </div>
            {likeCount ? (
              <span className="mr-[10px] md:mr-1">{likeCount || ''}</span>
            )
              : <span className={classNames({
                'invisible': isMobile
              })}>赞</span>}
          </div>
          <div
            className={classNames(
              {
                'dark:text-white dark:text-opacity-60 text-gray-33': state.showComment,
              },
              'flex items-center p-2 pl-0 md:pl-2 mr-3 cursor-pointer tracking-wide dark:hover:text-white hover:text-gray-33 mt-[-1px]',
            )}
            onClick={() => {
              if (inPostDetail) {
                return;
              }
              if (isMobile) {
                history.push(`/posts/${post.trxId}`);
                return;
              }
              state.showComment = !state.showComment;
            }}
            data-test-id="timeline-post-comment-button"
          >
            <div className="text-16 mr-[6px] opacity-90">
              {state.showComment ? (
                <FaComment className="dark:text-white dark:text-opacity-60 text-black opacity-60 dark:opacity-80" />
              ) : (
                <FaRegComment />
              )}
            </div>
            {post.commentCount ? (
              <span className="mr-1 mt-[1px]">{post.commentCount}</span>
            )
              : <span className="hidden md:block">评论</span>}
          </div>
          <div
            className='flex items-center p-2 py-1 mr-5 cursor-pointer tracking-wide dark:hover:text-white hover:text-gray-33'
            onClick={() => {
              copy(`${window.origin}/posts/${post.trxId}`);
              snackbarStore.show({
                message: `链接${lang.copied}`,
              });
            }}
          >
            <Tooltip
              enterDelay={200}
              enterNextDelay={200}
              placement="top"
              title='复制链接'
              arrow
              >
              <div className="text-20 mr-[6px] opacity-60">
                <TiArrowForwardOutline />
              </div>
            </Tooltip>
          </div>
          <div className="mt-[1px]">
            <ContentSyncStatus
              trxId={post.trxId}
              storage={post.storage}
              SyncedComponent={() => (
                <div className="mt-[-1px]">
                  <Menu
                    data={{
                      groupId: post.groupId,
                      trxId: post.trxId,
                      userAddress: post.userAddress
                    }}
                    onClickUpdateMenu={async () => {
                      const newPost = await openEditor(post);
                      if (newPost) {
                        postStore.updatePost({
                          ...post,
                          latestTrxId: '',
                          commentCount: post.commentCount,
                          hotCount: post.hotCount,
                          likeCount: post.likeCount,
                          timestamp: post.timestamp,
                          storage: TrxStorage.cache,
                        });
                      }
                    }}
                    onClickDeleteMenu={() => {
                      confirmDialogStore.show({
                        content: '确定删除吗？',
                        cancelText: '取消',
                        ok: async () => {
                          confirmDialogStore.setLoading(true);
                          await deletePost(post.trxId);
                          confirmDialogStore.hide();
                          await sleep(400);
                          if (props.where === 'postDetailModal') {
                            modalStore.postDetail.hide();
                            await sleep(400);
                          }
                          if (inPostDetail) {
                            history.push(`/`);
                          }
                          postStore.removePost(post.trxId);
                          snackbarStore.show({
                            message: `已删除`
                          });
                        },
                      });
                    }}
                  />
                </div>
              )}
              alwaysShow
            />
          </div>
        </div>
      )}
      {state.showComment && (
        <Fade in={true} timeout={500}>
          <div>
            {isPc && (
              <div className="mt-4 pb-2">
                <Comment
                  post={post}
                  where={props.where}
                />
              </div>
            )}
            {isMobile && (
              <CommentMobile
                post={post}
                updateCounter={updateCounter}
              />
            )}
          </div>
        </Fade>
      )}
    </div>
  );
});
