import { icebreaker } from '@icebreakers/eslint-config'

export default icebreaker(
  {
    vue: true,
    ignores: [
      '**/fixtures/**',
      'apps/only-vue-runtime/public',
      'docs/**/*.md',
    ],
  },
  {
   
    rules: {
      'vue/one-component-per-file': 'off',

    },
  },
)
