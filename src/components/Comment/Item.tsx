import React from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import classNames from 'classnames';
import urlify from 'utils/urlify';
import ago from 'utils/ago';
import { RiThumbUpLine, RiThumbUpFill } from 'react-icons/ri';
import Avatar from 'components/Avatar';
import ContentSyncStatus from 'components/ContentSyncStatus';
import { useStore } from 'store';
import TrxInfo from 'components/TrxInfo';
import UserCard from 'components/UserCard';
import { lang } from 'utils/lang';
import { IComment } from 'apis/types';
import { BsFillCaretDownFill } from 'react-icons/bs';
import openPhotoSwipe from 'components/openPhotoSwipe';
import Base64 from 'utils/base64';
import Images from 'components/Images';
import QuorumLightNodeSDK from 'quorum-light-node-sdk';
import { isMobile, isPc } from 'utils/env';
import Fade from '@material-ui/core/Fade';
import { IObject } from 'quorum-light-node-sdk';
import { AiOutlineLink } from 'react-icons/ai';
import copy from 'copy-to-clipboard';
import Tooltip from '@material-ui/core/Tooltip';
import openLoginModal from 'components/openLoginModal';
import sleep from 'utils/sleep';

import './item.css';

interface IProps {
  comment: IComment
  postUserAddress: string
  submit: (payload: IObject) => void
  where: 'postList' | 'postDetail' | 'postDetailModal'
  selectComment?: any
  highlight?: boolean
  isTopComment?: boolean
  disabledReply?: boolean
}

