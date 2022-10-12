import React from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import classNames from 'classnames';
import scrollIntoView from 'scroll-into-view-if-needed';
import { BsFillCaretDownFill, BsFillCaretUpFill } from 'react-icons/bs';
import { IPost, IImage } from 'apis/types';
import ItemBottom from './ItemBottom';
import openPhotoSwipe from 'components/openPhotoSwipe';
import Avatar from 'components/Avatar';
import UserCard from 'components/UserCard';
import { lang } from 'utils/lang';
import Base64 from 'utils/base64';
import sleep from 'utils/sleep';
import { isMobile, isPc } from 'utils/env';
import ago from 'utils/ago';
import Fade from '@material-ui/core/Fade';
import urlify from 'utils/urlify';
import { useHistory } from 'react-router-dom';

import './index.css';

interface IProps {
  post: IPost
  where: 'postList' | 'postDetail' | 'postDetailModal'
  inModal?: boolean
  disabledUserCardTooltip?: boolean
  withBorder?: boolean
  hideBottom?: boolean
}

const Images = observer((props: { images: IImage[] }) => {
  const count = props.images.length;

  return (
    <div className={classNames({
      count_1: count === 1,
      'grid grid-cols-2 gap-1': count === 2,
      'grid grid-cols-3 gap-1': count === 3,
      'grid grid-rows-2 grid-cols-2 gap-1': count === 4,
    }, 'rounded-12 overflow-hidden max-w-[70vw] md:max-w-[100%]')}
    >
      {props.images.map((item: IImage, index: number) => {
        const url = Base64.getUrl(item);
        const onClick = () => {
          openPhotoSwipe({
            image: props.images.map((image: IImage) => Base64.getUrl(image)),
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
                  alt={item.name}
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
  const objectRef = React.useRef<HTMLDivElement>(null);
  const searchText = '';
  const profile = post.extra!.userProfile;
  const history = useHistory();

  React.useEffect(() => {
    if (inPostDetail || !post.content) {
      return;
    }
    if (
      objectRef.current
      && objectRef.current.scrollHeight > objectRef.current.clientHeight
    ) {
      state.canExpandContent = true;
    } else {
      state.canExpandContent = false;
    }
  }, [post.content]);

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
            <div className="leading-none pt-[1px]">
              <UserCard
                disableHover={props.disabledUserCardTooltip}
                userAddress={post.userAddress}
                className="inline-block"
              >
                <div className="text-gray-4a font-bold max-w-40 truncate opacity-80 md:opacity-100 inline-block">
                  {profile.name}
                </div>
              </UserCard>
            </div>
            <div
              className="text-gray-88 text-12 tracking-wide cursor-pointer mt-[6px] opacity-80 block md:hidden"
              onClick={() => {
                if (isMobile) {
                  history.push(`/${post.groupId}/posts/${post.trxId}`);
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
                  ref={objectRef}
                  key={post.content + searchText}
                  className={classNames(
                    {
                      expandContent: state.expandContent,
                      fold: !state.expandContent,
                      'text-[15px]': inPostDetail,
                      'text-[14px]': !inPostDetail
                    },
                    'mt-[8px] text-gray-4a break-all whitespace-pre-wrap tracking-wide',
                  )}
                  dangerouslySetInnerHTML={{
                    __html: urlify(`${post.content}`),
                  }}
                  onClick={() => {
                    if (isMobile) {
                      history.push(`/${post.groupId}/posts/${post.trxId}`);
                    }
                  }}
                />
                {!state.expandContent && state.canExpandContent && (
                  <div className="relative mt-6-px pb-2">
                    <div
                      className="text-blue-400 cursor-pointer tracking-wide flex items-center text-12 absolute w-full top-1 left-0 mt-[-6px]"
                      onClick={() => { state.expandContent = true; }}
                    >
                      {lang.expand}
                      <BsFillCaretDownFill className="text-12 ml-[1px] opacity-70" />
                    </div>
                  </div>
                )}
                {state.expandContent && state.canExpandContent && (
                  <div className="relative mt-6-px pb-2">
                    <div
                      className="text-blue-400 cursor-pointer tracking-wide flex items-center text-12 absolute w-full top-1 left-0 mt-[-6px]"
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
                {state.expandContent && state.canExpandContent && post.content.length > 600 && (
                  <div
                    className="text-blue-400 cursor-pointer tracking-wide flex items-center text-12 absolute top-[2px] right-[-90px] opacity-80"
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
            {post.images && <div className="pb-2">
              <Images images={post.images} />
            </div>}
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
