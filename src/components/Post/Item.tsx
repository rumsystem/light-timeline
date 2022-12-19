import React from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import classNames from 'classnames';
import scrollIntoView from 'scroll-into-view-if-needed';
import { BsFillCaretDownFill, BsFillCaretUpFill } from 'react-icons/bs';
import { IPost } from 'apis/types';
import ItemBottom from './ItemBottom';
import openPhotoSwipe from 'components/openPhotoSwipe';
import Avatar from 'components/Avatar';
import UserCard from 'components/UserCard';
import { lang } from 'utils/lang';
import sleep from 'utils/sleep';
import { isMobile, isPc } from 'utils/env';
import ago from 'utils/ago';
import Fade from '@material-ui/core/Fade';
import urlify from 'utils/urlify';
import { useHistory } from 'react-router-dom';
import BFSReplace from 'utils/BFSReplace';
import Query from 'utils/query';
import escapeStringRegexp from 'escape-string-regexp';
import UserName from 'components/UserName';

import './index.css';

interface IProps {
  post: IPost
  where: 'postList' | 'postDetail' | 'postDetailModal'
  inModal?: boolean
  disabledUserCardTooltip?: boolean
  withBorder?: boolean
  hideBottom?: boolean
}

const Images = observer((props: { images: string[] }) => {
  const count = props.images.length;

  return (
    <div className={classNames({
      count_1: count === 1,
      'grid grid-cols-2 gap-1': count === 2,
      'grid grid-cols-3 gap-1': count === 3,
      'grid grid-rows-2 grid-cols-2 gap-1': count === 4,
    }, 'rounded-12 overflow-hidden max-w-[70vw] md:max-w-[100%]')}
    >
      {props.images.map((image: string, index) => {
        const url = image;
        const onClick = () => {
          openPhotoSwipe({
            image: props.images,
            index,
          });
        };
        const divRef = React.useRef(null);
        return (
          <div key={index}>
            {count === 1 && (
              <div
                className="rounded-12"
                ref={divRef}
                style={{
                  background: `url(${url}) center center / cover no-repeat rgba(64, 64, 64, 0.6)`,
                }}
                onClick={onClick}
              >
                <img
                  className="cursor-pointer opacity-0 absolute top-[-9999px] left-[-9999px]"
                  src={url}
                  alt={`${index}`}
                  onLoad={(e: any) => {
                    const div: any = divRef.current;
                    const { width, height } = e.target;
                    let _height = height;
                    let _width = width;
                    const MAX_WIDTH = isMobile ? window.innerWidth * 2/3 : 350;
                    const MAX_HEIGHT = isMobile ? window.innerWidth * 2/3 : 350;
                    if (width > MAX_WIDTH) {
                      _width = MAX_WIDTH;
                      _height = Math.round((_width * height) / width);
                    }
                    if (_height > MAX_HEIGHT) {
                      _height = MAX_HEIGHT;
                      _width = Math.round((_height * width) / height);
                    }
                    _width = Math.max(_width, 100);
                    div.style.width = `${_width}px`;
                    div.style.height = `${_height}px`;
                    e.target.style.position = 'static';
                    e.target.style.top = 0;
                    e.target.style.left = 0;
                    e.target.style.width = '100%';
                    e.target.style.height = '100%';
                  }}

                />
              </div>
            )}
            {count === 2 && (
              <div
                className="h-[35vw] md:h-45 overflow-hidden"
                style={{
                  background: `url(${url}) center center / cover no-repeat rgba(64, 64, 64, 0.6)`,
                }}
                onClick={onClick}
              >
                <img className="w-full h-full opacity-0" src={url} alt="" />
              </div>
            )}
            {count === 3 && (
              <div
                className="h-[45vw] md:h-50 overflow-hidden"
                style={{
                  background: `url(${url}) center center / cover no-repeat rgba(64, 64, 64, 0.6)`,
                }}
                onClick={onClick}
              >
                <img className="w-full h-full opacity-0" src={url} alt="" />
              </div>
            )}
            {count === 4 && (
              <div
                className="h-[32vw] md:h-34 overflow-hidden"
                style={{
                  background: `url(${url}) center center / cover no-repeat rgba(64, 64, 64, 0.6)`,
                }}
                onClick={onClick}
              >
                <img className="w-full h-full opacity-0" src={url} alt="" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default observer((props: IProps) => {
  const { post } = props;
  const inPostDetail = props.where.startsWith('postDetail');
  const state = useLocalObservable(() => ({
    canExpandContent: false,
    expandContent: inPostDetail || false,
  }));
  const postBoxRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const profile = post.extra!.userProfile;
  const history = useHistory();
  const isTweet = (post.title || '').startsWith('https://twitter.com')

  React.useEffect(() => {
    if (inPostDetail || !post.content) {
      return;
    }
    if (
      contentRef.current
      && contentRef.current.scrollHeight > contentRef.current.clientHeight
    ) {
      state.canExpandContent = true;
    } else {
      state.canExpandContent = false;
    }
  }, [post.content]);

  React.useEffect(() => {
    setTimeout(() => {
      if (!Query.get('q')) {
        return; 
      }
      const box = contentRef.current;
      if (box) {
        BFSReplace(
          box,
          new RegExp(escapeStringRegexp(Query.get('q')), 'ig'),
          (text: string) => {
            const span = document.createElement('span');
            span.textContent = text;
            span.className = 'text-amber-500 font-bold';
            return span;
          },
        );
      }
    }, 10);
  }, []);

  return (
    <Fade in={true} timeout={350}>          
      <div
        className={classNames({
          'border border-gray-f2': isPc && props.withBorder,
          'border-b border-gray-ec': isMobile && !inPostDetail
        }, 'post-item md:rounded-10 bg-white pl-4 pr-2 md:pl-8 md:pr-6 pt-6 pb-3 w-full lg:w-full md:w-[600px] relative mb-0 md:mb-[10px]')}
        ref={postBoxRef}
      >
        <div className="relative">
          <UserCard
            disableHover={props.disabledUserCardTooltip}
            userAddress={post.userAddress}
          >
            <Avatar
              className="absolute top-[-6px] left-[-4px]"
              url={profile.avatar}
              size={44}
            />
          </UserCard>
          <div className="pl-12 ml-1">
            <div className="pt-[1px]">
              <UserCard
                disableHover={props.disabledUserCardTooltip}
                userAddress={post.userAddress}
              >
                <div className="text-gray-4a md:text-15">
                  <UserName
                    name={profile.name}
                    normalNameClass="font-bold max-w-[60vw] md:max-w-[250px] truncate opacity-80 mt-[-4px] h-[18px] md:h-[20px]"
                    fromClass='mt-[-2px] h-[15px] md:h-[17px]'
                    fromNameClass="opacity-80 truncate font-bold max-w-[120px] md:max-w-[250px]"
                    fromIconClass="text-22 text-sky-400 mx-1"
                    fromIdClass="opacity-50 truncate text-13 md:text-14 max-w-[120px] md:max-w-[160px]"
                    />
                </div>
              </UserCard>
            </div>
            <div
              className="text-gray-88 text-12 tracking-wide cursor-pointer mt-[6px] opacity-80 block md:hidden"
              onClick={() => {
                if (isMobile) {
                  history.push(`/posts/${post.trxId}`);
                }
              }}
            >
              {ago(post.timestamp, {
                trimmed: true
              })}
            </div>
            {post.content && (
              <div className="pb-2 relative">
                <div
                  ref={contentRef}
                  key={post.content}
                  className={classNames(
                    {
                      expandContent: state.expandContent,
                      fold: !state.expandContent,
                      'text-[15px]': inPostDetail,
                      'text-[14px]': !inPostDetail
                    },
                    'mt-[8px] text-gray-4a break-word whitespace-pre-wrap tracking-wide',
                  )}
                  dangerouslySetInnerHTML={{
                    __html: urlify(`${post.content}`) +`${isTweet ? ` <a class="text-sky-400 text-12" href="${post.title || ''}">查看原文</a>` : ''}`,
                  }}
                  onClick={() => {
                    if (isMobile) {
                      history.push(`/posts/${post.trxId}`);
                    }
                  }}
                />
                {!state.expandContent && state.canExpandContent && (
                  <div className="relative mt-6-px pb-4">
                    <div
                      className="text-sky-400 cursor-pointer tracking-wide flex items-center text-12 absolute w-full top-1 left-0 mt-[-6px]"
                      onClick={() => { state.expandContent = true; }}
                    >
                      {lang.expand}
                      <BsFillCaretDownFill className="text-12 ml-[1px] opacity-70" />
                    </div>
                  </div>
                )}
                {state.expandContent && state.canExpandContent && (
                  <div className="relative mt-6-px pb-4">
                    <div
                      className="text-sky-400 cursor-pointer tracking-wide flex items-center text-12 absolute w-full top-1 left-0 mt-[-6px]"
                      onClick={async () => {
                        state.expandContent = false;
                        await sleep(1);
                        scrollIntoView(postBoxRef.current!, { scrollMode: 'if-needed' });
                      }}
                    >
                      {lang.shrink}
                      <BsFillCaretUpFill className="text-12 ml-[1px] opacity-70" />
                    </div>
                  </div>
                )}
                {isPc && state.expandContent && state.canExpandContent && post.content.length > 600 && (
                  <div
                    className="text-sky-400 cursor-pointer tracking-wide flex items-center text-12 absolute top-[2px] right-[-90px] opacity-80"
                    onClick={() => {
                      state.expandContent = false;
                    }}
                  >
                    {lang.shrink}
                    <BsFillCaretUpFill className="text-12 ml-[1px] opacity-70" />
                  </div>
                )}
              </div>
            )}
            {!post.content && <div className="pb-3" />}
            {(post.images || []).length > 0 && <div className="pb-2">
              <Images images={post.images || []} />
            </div>}

            <div className="flex pt-1 pb-2 tracking-wider">
              <div className="bg-stone-100 text-12 py-1 px-2 flex items-center rounded-full cursor-pointer" onClick={() => {
                history.push(`/groups/${post.groupId}`)
              }}>
                <div className="w-[12px] h-[12px] bg-sky-400 rounded-full mr-[6px] opacity-60" />
                <span className="text-sky-400 font-bold opacity-80">{post.extra.groupName}</span>
              </div>
            </div>
          </div>
        </div>

        <ItemBottom
          post={post}
          where={props.where}
          hideBottom={props.hideBottom}
        />
      </div>
    </Fade>
  );
});
