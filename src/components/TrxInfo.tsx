import { observer } from 'mobx-react-lite';
import { ImInfo } from 'react-icons/im';
import openTrxModal from 'components/openTrxModal';

export default observer((props: { trxId: string }) => (
  <div className="relative w-[18px] h-[14px]">
    <div
      className="absolute top-[-1px] left-0 text-gray-af px-[2px] cursor-pointer"
      onClick={() => openTrxModal({ trxId: props.trxId })}
    >
      <ImInfo className="text-15" />
    </div>
  </div>
));
