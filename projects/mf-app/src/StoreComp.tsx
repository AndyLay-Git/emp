import {observer} from 'mobx-react-lite'
import incStore from './store/incStore'
import css from '@mfHost/css'
const StoreComp = observer(() => {
  return (
    <>
      <p>
        App Store <b>{incStore.num}</b>
      </p>
      <pre>{incStore.code}</pre>
      <button
        className={css.primary}
        onClick={() => {
          incStore.inc()
          incStore.loadData()
        }}
      >
        App 组件 & Host 样式 +1
      </button>
    </>
  )
})
export default StoreComp
