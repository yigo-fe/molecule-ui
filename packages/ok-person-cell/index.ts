import { setPopover } from '@c/utils'
import { defineComponent, html, onMounted, ref } from 'ok-lit'
import { hideAll } from 'tippy.js'

import { COMMON_CSS_PATH } from '../path.config'
import { apiInitPersoncard } from '../services/api'
// import { personInfo } from '../mock'
/**
 * person: {Person} 用户信息
 * TODO:
 * 头像形状：circle ｜ square
 * 文字头像：背景色自定义
 */
import props from './props'
defineComponent(
  'ok-person-cell',
  {
    ...props,
  },
  (props, contxt) => {
    const api = apiInitPersoncard()
    const toOpenId: any = ref('')
    const isAwaken = ref(false)
    const deptList: any = ref([])
    const statusType: any = ref('')

    const checkLardShow = async (id: string) => {
      let result: any = null
      if (props.propsGetInfoByEmpId) {
        result = await props.propsGetInfoByEmpId(id)
      } else {
        result = await api.default.GetInfoByEmpId({ emp_id: id })
      }

      if (result.code === '000000') {
        const fromOpenId = result.data.from_open_id
        toOpenId.value = result.data.to_open_id
        isAwaken.value = Boolean(fromOpenId && toOpenId.value)
        deptList.value = result.data.dept_resp_vo_list
        statusType.value = result.data.status_type
      }
    }

    const onTrigger = () => {
      if (toOpenId.value) return
      const personInfo: any = props.personInfo
      const id =
        personInfo.employee_id ||
        personInfo.user_id ||
        personInfo.id ||
        personInfo.employee_number

      id && checkLardShow(id)
      // 隐藏之前的Popper，解决person-group中可能同时出现两个Popper的问题
      props.hidePopper &&
        hideAll({
          exclude: contxt.$refs['ok-person-trigger'] as HTMLElement,
          duration: 0,
        })
    }
    onMounted(() => {
      setPopover(
        contxt.$refs['ok-person-trigger'] as HTMLElement,
        contxt.$refs['person-card'] as HTMLElement,
        {
          appendTo: document.body,
          popperOptions: {
            strategy: 'fixed',
          },
          onTrigger: onTrigger,
        }
      )
    })
    return () => html`
      <link rel="stylesheet" .href="${COMMON_CSS_PATH}" />
      <span ref="ok-person-trigger" class="ok-person-cell ok-person-cell-root">
        <slot>
          <ok-avatar
            .personInfo=${props.personInfo}
            .size=${props.size}
            .width=${props.width}
            .height=${props.height}
          ></ok-avatar>
        </slot>
      </span>
      <ok-person-card
        ref="person-card"
        .personInfo=${props.personInfo}
        .toOpenId=${toOpenId.value}
        .isAwaken=${isAwaken.value}
        .deptList=${deptList.value}
        .statusType=${statusType.value}
      ></ok-person-card>
    `
  }
)
