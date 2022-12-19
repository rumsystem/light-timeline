import { AiOutlineTwitter } from 'react-icons/ai';
import Tooltip from '@material-ui/core/Tooltip';

interface IProps {
  name: string
  normalNameClass?: string
  fromClass?: string
  fromNameClass?: string
  fromIconClass?: string
  fromIdClass?: string
}

export default (props: IProps) => {
  const name = props.name || '';
  const isTweet = name.includes('\n@');
  if (!isTweet) {
    return (
      <div className={props.normalNameClass}>
        {name}
      </div>
    )
  }
  return (
    <div className={`flex items-center ${props.fromClass}`}>
      <span className={props.fromNameClass}>{name.split('\n@')[0]}</span>
      <Tooltip
        enterDelay={200}
        enterNextDelay={200}
        placement="top"
        title='本号所有内容来自同名推特'
        arrow
        >
        <div className="mt-[-1px]">
          <AiOutlineTwitter className={props.fromIconClass} />
        </div>
      </Tooltip>
      <span className={props.fromIdClass}>@{name.split('\n@')[1]}</span>
    </div>
  )
}