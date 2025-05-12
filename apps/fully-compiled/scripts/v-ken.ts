import type { TemplateChildNode } from '@vue/compiler-core'
import {
  CREATE_COMMENT,
  CREATE_TEXT,
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

const PATCH_FLAGS = {
  STABLE_FRAGMENT: 64,
} as const

const DIRECTIVE_NODES = {
  KEN: 'ken',
} as const

export const transformKen = createStructuralDirectiveTransform(
  DIRECTIVE_NODES.KEN,
  (node, dir, context) => {
    console.log('-----------')
    console.log(node)
    console.log(dir)
    const conditionExp = dir.exp!

    const { helper } = context

    const wrapNode = createConditionalExpression(
      createCompoundExpression([conditionExp]),
      createVNodeCall(
        context, // 编译上下文对象，包含编译过程中的各种配置、工具函数和状态信息
        helper(FRAGMENT), // 组件或标签名，这里通过 helper 函数获取 FRAGMENT 对应的辅助函数，用于创建片段节点
        undefined, // 节点的属性和事件对象，这里传入 undefined 表示没有额外的属性和事件
        [
          createCallExpression(helper(CREATE_TEXT), [
            '"abc"', // 文本内容
            'true', // 是否为静态文本，true 表示静态文本
          ]) as any,
        ], // 子节点数组，这里将当前处理的节点作为子节点传入
        PATCH_FLAGS.STABLE_FRAGMENT, // 补丁标记，用于优化虚拟 DOM 的 diff 过程，STABLE_FRAGMENT 表示片段内容稳定
        undefined, // 动态属性名数组，用于标记哪些属性是动态的，传入 undefined 表示没有动态属性
        undefined, // 动态类名，传入 undefined 表示没有动态类名
        true, // 是否为自闭合标签，true 表示自闭合
        false, // 是否为静态节点，false 表示不是静态节点
        false, // 是否为组件节点，false 表示不是组件节点
        node.loc, // 节点在模板中的位置信息，用于错误提示和调试
      ),
      createVNodeCall(
        context, // 编译上下文对象，包含编译过程中的各种配置、工具函数和状态信息
        helper(FRAGMENT), // 组件或标签名，这里通过 helper 函数获取 FRAGMENT 对应的辅助函数，用于创建片段节点
        undefined, // 节点的属性和事件对象，这里传入 undefined 表示没有额外的属性和事件
        [
          createCallExpression(helper(CREATE_TEXT), [
            '"def"', // 文本内容
            'true', // 是否为静态文本，true 表示静态文本
          ]) as any,
        ], // 子节点数组，这里将当前处理的节点作为子节点传入
        PATCH_FLAGS.STABLE_FRAGMENT, // 补丁标记，用于优化虚拟 DOM 的 diff 过程，STABLE_FRAGMENT 表示片段内容稳定
        undefined, // 动态属性名数组，用于标记哪些属性是动态的，传入 undefined 表示没有动态属性
        undefined, // 动态类名，传入 undefined 表示没有动态类名
        true, // 是否为自闭合标签，true 表示自闭合
        false, // 是否为静态节点，false 表示不是静态节点
        false, // 是否为组件节点，false 表示不是组件节点
        node.loc, // 节点在模板中的位置信息，用于错误提示和调试
      ),
      // 创建一个调用表达式，调用 CREATE_COMMENT 辅助函数创建注释节点
      // createCallExpression(helper(CREATE_TEXT), [
      //   '"v-show-if"', // 注释内容
      //   'true', // 是否为静态注释，true 表示静态注释
      // ]),
    )

    // wrapNode = createCompoundExpression([conditionExp])

    console.log('wrapNode', wrapNode)

    const _context = Object.assign({}, context)
    context.replaceNode(<TemplateChildNode><unknown>wrapNode)

    return () => {
      if (!node.codegenNode) {
        traverseNode(node, _context)
      }
    }
  },
)
