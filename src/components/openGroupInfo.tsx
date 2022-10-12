import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { observer, useLocalObservable } from 'mobx-react-lite';
import Dialog from 'components/Dialog';
import { StoreProvider } from 'store';
import { ThemeRoot } from 'utils/theme';
import { lang } from 'utils/lang';
import { IGroup, IContent } from 'apis/types';
import { GroupApi, ContentApi } from 'apis';
import Loading from 'components/Loading';
import { useStore } from 'store';
import Tooltip from '@material-ui/core/Tooltip';
import copy from 'copy-to-clipboard';
import DrawerModal from 'components/DrawerModal';
import { isMobile } from 'utils/env';
import { MdOutlineErrorOutline } from 'react-icons/md';

interface IModalProps {
  groupId: string
  rs: (result: boolean) => void
}

const Modal = observer((props: IModalProps) => {
  const { snackbarStore } = useStore();
  const state = useLocalObservable(() => ({
    group: {} as IGroup,
    loading: true,
    open: false,
    contents: [] as IContent[],
    hasMoreContent: true,
  }));

  React.useEffect(() => {
    setTimeout(() => {
      state.open = true;
    });
  }, []);
  
  React.useEffect(() => {
    (async () => {
      try {
        const group = await GroupApi.get(props.groupId);
        await fetchMoreContents();
        state.group = group;
      } catch (err) {
        console.log(err);
        snackbarStore.show({
          message: lang.somethingWrong,
          type: 'error',
        });
      }
      state.loading = false;
    })();
  }, []);

  const fetchMoreContents = async () => {
    try {
      const contents = await ContentApi.list(props.groupId, {
        offset: state.contents.length,
        limit: 10
      });
      for (const content of contents) {
        try {
          if (content.Data.content && content.Data.content.length > 30) {
            content.Data.content = content.Data.content.slice(0, 20) + '...';
          }
          if (content.Data.image && content.Data.image.length > 0) {
            (content.Data.image as any) = [{ content: '...' }];
          }
          if ((content.Data.image as any).content) {
            (content.Data.image as any) = { content: '...' }
          }
        } catch (_) {}
      }
      state.contents.push(...contents);
      if (contents.length < 10) {
        state.hasMoreContent = false;
      }
    } catch (err) {
      console.log(err);
    }
  }

  const handleClose = (result: any) => {
    state.open = false;
    props.rs(result);
  };

  const main = () => (
    <div className="h-[90vh] md:h-[70vh] overflow-y-auto bg-white rounded-0 p-8 px-5 md:px-10 box-border">
      <div className="w-full md:w-[455px]">
        {state.loading && (
          <div className="py-32">
            <Loading />
          </div>
        )}
        {!state.loading && (
          <div>
            <div className="text-18 font-bold text-gray-700 text-center">
              <div className="flex items-center justify-center">
                {state.group.groupName}
              </div>
              <div className="mt-1 text-12 opacity-40">
                {state.group.groupId}
              </div>
            </div>
            <div className="mt-8">
              <div className="flex">
                <div className="text-gray-500 font-bold bg-gray-100 rounded-0 pt-2 pb-3 px-4">
                  节点
                </div>
              </div>
              <div className="-mt-3 justify-center bg-gray-100 rounded-0 pt-3 px-4 md:px-6 pb-3 leading-7 tracking-wide">
                {state.group.status === 'disconnected' && (
                  <div className="flex items-center justify-center bg-red-400 text-white px-2 text-12 rounded-12 mb-2 py-1 leading-none">
                    <MdOutlineErrorOutline className="mr-1 text-18" /> 节点都访问不了，无法连接
                  </div>
                )}
                {state.group.extra.rawGroup.chainAPIs.map((api, i) => (
                  <Tooltip
                    key={api}
                    enterDelay={300}
                    enterNextDelay={300}
                    placement="left"
                    title="点击复制"
                    arrow
                    interactive
                  >
                    <div className="flex items-center py-[2px] cursor-pointer" onClick={() => {
                      copy(api);
                      snackbarStore.show({
                        message: lang.copied,
                      });
                    }}>
                      <div className="w-[22px] h-[22px] box-border flex items-center justify-center bg-black text-white text-12 mr-[10px] rounded-full opacity-90">{i + 1}</div>
                      <div className="text-12 md:text-13 text-gray-88 flex-1 pr-2 truncate">{api}</div>
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>
            {state.contents.length > 0 && (
              <div className="mt-8">
                <div className="flex">
                  <div className="text-gray-500 font-bold bg-gray-100 rounded-0 pt-2 pb-3 px-4">
                    区块
                  </div>
                </div>
                <div className="-mt-3 justify-center bg-gray-100 rounded-0 pt-3 px-4 md:px-6 pb-3 leading-7 tracking-wide">
                  {state.contents.map((content, index) => (
                    <Tooltip
                      key={content.id}
                      enterDelay={300}
                      enterNextDelay={300}
                      placement="left"
                      title={
                        <div className="py-5 mx-4 text-12 tracking-wide text-left w-[200px] overflow-x-auto leading-5" >
                          <pre dangerouslySetInnerHTML={{ __html: JSON.stringify(content.Data, null, 2) }} />
                        </div>
                      }
                      arrow
                      interactive
                      >
                      <div className="flex items-center py-[2px] cursor-pointer" onClick={() => {
                        copy(JSON.stringify(content.Data));
                        snackbarStore.show({
                          message: lang.copied,
                        });
                      }}>
                        <div className="min-w-[22px] h-[22px] py-1 px-2 box-border flex items-center justify-center bg-black text-white text-12 mr-[10px] rounded-full opacity-90">{state.group.contentCount - index}</div>
                        <span className="text-12 md:text-13 text-gray-88 truncate">{content.TrxId}</span>
                      </div>
                    </Tooltip>
                  ))}
                  {state.hasMoreContent && (
                    <div className="text-center pt-1 text-12" onClick={fetchMoreContents}>
                      <span className="text-blue-400 cursor-pointer">加载更多</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <DrawerModal open={state.open} onClose={() => handleClose(false)}>
        {main()}
      </DrawerModal>
    )
  }

  return (
    <Dialog
      open={state.open}
      onClose={handleClose}
      hideCloseButton
      transitionDuration={{
        enter: 300,
      }}
    >
      {main()}
    </Dialog>
  );
});

export default async (groupId: string) => {
  const div = document.createElement('div');
  document.body.append(div);
  const unmount = () => {
    unmountComponentAtNode(div);
    div.remove();
  };
  render(
    (
      <ThemeRoot>
        <StoreProvider>
          <Modal
            groupId={groupId}
            rs={() => {
              setTimeout(unmount, 3000);
            }}
          />
        </StoreProvider>
      </ThemeRoot>
    ),
    div,
  );
};