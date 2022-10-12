import { observer } from 'mobx-react-lite';
import { MdChevronLeft } from 'react-icons/md';
import { useHistory } from 'react-router-dom';
import { useStore } from 'store';

export default observer(() => {
  const history = useHistory();
  const { groupStore, pathStore } = useStore();

  return (
    <div>
      <div className="h-[44px] w-screen" />
      <div className="h-[44px] bg-white flex items-center border-b border-gray-ec fixed top-0 left-0 right-0 z-[20]" onClick={() => {
        pathStore.prevPath ? history.goBack() : history.push(`/${groupStore.groupId}`)
      }}>
        <div className="flex items-center text-30 ml-2 opacity-70">
          <MdChevronLeft />
        </div>
        <span className="mt-[2px] ml-[1px] text-15 opacity-70 leading-none">返回</span>
      </div>
    </div>
  )
})