export default observer((props: IProps) => {
  const { modalStore, userStore, groupStore, commentStore, snackbarStore } = useStore();
  const commentRef = React.useRef<any>();
  const { comment, isTopComment } = props;
  const isSubComment = !isTopComment;
  const { threadId } = comment;
  const replyComment = comment.extra.replyComment;
  const domElementId = `${props.where}_comment_${comment.trxId}`;

  const state = useLocalObservable(() => ({
    canExpand: false,
    expand: false,
    anchorEl: null,
    showEditor: false,
    submitting: false,
  }));

  React.useEffect(() => {
    const setCanExpand = () => {
      if (
        commentRef.current
        && commentRef.current.scrollHeight > commentRef.current.clientHeight
      ) {
        state.canExpand = true;
      } else {
        state.canExpand = false;
      }
    };
    setCanExpand();
    window.addEventListener('resize', setCanExpand);
    return () => {
      window.removeEventListener('resize', setCanExpand);
    };
  }, [state, commentStore, comment.trxId]);

  const UserName = (props: {
    name: string
    isPostOwner: boolean
    isTopComment?: boolean
    isReplyTo?: boolean
  }) => (
    <span
      className={classNames(
        {
          'bg-black text-white rounded opacity-50 px-1 leading-none':
              props.isPostOwner && !props.isReplyTo && isPc,
          'text-gray-88 md:text-gray-500 md:opacity-80': !props.isPostOwner || props.isReplyTo,
          'py-[3px] inline-block': props.isPostOwner && props.isTopComment && isPc,
          'mr-[1px]': !props.isTopComment && isPc,
        },
        'font-bold max-w-40 truncate text-14',
      )}
    >
      {props.name}
    </span>
  );

  const updateCounter = async (trxId: string) => {
    if (!userStore.isLogin) {
      openLoginModal();
      return;
    }
    if (state.submitting) {
      return;
    }
    state.submitting = true;
    await QuorumLightNodeSDK.chain.Trx.create({
      groupId: groupStore.groupId,
      object: {
        id: trxId,
        type: comment.extra.liked ? 'Dislike' : 'Like'
      },
      aesKey: groupStore.cipherKey,
      privateKey: userStore.privateKey,
    });
    commentStore.updateComment({
      ...comment,
      likeCount: comment.likeCount + (comment.extra.liked ? -1 : 1),
      extra: {
        ...comment.extra,
        liked: !comment.extra.liked
      }
    });
    await sleep(2000);
    state.submitting = false;
  }

  return (
    <Fade in={true} timeout={350}>
      <div
        className={classNames(
          {
            highlight: props.highlight,
            'mt-[10px] p-2': isTopComment,
            'mt-1 px-2 py-[7px]': isSubComment,
            'border-b border-gray-ec pb-4': isMobile && comment.commentCount === 0
          },
          'comment-item duration-500 ease-in-out -mx-2 rounded-6 group',
        )}
        id={`${domElementId}`}
      >
        <div className="relative">
          <UserCard
            userAddress={props.comment.userAddress}
          >
            <div
              className={classNames(
                {
                  'mt-[-4px]': isTopComment,
                  'mt-[-3px]': isSubComment,
                },
                'avatar absolute top-0 left-0',
              )}
            >
              <Avatar
                className="block"
                url={comment.extra.userProfile.avatar}
                size={isSubComment ? 28 : 34}
              />
            </div>
          </UserCard>
          <div
            className={classNames({
              'ml-[7px]': isSubComment,
              'ml-3': !isSubComment,
            })}
            style={{ paddingLeft: isSubComment ? 28 : 34 }}
          >
            <div>
              <div className="text-14 text-gray-99 relative">
                {!isSubComment && (
                  <div>
                    <UserCard
                      userAddress={props.comment.userAddress}
                    >
                      <UserName
                        name={comment.extra.userProfile.name || ''}
                        isPostOwner={
                          comment.userAddress === props.postUserAddress
                        }
                        isTopComment
                      />
                    </UserCard>
                  </div>
                )}
                {isSubComment && (
                  <div>
                    <div
                      className={classNames(
                        {
                          'comment-expand': state.expand,
                        },
                        'comment-body comment text-gray-1e break-all whitespace-pre-wrap ml-[1px] comment-fold',
                      )}
                      ref={commentRef}
                    >
                      <UserName
                        name={comment.extra.userProfile.name || ''}
                        isPostOwner={
                          comment.userAddress === props.postUserAddress
                        }
                      />
                      {threadId
                        && replyComment
                        && threadId !== replyComment.trxId ? (
                          <span>
                            <span className="opacity-80 mx-1">{lang.reply}</span>
                            <UserName
                              name={replyComment?.extra.userProfile.name || ''}
                              isPostOwner={
                                replyComment.userAddress
                              === props.postUserAddress
                              }
                              isReplyTo
                            />
                            ：
                          </span>
                        )
                        : '：'}
                      <span
                        dangerouslySetInnerHTML={{
                          __html: urlify(`${comment.content}`),
                        }}
                      />
                      {comment.images && comment.images.length > 0 && (
                        <span
                          className="mx-[6px] text-blue-400 opacity-90 cursor-pointer"
                          onClick={() => {
                            openPhotoSwipe({
                              image: Base64.getUrl((comment.images || [])[0]!),
                            });
                          }}
                        >
                          {lang.openImage}
                        </span>
                      )}
                    </div>

                    {!state.expand && state.canExpand && (
                      <div
                        className="text-blue-400 cursor-pointer pt-[6px] pb-[2px] ml-[1px] flex items-center text-12"
                        onClick={() => { state.expand = true; }}
                      >
                        {lang.expand}
                        <BsFillCaretDownFill className="text-12 ml-[1px] opacity-70" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div>
              {!isSubComment && (
                <div className="mb-1">
                  <div
                    className={classNames(
                      {
                        'comment-expand': state.expand,
                        'pr-1': isSubComment,
                      },
                      'comment-body comment text-gray-1e break-words whitespace-pre-wrap comment-fold',
                    )}
                    ref={commentRef}
                    dangerouslySetInnerHTML={{
                      __html: comment.content,
                    }}
                  />

                  {comment.images && comment.images.length > 0 && (
                    <div className="pt-2 pb-1">
                      <Images images={comment.images} />
                    </div>
                  )}

                  {!state.expand && state.canExpand && (
                    <div
                      className="text-blue-400 cursor-pointer pt-1 flex items-center text-12"
                      onClick={() => { state.expand = true; }}
                    >
                      {lang.expand}
                      <BsFillCaretDownFill className="text-12 ml-[1px] opacity-70" />
                    </div>
                  )}
                </div>
              )}
              <div className="items-center text-gray-af leading-none mt-2 h-3 relative w-full flex">
                <div
                  className="text-12 mr-3 tracking-wide opacity-90"
                >
                  {ago(comment.timestamp)}
                </div>
                {!props.disabledReply && !(isSubComment && comment.userAddress === userStore.address) && (
                  <span
                    className={classNames(
                      {
                        'hidden group-hover:flex': isSubComment,
                      },
                      'flex items-center cursor-pointer justify-center w-10 tracking-wide',
                    )}
                    onClick={() => {
                      modalStore.commentReply.show({
                        postUserAddress: props.postUserAddress,
                        comment,
                        submit: props.submit,
                        where: props.where
                      });
                    }}
                  >
                    <span className="flex items-center text-12 pr-1">{lang.reply}</span>
                  </span>
                )}
                <div
                  className={classNames(
                    {
                      'hidden group-hover:flex': isSubComment,
                    },
                    'flex items-center cursor-pointer justify-center w-10 tracking-wide leading-none',
                  )}
                  onClick={() => updateCounter(comment.trxId)}
                >
                  <span className="flex items-center text-14 pr-[3px]">
                    {comment.extra.liked ? (
                      <RiThumbUpFill className="text-black opacity-60" />
                    ) : (
                      <RiThumbUpLine />
                    )}
                  </span>
                  <span className="text-12 text-gray-9b mr-[1px]">
                    {comment.likeCount || ''}
                  </span>
                </div>
                <div
                  className={classNames(
                    {
                      'hidden group-hover:flex': isSubComment,
                    },
                    'flex items-center cursor-pointer justify-center w-10 tracking-wide leading-none',
                  )}
                  onClick={() => {
                    copy(`${window.origin}/${groupStore.groupId}/posts/${comment.objectId}?commentId=${comment.trxId}`);
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
                    <div className="flex items-center text-14 pr-[6px]">
                      <AiOutlineLink />
                    </div>
                  </Tooltip>
                </div>
                <div className='ml-1'>
                  <ContentSyncStatus
                    trxId={comment.trxId}
                  storage={comment.storage}
                    SyncedComponent={() => (
                      <TrxInfo trxId={comment.trxId} />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fade>
  );
});
