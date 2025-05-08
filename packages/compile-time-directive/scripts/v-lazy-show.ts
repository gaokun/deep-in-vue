import type { TemplateChildNode } from '@vue/compiler-core'
import {
  CREATE_COMMENT,
  createCallExpression,
  createCompoundExpression,
  createConditionalExpression,
  createSequenceExpression,
  createSimpleExpression,
  createStructuralDirectiveTransform,
  createVNodeCall,
  FRAGMENT,
  traverseNode,
} from '@vue/compiler-core'

const indexMap = new WeakMap()

const PATCH_FLAGS = {
  STABLE_FRAGMENT: 64,
} as const

const DIRECTIVE_NODES = {
  SHOW: 'show',
} as const

export const transformLazyShow = createStructuralDirectiveTransform(
  /^(lazy-show|show)$/,
  (node, dir, context) => {
    console.log('transformLazyShow', '===========================')
    console.log(new Date().toLocaleString())
    // console.log('transformLazyShow node', node)
    // console.log('transformLazyShow dir', dir)
    // console.log('transformLazyShow context', context)
    console.log('name', dir.name, JSON.stringify(dir.modifiers, null, ' '))
    console.log('exp', dir.exp)
    console.log('node.props', node.props)

    // 检查当前指令是否为普通的 v-show 指令（即没有 lazy 修饰符）
    if (dir.name === DIRECTIVE_NODES.SHOW && !dir.modifiers.some(i => i.content === 'lazy')) {
      // 若是普通 v-show 指令，返回一个回调函数
      // 该回调函数会在后续处理阶段将原始指令添加到节点的属性列表中
      return () => {
        node.props.push(dir)
      }
    }

    // 根据当前指令名称确定要显示的指令名称
    // 若当前指令为 v-show，则显示为 v-show.lazy；否则显示为 v-lazy-show
    const directiveName = dir.name === DIRECTIVE_NODES.SHOW
      ? 'v-show.lazy'
      : 'v-lazy-show'

    // 检查当前节点标签是否为 template
    if (node.tag === 'template') {
      // 若为 template 标签，抛出错误提示 v-lazy-show 或 v-show.lazy 不能用于 template 标签
      throw new Error(`${directiveName} can not be used on <template>`)
    }

    // 提取指令的表达式，使用非空断言操作符确保表达式存在
    const conditionExp = dir.exp!

    // 遍历节点的所有属性
    node.props
      .forEach((prop) => {
        // 若属性名称为 on（通常表示事件监听器），跳过当前属性的处理
        if (prop.name === 'on') {
          return
        }
        // 检查属性对象是否包含 exp 属性，且 exp 属性存在，
        // 同时 exp 属性包含 content 属性和 loc.source 属性
        if ('exp' in prop && prop.exp && 'content' in prop.exp && prop.exp.loc.source) {
          // 若满足条件，将属性的表达式替换为基于原始源代码的简单表达式
          prop.exp = createSimpleExpression(prop.exp.loc.source)
        }
      })

    // 检查指令表达式的源代码是否存在
    if (conditionExp.loc.source) {
      // 若存在，将指令的表达式替换为基于原始源代码的简单表达式
      dir.exp = createSimpleExpression(conditionExp.loc.source)
    }

    if (context.ssr || context.inSSR) {
      const ssrTransformIf = context.nodeTransforms[0]

      node.props
        .push({
          ...dir,
          modifiers: dir.modifiers.filter(modifier => modifier.content !== 'lazy'),
          name: 'if',
        })

      ssrTransformIf(node, context)
      return
    }

    const { helper } = context
    const keyIndex = (indexMap.get(context.root) ?? 0) + 1
    indexMap.set(context.root, keyIndex)

    const key = `_lazyshow${keyIndex}`

    const wrapNode = createConditionalExpression(
      createCompoundExpression([`_cache.${key}`, ' || ', conditionExp]),
      createSequenceExpression([
        createCompoundExpression([`_cache.${key} = true`]),
        // 创建一个虚拟节点调用表达式，用于生成虚拟 DOM 节点
        createVNodeCall(
          context, // 编译上下文对象，包含编译过程中的各种配置、工具函数和状态信息
          helper(FRAGMENT), // 组件或标签名，这里通过 helper 函数获取 FRAGMENT 对应的辅助函数，用于创建片段节点
          undefined, // 节点的属性和事件对象，这里传入 undefined 表示没有额外的属性和事件
          [node], // 子节点数组，这里将当前处理的节点作为子节点传入
          PATCH_FLAGS.STABLE_FRAGMENT, // 补丁标记，用于优化虚拟 DOM 的 diff 过程，STABLE_FRAGMENT 表示片段内容稳定
          undefined, // 动态属性名数组，用于标记哪些属性是动态的，传入 undefined 表示没有动态属性
          undefined, // 动态类名，传入 undefined 表示没有动态类名
          true, // 是否为自闭合标签，true 表示自闭合
          false, // 是否为静态节点，false 表示不是静态节点
          false, // 是否为组件节点，false 表示不是组件节点
          node.loc, // 节点在模板中的位置信息，用于错误提示和调试
        ),
      ]),
      // 创建一个调用表达式，调用 CREATE_COMMENT 辅助函数创建注释节点
      createCallExpression(helper(CREATE_COMMENT), [
        '"v-show-if"', // 注释内容
        'true', // 是否为静态注释，true 表示静态注释
      ]),
    )

    // 将修改后的指令添加到节点的属性列表中
    node.props.push({
      // 使用扩展运算符展开原始指令对象 dir 的所有属性
      ...dir,
      // 过滤掉指令修饰符中的 'lazy' 修饰符，将指令转换为普通 v-show 指令
      modifiers: dir.modifiers.filter(modifier => modifier.content !== 'lazy'),
      // 将指令名称设置为 'show'，即转换为标准的 v-show 指令
      name: DIRECTIVE_NODES.SHOW,
    })

    // 创建一个新的上下文对象，避免修改原始上下文
    const _context = Object.assign({}, context)
    // 用新创建的条件表达式节点替换当前节点
    context.replaceNode(<TemplateChildNode><unknown>wrapNode)

    // 返回一个回调函数，用于后续处理
    return () => {
      // 若节点没有代码生成节点，则遍历节点以生成代码
      if (!node.codegenNode) {
        traverseNode(node, _context)
      }
    }
  },
)
